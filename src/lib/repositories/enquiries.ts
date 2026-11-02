import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { Enquiry } from "@/types/cms";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION_NAME = "enquiries";

let memoryEnquiries: Enquiry[] = [
  {
    id: "seed-enquiry-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    interest: "Photography",
    message: "Hi Bunty, we are planning our destination pre-wedding shoot in Udaipur next season and love your raw editorial style. Would love to discuss availability.",
    status: "new",
    internalNotes: "Interested in full 3-day coverage.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "seed-enquiry-2",
    name: "Ananya Mehta",
    email: "ananya@labelananya.in",
    phone: "+91 91234 56789",
    interest: "Textile / Fashion Photography",
    message: "Looking for an editorial lookbook campaign for our autumn luxury silk collection. 2 models, studio + outdoor daylight.",
    status: "contacted",
    internalNotes: "Shared moodboard over WhatsApp.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export async function createEnquiry(data: Omit<Enquiry, "id" | "status" | "createdAt" | "updatedAt">): Promise<Enquiry> {
  const { db, isConfigured } = getFirebaseAdmin();
  const id = `enquiry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newEnquiry: Enquiry = {
    id,
    ...data,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).set(newEnquiry);
    } catch (err) {
      console.error("Firestore createEnquiry failed:", err);
    }
  }

  memoryEnquiries.unshift(newEnquiry);
  return newEnquiry;
}

export async function getAllEnquiries(statusFilter?: string): Promise<Enquiry[]> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      let query: Query = db.collection(COLLECTION_NAME).orderBy("createdAt", "desc");
      if (statusFilter && statusFilter !== "all") {
        query = query.where("status", "==", statusFilter);
      }
      const snapshot = await query.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as Enquiry[];
      }
    } catch (err) {
      console.warn("Firestore enquiries fetch failed, using fallback:", err);
    }
  }

  let results = [...memoryEnquiries];
  if (statusFilter && statusFilter !== "all") {
    results = results.filter((e) => e.status === statusFilter);
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry["status"],
  internalNotes?: string
): Promise<Enquiry | null> {
  const { db, isConfigured } = getFirebaseAdmin();
  const now = new Date().toISOString();

  const updates: Partial<Enquiry> = { status, updatedAt: now };
  if (typeof internalNotes === "string") {
    updates.internalNotes = internalNotes;
  }

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).update(updates);
    } catch (err) {
      console.error("Firestore updateEnquiryStatus failed:", err);
    }
  }

  const found = memoryEnquiries.find((e) => e.id === id);
  if (found) {
    found.status = status;
    found.updatedAt = now;
    if (typeof internalNotes === "string") {
      found.internalNotes = internalNotes;
    }
    return found;
  }
  return null;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(id).delete();
    } catch (err) {
      console.error("Firestore deleteEnquiry failed:", err);
    }
  }

  memoryEnquiries = memoryEnquiries.filter((e) => e.id !== id);
  return true;
}
