import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { GalleryItem } from "@/types/cms";
import manifestJson from "@/asset-manifest.json";
import { portfolioCategories } from "@/data/portfolio";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "galleryItems";

let memoryGallery: GalleryItem[] | null = null;

function getInitialFallbackGallery(): GalleryItem[] {
  const categoryMap = new Map<string, string>();
  portfolioCategories.forEach((c) => {
    categoryMap.set(c.id, c.label);
    categoryMap.set(c.folder, c.label);
  });

  return manifestJson.map((item, idx) => ({
    id: item.asset_id || `gallery-${idx + 1}`,
    sourceAssetId: item.asset_id,
    title: item.project || `Oddbox Capture ${idx + 1}`,
    slug: `${item.category}-${item.filename.replace(/\.[^/.]+$/, "")}`,
    projectName: item.project,
    description: `Photograph from ${item.project} collection under ${categoryMap.get(item.category) || item.category}.`,
    categoryId: item.category,
    categoryLabel: categoryMap.get(item.category) || item.category,
    imageUrl:
      (item as any).cloudinary_url ||
      (item as any).web_url_1800 ||
      `/images/${item.category}/${item.filename}`,
    originalSourceUrl: item.original_url,
    webUrl1800: item.web_url_1800,
    filename: item.filename,
    mediaType: "image",
    altText: `${item.project} - Oddbox Studio`,
    displayOrder: idx + 1,
    isFeatured: idx < 6,
    isPublished: true,
    migrationStatus: "verified",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export interface GalleryFilterOptions {
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedGalleryResult {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export async function getPaginatedGallery(
  options: GalleryFilterOptions = {}
): Promise<PaginatedGalleryResult> {
  const { category, isPublished, isFeatured, page = 1, limit = 16, search } = options;
  const { db, isConfigured } = getFirebaseAdmin();

  let allItems: GalleryItem[] = [];

  if (isConfigured && db) {
    try {
      let query: Query = db.collection(COLLECTION_NAME);

      if (category && category !== "all") {
        query = query.where("categoryId", "==", category);
      }
      if (typeof isPublished === "boolean") {
        query = query.where("isPublished", "==", isPublished);
      }
      if (typeof isFeatured === "boolean") {
        query = query.where("isFeatured", "==", isFeatured);
      }

      query = query.orderBy("displayOrder", "asc");

      const snapshot = await query.get();
      if (!snapshot.empty) {
        allItems = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryItem[];
      }
    } catch (err) {
      console.warn("Firestore gallery query fallback:", err);
    }
  }

  // Fallback to local memory / manifest if empty or not configured
  if (allItems.length === 0) {
    if (!memoryGallery) {
      memoryGallery = getInitialFallbackGallery();
    }
    allItems = [...memoryGallery];

    if (category && category !== "all") {
      allItems = allItems.filter((i) => i.categoryId === category);
    }
    if (typeof isPublished === "boolean") {
      allItems = allItems.filter((i) => i.isPublished === isPublished);
    }
    if (typeof isFeatured === "boolean") {
      allItems = allItems.filter((i) => i.isFeatured === isFeatured);
    }
    if (search) {
      const q = search.toLowerCase();
      allItems = allItems.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.projectName.toLowerCase().includes(q) ||
          i.categoryId.toLowerCase().includes(q)
      );
    }
    allItems.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const total = allItems.length;
  const startIndex = (page - 1) * limit;
  const items = allItems.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const doc = await db.collection(COLLECTION_NAME).doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as GalleryItem;
      }
    } catch (err) {
      console.warn("Firestore gallery item fetch failed:", err);
    }
  }

  if (!memoryGallery) {
    memoryGallery = getInitialFallbackGallery();
  }
  return memoryGallery.find((i) => i.id === id) || null;
}

export async function upsertGalleryItem(item: Partial<GalleryItem> & { id: string }): Promise<GalleryItem> {
  const { db, isConfigured } = getFirebaseAdmin();
  const existing = await getGalleryItemById(item.id);
  const now = new Date().toISOString();

  const merged: GalleryItem = {
    ...(existing || {
      id: item.id,
      sourceAssetId: item.sourceAssetId || item.id,
      title: "Untitled",
      slug: `item-${Date.now()}`,
      projectName: "Oddbox Studio",
      categoryId: "couple",
      imageUrl: "",
      filename: "",
      mediaType: "image",
      displayOrder: 999,
      isFeatured: false,
      isPublished: true,
      migrationStatus: "verified",
      createdAt: now,
    }),
    ...item,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(merged.id).set(merged, { merge: true });
    } catch (err) {
      console.error("Firestore upsertGalleryItem failed:", err);
    }
  }

  if (!memoryGallery) {
    memoryGallery = getInitialFallbackGallery();
  }
  const idx = memoryGallery.findIndex((i) => i.id === merged.id);
  if (idx >= 0) {
    memoryGallery[idx] = merged;
  } else {
    memoryGallery.push(merged);
  }

  return merged;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();
  const cleanId = decodeURIComponent(id).trim();

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(cleanId).delete();
      // Also ensure any document matching sourceAssetId is removed
      const snapshot = await db.collection(COLLECTION_NAME).where("sourceAssetId", "==", cleanId).get();
      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.error("Firestore deleteGalleryItem failed:", err);
    }
  }

  if (!memoryGallery) {
    memoryGallery = getInitialFallbackGallery();
  }
  memoryGallery = memoryGallery.filter((i) => i.id !== cleanId && i.sourceAssetId !== cleanId);
  return true;
}

export async function bulkUpdateGalleryOrder(
  orderedItems: Array<{ id: string; displayOrder: number }>
): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const batch = db.batch();
      orderedItems.forEach(({ id, displayOrder }) => {
        const ref = db.collection(COLLECTION_NAME).doc(id);
        batch.update(ref, { displayOrder, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    } catch (err) {
      console.error("Firestore bulkUpdateGalleryOrder failed:", err);
    }
  }

  if (!memoryGallery) {
    memoryGallery = getInitialFallbackGallery();
  }
  const orderMap = new Map(orderedItems.map((o) => [o.id, o.displayOrder]));
  memoryGallery.forEach((item) => {
    if (orderMap.has(item.id)) {
      item.displayOrder = orderMap.get(item.id)!;
    }
  });

  return true;
}
