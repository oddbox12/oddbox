import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { MediaAsset } from "@/types/cms";
import manifestJson from "@/asset-manifest.json";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "media";

let memoryMedia: MediaAsset[] | null = null;

function getInitialFallbackMedia(): MediaAsset[] {
  return manifestJson.map((item, idx) => ({
    id: `media-${item.asset_id || idx + 1}`,
    cloudinaryPublicId: `oddbox/gallery/${item.category}/${item.filename.replace(/\.[^/.]+$/, "")}`,
    secureUrl: item.web_url_1800 || `/images/${item.category}/${item.filename}`,
    resourceType: "image",
    format: "jpg",
    width: 1800,
    height: 1200,
    thumbnailUrl: `/images/${item.category}/${item.filename}`,
    originalFilename: item.filename,
    originalSourceUrl: item.original_url,
    altText: `${item.project} - Oddbox Studio`,
    title: item.filename,
    folder: `oddbox/gallery/${item.category}`,
    migrationStatus: "verified",
    usedIn: [`Gallery: ${item.project}`],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllMediaAssets(folder?: string, type?: "image" | "video"): Promise<MediaAsset[]> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      let query: Query = db.collection(COLLECTION_NAME).orderBy("createdAt", "desc");
      if (folder && folder !== "all") {
        query = query.where("folder", "==", folder);
      }
      if (type) {
        query = query.where("resourceType", "==", type);
      }
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as MediaAsset[];
      }
    } catch (err) {
      console.warn("Firestore media fetch fallback:", err);
    }
  }

  if (!memoryMedia) {
    memoryMedia = getInitialFallbackMedia();
  }
  let results = [...memoryMedia];
  if (folder && folder !== "all") {
    results = results.filter((m) => m.folder === folder);
  }
  if (type) {
    results = results.filter((m) => m.resourceType === type);
  }
  return results;
}

export async function upsertMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
  const { db, isConfigured } = getFirebaseAdmin();
  const now = new Date().toISOString();
  const updated: MediaAsset = {
    ...asset,
    updatedAt: now,
    createdAt: asset.createdAt || now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(updated.id).set(updated, { merge: true });
    } catch (err) {
      console.error("Firestore upsertMediaAsset failed:", err);
    }
  }

  if (!memoryMedia) {
    memoryMedia = getInitialFallbackMedia();
  }
  const idx = memoryMedia.findIndex((m) => m.id === updated.id);
  if (idx >= 0) {
    memoryMedia[idx] = updated;
  } else {
    memoryMedia.unshift(updated);
  }

  return updated;
}

export async function deleteMediaAsset(id: string): Promise<{ success: boolean; reason?: string }> {
  if (!memoryMedia) {
    memoryMedia = getInitialFallbackMedia();
  }
  const item = memoryMedia.find((m) => m.id === id);
  if (item && item.usedIn && item.usedIn.length > 0) {
    return {
      success: false,
      reason: `Media is currently in use by: ${item.usedIn.join(", ")}`,
    };
  }

  const { db, isConfigured } = getFirebaseAdmin();
  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).delete();
    } catch (err) {
      console.error("Firestore deleteMediaAsset failed:", err);
    }
  }

  memoryMedia = memoryMedia.filter((m) => m.id !== id);
  return { success: true };
}
