import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { JournalPost } from "@/types/cms";
import { journalPosts as defaultPosts } from "@/data/journal";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "journalPosts";

let memoryJournal: JournalPost[] | null = null;

function getInitialFallbackJournal(): JournalPost[] {
  return defaultPosts.map((p, idx) => ({
    id: p.slug || `post-${idx + 1}`,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author || "Bunty Patel",
    coverImageUrl: p.image,
    isPublished: true,
    publishedAt: p.date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllJournalPosts(onlyPublished = true): Promise<JournalPost[]> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      let query: Query = db.collection(COLLECTION_NAME).orderBy("publishedAt", "desc");
      if (onlyPublished) {
        query = query.where("isPublished", "==", true);
      }
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as JournalPost[];
      }
    } catch (err) {
      console.warn("Firestore journal fetch failed, using fallback:", err);
    }
  }

  if (!memoryJournal) {
    memoryJournal = getInitialFallbackJournal();
  }
  let posts = [...memoryJournal];
  if (onlyPublished) {
    posts = posts.filter((p) => p.isPublished);
  }
  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const posts = await getAllJournalPosts(false);
  return posts.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function upsertJournalPost(post: Partial<JournalPost> & { id: string }): Promise<JournalPost> {
  const { db, isConfigured } = getFirebaseAdmin();
  const existing = await getJournalPostBySlug(post.id);
  const now = new Date().toISOString();

  const merged: JournalPost = {
    ...(existing || {
      id: post.id,
      title: "Untitled Story",
      slug: `story-${Date.now()}`,
      excerpt: "",
      content: "",
      category: "Perspective",
      author: "Bunty Patel",
      coverImageUrl: "/images/couple/couple-01.jpg",
      isPublished: true,
      publishedAt: now.split("T")[0],
      createdAt: now,
    }),
    ...post,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(merged.id).set(merged, { merge: true });
    } catch (err) {
      console.error("Firestore upsertJournalPost failed:", err);
    }
  }

  if (!memoryJournal) {
    memoryJournal = getInitialFallbackJournal();
  }
  const idx = memoryJournal.findIndex((p) => p.id === merged.id);
  if (idx >= 0) {
    memoryJournal[idx] = merged;
  } else {
    memoryJournal.unshift(merged);
  }

  return merged;
}

export async function deleteJournalPost(id: string): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).delete();
    } catch (err) {
      console.error("Firestore deleteJournalPost failed:", err);
    }
  }

  if (!memoryJournal) {
    memoryJournal = getInitialFallbackJournal();
  }
  memoryJournal = memoryJournal.filter((p) => p.id !== id);
  return true;
}
