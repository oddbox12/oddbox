import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { HomePageContent, AboutPageContent, ContactPageContent } from "@/types/cms";
import { siteConfig } from "@/data/site";
import { selectedWorkItems, homeVisualBreak } from "@/data/portfolio";

const COLLECTION_NAME = "pageContent";

// Default content seeded from existing JSX and data files
export const defaultHomePageContent: HomePageContent = {
  hero: {
    title: "ODDBOX",
    subtitle: "Photography · Films · Creative Production",
    bgImageUrl: "/images/couple/couple-01.jpg?v=2",
    ctaLabel: "View Gallery",
    ctaUrl: "/work",
  },
  aboutPreview: {
    title: "Oddbox Studio",
    description: siteConfig.aboutBrief,
    imageUrl: "/images/portraits/portraits-01.jpg",
    linkUrl: "/about",
  },
  visualBreak: {
    label: "Visual Interlude",
    title: "Light, Love & Life",
    description: "Some moments deserve more than memory — let's capture them forever.",
    imageUrl: homeVisualBreak,
  },
  selectedWork: selectedWorkItems as any,
  updatedAt: new Date().toISOString(),
};

export const defaultAboutPageContent: AboutPageContent = {
  heroTitle: "Honest Imagery · Living Stories",
  heroSubtitle: "Surat, Gujarat, India",
  studioIntro:
    "Oddbox Studio is an international photography & cinematography practice founded by Bunty Patel. We specialize in intimate human moments, editorial storytelling, commercial fashion, and visual films that transcend simple documentation.",
  founder: {
    name: "Bunty Patel",
    role: "Founder & Visual Director",
    bio: "Bunty Patel is not simply taking photographs; his approach is about capturing meaningful moments through emotion, storytelling, and timeless light.",
    imageUrl: "/images/portraits/portraits-02.jpg",
  },
  philosophies: siteConfig.aboutPhilosophies,
  ethos: [
    {
      title: "Authentic Emotion",
      description: "We don't stage perfection; we capture the unscripted truth of human connection.",
    },
    {
      title: "Cinematic Light",
      description: "Using light as our primary brush, every frame is treated like a still from an art house film.",
    },
    {
      title: "Lasting Legacy",
      description: "Moments pass in an instant. Our craft preserves them for generations to feel.",
    },
  ],
  milestones: [
    { year: "2018", title: "Oddbox Studio Founded", description: "Began capturing boutique portraits and love stories in Surat." },
    { year: "2021", title: "Commercial & Fashion Expansion", description: "Produced campaigns for textiles, apparel, and emerging brands." },
    { year: "2024", title: "Cinematography & Films", description: "Expanded full-scale TVC, brand story films, and podcasts." }
  ],
  updatedAt: new Date().toISOString(),
};

export const defaultContactPageContent: ContactPageContent = {
  title: "Let's create something together.",
  description: "Available for commissions worldwide. Reach out for availability, packages, and creative collaborations.",
  email: siteConfig.email,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  address: siteConfig.address,
  interestsList: [
    "Photography",
    "Brand Shoot",
    "Cinematography Project",
    "Creative Production",
    "Podcast",
    "TV Commercial",
    "Textile / Fashion Photography",
  ],
  successMessage: "Thank you. Your message has been received. Bunty Patel and our team will get in touch shortly.",
  updatedAt: new Date().toISOString(),
};

let memoryPages: Record<string, any> = {
  home: defaultHomePageContent,
  about: defaultAboutPageContent,
  contact: defaultContactPageContent,
};

export async function getPageContent<T = any>(slug: "home" | "about" | "contact"): Promise<T> {
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const doc = await db.collection(COLLECTION_NAME).doc(slug).get();
      if (doc.exists) {
        return doc.data() as T;
      }
    } catch (err) {
      console.warn(`Firestore fetch for page ${slug} failed, using fallback:`, err);
    }
  }

  return memoryPages[slug] as T;
}

export async function updatePageContent<T = any>(
  slug: "home" | "about" | "contact",
  content: Partial<T>
): Promise<T> {
  const { db, isConfigured } = getFirebaseAdmin();
  const current = await getPageContent(slug);
  const updated = {
    ...current,
    ...content,
    updatedAt: new Date().toISOString(),
  };

  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(slug).set(updated, { merge: true });
    } catch (err) {
      console.error(`Firestore save for page ${slug} failed:`, err);
    }
  }

  memoryPages[slug] = updated;
  return updated as T;
}
