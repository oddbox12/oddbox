import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { ServiceItem } from "@/types/cms";
import { servicesData as defaultServices } from "@/data/services";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "services";

let memoryServices: ServiceItem[] | null = null;

function getInitialFallbackServices(): ServiceItem[] {
  return defaultServices.map((s, idx: number) => ({
    id: s.id,
    title: s.title,
    slug: s.categorySlug || s.id,
    number: s.num,
    shortDescription: s.description,
    description: s.description,
    coverImageUrl: s.image,
    displayOrder: idx + 1,
    isFeatured: true,
    isActive: true,
    features: [
      "High-end studio & location production",
      "Direction, lighting & bespoke art direction",
      "Full digital retouching & delivery"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllServices(): Promise<ServiceItem[]> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const snapshot = await db.collection(COLLECTION_NAME).orderBy("displayOrder", "asc").get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceItem[];
      }
    } catch (err) {
      console.warn("Firestore services fetch failed, using fallback:", err);
    }
  }

  if (!memoryServices) {
    memoryServices = getInitialFallbackServices();
  }
  return [...memoryServices].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getServiceById(id: string): Promise<ServiceItem | null> {
  const services = await getAllServices();
  return services.find((s) => s.id === id || s.slug === id) || null;
}

export async function upsertService(service: ServiceItem): Promise<ServiceItem> {
  const { db, isConfigured } = getFirebaseAdmin();
  const now = new Date().toISOString();
  const updated: ServiceItem = {
    ...service,
    updatedAt: now,
    createdAt: service.createdAt || now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(updated.id).set(updated, { merge: true });
    } catch (err) {
      console.error("Firestore upsertService failed:", err);
    }
  }

  if (!memoryServices) {
    memoryServices = getInitialFallbackServices();
  }
  const idx = memoryServices.findIndex((s) => s.id === updated.id);
  if (idx >= 0) {
    memoryServices[idx] = updated;
  } else {
    memoryServices.push(updated);
  }

  return updated;
}

export async function deleteService(id: string): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).delete();
    } catch (err) {
      console.error("Firestore deleteService failed:", err);
    }
  }

  if (!memoryServices) {
    memoryServices = getInitialFallbackServices();
  }
  memoryServices = memoryServices.filter((s) => s.id !== id);
  return true;
}
