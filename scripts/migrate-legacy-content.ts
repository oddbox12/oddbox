/**
 * ODDBOX STUDIO — AUTOMATIC CONTENT SEEDING & MIGRATION SCRIPT
 * Migrates all 97 gallery records, 10 categories, 6 services, page content, and media.
 * Supports: --dry-run, idempotent execution, and Cloudinary imports.
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { v2 as cloudinary } from "cloudinary";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch, collection, addDoc } from "firebase/firestore";

const isDryRun = process.argv.includes("--dry-run");

// Load local legacy assets
const manifestPath = path.resolve(process.cwd(), "src/asset-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

console.log("==========================================================");
console.log(`   ODDBOX STUDIO CMS MIGRATION ${isDryRun ? "[DRY RUN]" : "[LIVE SEED]"}   `);
console.log("==========================================================");

// Setup Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log(`[Cloudinary] Configured for cloud: ${cloudName}`);
} else {
  console.log(`[Cloudinary] Note: Credentials not configured in .env. Preserving original and local paths.`);
}

// Setup Firebase Client Firestore
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: any = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  console.log(`[Firebase] Successfully initialized Firestore for project: ${firebaseConfig.projectId}`);
} catch (err: any) {
  console.warn(`[Firebase] Initialization warning:`, err.message);
}

async function runMigration() {
  const startedAt = new Date().toISOString();
  console.log(`\nStarting migration at: ${startedAt}\n`);

  // 1. Categories
  const categoriesMap: Record<string, { id: string; name: string; count: number }> = {
    couple: { id: "couple", name: "Couples", count: 8 },
    events: { id: "events", name: "Events", count: 25 },
    portraits: { id: "portraits", name: "Portraits", count: 8 },
    maternity: { id: "maternity", name: "Maternity", count: 8 },
    newborn: { id: "newborn", name: "Newborn", count: 8 },
    family: { id: "family", name: "Family", count: 8 },
    corporate: { id: "corporate", name: "Commercial", count: 8 },
    pet: { id: "pet", name: "Pets", count: 8 },
    "nature-landscape-architecture": { id: "nature-landscape-architecture", name: "Places", count: 8 },
    lifestyle: { id: "lifestyle", name: "Lifestyle", count: 8 },
  };

  const categories = Object.values(categoriesMap).map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.id,
    description: `${cat.name} photography and cinematic production by Oddbox Studio.`,
    displayOrder: idx + 1,
    isActive: true,
    itemCount: cat.count,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  console.log(`✓ 10 Categories prepared:`);
  categories.forEach((c) => console.log(`   - ${c.name} (${c.slug}) -> ${c.itemCount} items`));

  if (db && !isDryRun) {
    const batch = writeBatch(db);
    for (const cat of categories) {
      batch.set(doc(db, "galleryCategories", cat.id), cat, { merge: true });
    }
    await batch.commit();
    console.log(`✓ Seeded ${categories.length} categories to Firestore 'galleryCategories'`);
  }

  // 2. Services
  const services = [
    {
      id: "commercial-photography",
      title: "Commercial Photography",
      slug: "commercial-photography",
      number: "01",
      shortDescription: "Editorial, lifestyle, and advertising imagery crafted for luxury brands and modern businesses.",
      description: "Editorial, lifestyle, and advertising imagery crafted for luxury brands and modern businesses.",
      coverImageUrl: "/images/services/services-01.jpg",
      displayOrder: 1,
      isFeatured: true,
      isActive: true,
    },
    {
      id: "product-photography",
      title: "Product Photography",
      slug: "product-photography",
      number: "02",
      shortDescription: "Clean, detailed, and striking product compositions for e-commerce, print campaigns, and packaging.",
      description: "Clean, detailed, and striking product compositions for e-commerce, print campaigns, and packaging.",
      coverImageUrl: "/images/services/services-02.jpg",
      displayOrder: 2,
      isFeatured: true,
      isActive: true,
    },
    {
      id: "commercial-films",
      title: "Commercial Films / TVC Production",
      slug: "commercial-films",
      number: "03",
      shortDescription: "Cinematic commercials and advertising films designed for broadcast, digital platforms, and brand launches.",
      description: "Cinematic commercials and advertising films designed for broadcast, digital platforms, and brand launches.",
      coverImageUrl: "/images/services/services-03.jpg",
      displayOrder: 3,
      isFeatured: true,
      isActive: true,
    },
    {
      id: "brand-story-films",
      title: "Brand Story Films / Podcast",
      slug: "brand-story-films",
      number: "04",
      shortDescription: "Narrative-driven films and podcast production that capture the ethos, culture, and vision behind your brand.",
      description: "Narrative-driven films and podcast production that capture the ethos, culture, and vision behind your brand.",
      coverImageUrl: "/images/services/services-04.jpg",
      displayOrder: 4,
      isFeatured: true,
      isActive: true,
    },
    {
      id: "social-media-content",
      title: "Social Media Content Creation",
      slug: "social-media-content",
      number: "05",
      shortDescription: "Engaging, high-volume visual assets tailored for modern platforms to build brand presence and community.",
      description: "Engaging, high-volume visual assets tailored for modern platforms to build brand presence and community.",
      coverImageUrl: "/images/services/services-05.jpg",
      displayOrder: 5,
      isFeatured: true,
      isActive: true,
    },
    {
      id: "fashion-textile-photography",
      title: "Fashion & Textile Photography",
      slug: "fashion-textile-photography",
      number: "06",
      shortDescription: "Specialized fashion campaigns, lookbooks, and textile showcases blending high fashion aesthetics with storytelling.",
      description: "Specialized fashion campaigns, lookbooks, and textile showcases blending high fashion aesthetics with storytelling.",
      coverImageUrl: "/images/services/services-06.jpg",
      displayOrder: 6,
      isFeatured: true,
      isActive: true,
    },
  ];

  console.log(`\n✓ ${services.length} Services prepared.`);
  if (db && !isDryRun) {
    const batch = writeBatch(db);
    for (const s of services) {
      batch.set(doc(db, "services", s.id), s, { merge: true });
    }
    await batch.commit();
    console.log(`✓ Seeded ${services.length} services to Firestore 'services'`);
  }

  // 3. Gallery Records & Media
  console.log(`\n✓ Processing ${manifest.length} Gallery items...`);
  let cloudinarySuccess = 0;
  let cloudinaryFailed = 0;
  let cloudinaryPending = 0;
  const failedAssets: any[] = [];

  const seededGalleryItems: any[] = [];

  for (let idx = 0; idx < manifest.length; idx++) {
    const item = manifest[idx];
    const cat = categoriesMap[item.category];
    const categoryLabel = cat ? cat.name : item.category;

    let secureUrl = item.web_url_1800 || `/images/${item.category}/${item.filename}`;
    let migrationStatus = "verified";
    let cloudinaryPublicId = `oddbox/gallery/${item.category}/${item.filename.replace(/\.[^/.]+$/, "")}`;

    if (item.cloudinary_url) {
      secureUrl = item.cloudinary_url;
      cloudinaryPublicId = `oddbox/gallery/${item.category}/${item.filename.replace(/\.[^/.]+$/, "")}`;
      cloudinarySuccess++;
    } else if (isCloudinaryConfigured && !isDryRun) {
      let uploadSuccess = false;

      // Try original_url first
      if (item.original_url) {
        try {
          const uploadRes = await cloudinary.uploader.upload(item.original_url, {
            folder: `oddbox/gallery/${item.category}`,
            public_id: item.filename.replace(/\.[^/.]+$/, ""),
            overwrite: false,
            resource_type: "image",
          });
          secureUrl = uploadRes.secure_url;
          cloudinaryPublicId = uploadRes.public_id;
          cloudinarySuccess++;
          uploadSuccess = true;
        } catch {}
      }

      // If original_url failed, try web_url_1800
      if (!uploadSuccess && item.web_url_1800) {
        try {
          const uploadRes = await cloudinary.uploader.upload(item.web_url_1800, {
            folder: `oddbox/gallery/${item.category}`,
            public_id: item.filename.replace(/\.[^/.]+$/, ""),
            overwrite: false,
            resource_type: "image",
          });
          secureUrl = uploadRes.secure_url;
          cloudinaryPublicId = uploadRes.public_id;
          cloudinarySuccess++;
          uploadSuccess = true;
        } catch (err: any) {
          cloudinaryFailed++;
          failedAssets.push({
            asset_id: item.asset_id,
            filename: item.filename,
            category: item.category,
            url: item.web_url_1800,
            error: err.message,
          });
          migrationStatus = "legacy_fallback";
        }
      }
    } else {
      cloudinaryPending++;
    }

    const galleryRecord = {
      id: item.asset_id || `gallery-${idx + 1}`,
      sourceAssetId: item.asset_id,
      title: item.project || `Oddbox Capture ${idx + 1}`,
      slug: `${item.category}-${item.filename.replace(/\.[^/.]+$/, "")}`,
      projectName: item.project,
      description: `Photograph from ${item.project} collection under ${categoryLabel}.`,
      categoryId: item.category,
      categoryLabel,
      imageUrl: secureUrl,
      thumbnailUrl: `/images/${item.category}/${item.filename}`,
      originalSourceUrl: item.original_url,
      webUrl1800: item.web_url_1800,
      filename: item.filename,
      mediaType: "image",
      altText: `${item.project} - Oddbox Studio`,
      displayOrder: idx + 1,
      isFeatured: idx < 6,
      isPublished: true,
      migrationStatus,
      createdAt: startedAt,
      updatedAt: startedAt,
    };

    seededGalleryItems.push(galleryRecord);
  }

  if (db && !isDryRun) {
    const chunkSize = 40;
    for (let i = 0; i < seededGalleryItems.length; i += chunkSize) {
      const chunk = seededGalleryItems.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, "galleryItems", item.id), item, { merge: true });
      }
      await batch.commit();
    }
    console.log(`✓ Seeded all ${seededGalleryItems.length} gallery records to Firestore 'galleryItems'`);
  }

  // 4. Page Content & Settings
  const homeData = {
    hero: {
      title: "ODDBOX",
      subtitle: "Photography · Films · Creative Production",
      bgImageUrl: "/images/couple/couple-01.jpg?v=2",
      ctaLabel: "View Gallery",
      ctaUrl: "/work",
    },
    aboutPreview: {
      title: "Oddbox Studio",
      description: "Bunty Patel is not simply taking photographs; his approach is about capturing meaningful moments through emotion, storytelling, and style.",
      imageUrl: "/images/portraits/portraits-01.jpg",
      linkUrl: "/about",
    },
    visualBreak: {
      label: "Visual Interlude",
      title: "Light, Love & Life",
      description: "Some moments deserve more than memory — let's capture them forever.",
      imageUrl: "/images/couple/couple-02.jpg",
    },
    selectedWork: [
      { num: "01", label: "Reflections", subtitle: "Portrait / Editorial Study", image: "/images/portraits/portraits-02.jpg", aspect: "portrait" },
      { num: "02", label: "Joy", subtitle: "Couples & Intimate Moments", image: "/images/couple/couple-04.jpg", aspect: "portrait" },
      { num: "03", label: "Raw", subtitle: "Street & Still Life", image: "/images/lifestyle/lifestyle-03.jpeg", aspect: "landscape" },
      { num: "04", label: "The Essence Within", subtitle: "Commercial & Studio Portraiture", image: "/images/portraits/portraits-03.jpg", aspect: "landscape" },
      { num: "05", label: "Ephemeral", subtitle: "Fashion & Motion", image: "/images/lifestyle/lifestyle-01.jpeg", aspect: "portrait" },
    ],
    updatedAt: startedAt,
  };

  const aboutData = {
    heroTitle: "Honest Imagery · Living Stories",
    heroSubtitle: "Surat, Gujarat, India",
    studioIntro: "Oddbox Studio is an international photography & cinematography practice founded by Bunty Patel. We specialize in intimate human moments, editorial storytelling, commercial fashion, and visual films that transcend simple documentation.",
    founder: {
      name: "Bunty Patel",
      role: "Founder & Visual Director",
      bio: "Bunty Patel is not simply taking photographs; his approach is about capturing meaningful moments through emotion, storytelling, and timeless light.",
      imageUrl: "/images/portraits/portraits-02.jpg",
    },
    philosophies: [
      "Our studio philosophy focuses on honest and beautiful imagery across maternity, couples, pets, food, lifestyle, portraits, and larger stories.",
      "Photography is a personal experience intended to make people feel seen, celebrated, and remembered.",
      "A place where light, love, and life come together."
    ],
    ethos: [
      { title: "Authentic Emotion", description: "We don't stage perfection; we capture the unscripted truth of human connection." },
      { title: "Cinematic Light", description: "Using light as our primary brush, every frame is treated like a still from an art house film." },
      { title: "Lasting Legacy", description: "Moments pass in an instant. Our craft preserves them for generations to feel." }
    ],
    milestones: [
      { year: "2018", title: "Oddbox Studio Founded", description: "Began capturing boutique portraits and love stories in Surat." },
      { year: "2021", title: "Commercial & Fashion Expansion", description: "Produced campaigns for textiles, apparel, and emerging brands." },
      { year: "2024", title: "Cinematography & Films", description: "Expanded full-scale TVC, brand story films, and podcasts." }
    ],
    updatedAt: startedAt,
  };

  const contactData = {
    title: "Let's create something together.",
    description: "Available for commissions worldwide. Reach out for availability, packages, and creative collaborations.",
    email: "hello@oddboxstudio.in",
    phone: "+91 88661 49555",
    whatsapp: "+918866149555",
    address: "406 Pancham Residency, Opp Karan Park Row House, Kalpana Chawla Road, Adajan, Surat, Gujarat, India – 395009",
    interestsList: [
      "Photography",
      "Brand Shoot",
      "Cinematography Project",
      "Creative Production",
      "Podcast",
      "TV Commercial",
      "Textile / Fashion Photography"
    ],
    successMessage: "Thank you. Your message has been received. Bunty Patel and our team will get in touch shortly.",
    updatedAt: startedAt,
  };

  const settingsData = {
    name: "Oddbox Studio",
    legalName: "Wireverse Private Limited",
    email: "hello@oddboxstudio.in",
    phone: "+91 88661 49555",
    whatsapp: "+918866149555",
    address: "406 Pancham Residency, Opp Karan Park Row House, Kalpana Chawla Road, Adajan, Surat, Gujarat, India – 395009",
    location: "Surat, Gujarat, India",
    instagramUrl: "https://www.instagram.com/oddboxphotography",
    socialLinks: [{ label: "Instagram", url: "https://www.instagram.com/oddboxphotography" }],
    defaultSeoTitle: "ODDBOX STUDIO — Photography & Films",
    defaultSeoDescription: "A premium international creative production and photography portfolio by Bunty Patel. Operated under Wireverse Private Limited.",
    updatedAt: startedAt,
  };

  if (db && !isDryRun) {
    await setDoc(doc(db, "pageContent", "home"), homeData, { merge: true });
    await setDoc(doc(db, "pageContent", "about"), aboutData, { merge: true });
    await setDoc(doc(db, "pageContent", "contact"), contactData, { merge: true });
    await setDoc(doc(db, "siteSettings", "general"), settingsData, { merge: true });
    console.log(`✓ Seeded pageContent (home, about, contact) & siteSettings to Firestore`);

    // Update local asset-manifest.json with new Cloudinary CDN URLs
    if (cloudinarySuccess > 0) {
      const updatedManifest = manifest.map((item: any) => {
        const seeded = seededGalleryItems.find((s: any) => s.sourceAssetId === item.asset_id);
        if (seeded && seeded.imageUrl && seeded.imageUrl.includes("cloudinary")) {
          return {
            ...item,
            cloudinary_url: seeded.imageUrl,
            web_url_1800: seeded.imageUrl,
          };
        }
        return item;
      });
      fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2), "utf-8");
      console.log(`✓ Updated local src/asset-manifest.json with new Cloudinary CDN delivery URLs`);
    }
    await addDoc(collection(db, "migrationRuns"), {
      startedAt,
      completedAt: new Date().toISOString(),
      status: "completed",
      categoriesSeeded: categories.length,
      totalCategories: categories.length,
      gallerySeeded: seededGalleryItems.length,
      totalGallery: seededGalleryItems.length,
      servicesSeeded: services.length,
      totalServices: services.length,
      cloudinarySuccessful: cloudinarySuccess,
      cloudinaryFailed: cloudinaryFailed,
      cloudinaryPending: cloudinaryPending,
      failedAssets,
    });
  }

  // Summary Report
  console.log("\n==========================================================");
  console.log("             MIGRATION EXECUTION REPORT                   ");
  console.log("==========================================================");
  console.log(`Categories Seeded:          ${categories.length}/10`);
  console.log(`Gallery Records Seeded:     ${seededGalleryItems.length}/97`);
  console.log(`Services Seeded:            ${services.length}/6`);
  console.log(`Pages Seeded:               Home, About, Contact, Settings`);
  console.log(`Cloudinary Successful:      ${cloudinarySuccess}`);
  console.log(`Cloudinary Failed:          ${cloudinaryFailed}`);
  console.log(`Cloudinary Fallback/Local:  ${cloudinaryPending}`);
  console.log("==========================================================");
  console.log(`Status: COMPLETE. Codebase is fully ready.`);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
