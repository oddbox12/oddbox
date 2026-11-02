import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { GalleryCategory } from "@/types/cms";
import { portfolioCategories } from "@/data/portfolio";
import manifestJson from "@/asset-manifest.json";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "galleryCategories";

// In-memory cache for dev mode / fallback mutations
let memoryCategories: GalleryCategory[] | null = null;

function getInitialFallbackCategories(): GalleryCategory[] {
  // Count items per category from manifest
  const countMap: Record<string, number> = {};
  manifestJson.forEach((item) => {
    countMap[item.category] = (countMap[item.category] || 0) + 1;
  });

  return portfolioCategories.map((cat, idx) => ({
    id: cat.id,
    name: cat.label,
    slug: cat.folder || cat.id,
    description: `${cat.label} photography and cinematic moments by Oddbox Studio.`,
    displayOrder: idx + 1,
    isActive: true,
    itemCount: countMap[cat.folder || cat.id] || cat.count || 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllCategories(): Promise<GalleryCategory[]> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const snapshot = await db.collection(COLLECTION_NAME).orderBy("displayOrder", "asc").get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryCategory[];
      }
    } catch (err) {
      console.warn("Firestore categories fetch failed, using fallback:", err);
    }
  }

  if (!memoryCategories) {
    memoryCategories = getInitialFallbackCategories();
  }
  return [...memoryCategories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getCategoryBySlug(slug: string): Promise<GalleryCategory | null> {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug || c.id === slug) || null;
}

export async function upsertCategory(category: GalleryCategory): Promise<GalleryCategory> {
  const { db, isConfigured } = getFirebaseAdmin();
  const now = new Date().toISOString();
  const updated: GalleryCategory = {
    ...category,
    updatedAt: now,
    createdAt: category.createdAt || now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(updated.id).set(updated, { merge: true });
    } catch (err) {
      console.error("Failed to upsert category in Firestore:", err);
    }
  }

  if (!memoryCategories) {
    memoryCategories = getInitialFallbackCategories();
  }
  const idx = memoryCategories.findIndex((c) => c.id === updated.id);
  if (idx >= 0) {
    memoryCategories[idx] = updated;
  } else {
    memoryCategories.push(updated);
  }

  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).delete();
    } catch (err) {
      console.error("Failed to delete category in Firestore:", err);
    }
  }

  if (!memoryCategories) {
    memoryCategories = getInitialFallbackCategories();
  }
  memoryCategories = memoryCategories.filter((c) => c.id !== id);
  return true;
}
