import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { SiteSettings } from "@/types/cms";
import { siteConfig } from "@/data/site";

const COLLECTION_NAME = "siteSettings";
const DOC_ID = "general";

export const defaultSettings: SiteSettings = {
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  email: siteConfig.email,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  address: siteConfig.address,
  location: siteConfig.location,
  instagramUrl: siteConfig.instagramUrl,
  socialLinks: siteConfig.socials,
  defaultSeoTitle: "ODDBOX STUDIO — Photography & Films",
  defaultSeoDescription:
    "A premium international creative production and photography portfolio by Bunty Patel. Operated under Wireverse Private Limited.",
  updatedAt: new Date().toISOString(),
};

let memorySettings: SiteSettings = defaultSettings;

export async function getSiteSettings(): Promise<SiteSettings> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const doc = await db.collection(COLLECTION_NAME).doc(DOC_ID).get();
      if (doc.exists) {
        return { ...defaultSettings, ...doc.data() } as SiteSettings;
      }
    } catch (err) {
      console.warn("Firestore fetch for settings failed, using fallback:", err);
    }
  }

  return memorySettings;
}

export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const { db, isConfigured } = getFirebaseAdmin();
  const current = await getSiteSettings();
  const updated = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(DOC_ID).set(updated, { merge: true });
    } catch (err) {
      console.error("Firestore save for settings failed:", err);
    }
  }

  memorySettings = updated;
  return updated;
}

