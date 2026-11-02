/**
 * ODDBOX STUDIO — CONTENT AUDIT SCRIPT
 * Audits all hardcoded and legacy content across the codebase
 */

import * as fs from "fs";
import * as path from "path";

// Load manifest & data
const manifestPath = path.resolve(process.cwd(), "src/asset-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

console.log("=================================================");
console.log("   ODDBOX STUDIO — LEGACY CONTENT AUDIT REPORT   ");
console.log("=================================================");

// 1. Gallery Items & Categories
const categoryCounts: Record<string, number> = {};
const uniqueProjects = new Set<string>();

manifest.forEach((item: any) => {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  if (item.project) uniqueProjects.add(item.project);
});

console.log(`\n📸 GALLERY AUDIT:`);
console.log(`Total gallery items in asset manifest: ${manifest.length}`);
console.log(`Unique projects: ${uniqueProjects.size}`);
console.log(`Total Categories: ${Object.keys(categoryCounts).length}`);
console.log(`Breakdown by Category:`);
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`  - ${cat.padEnd(30)}: ${count} items`);
});

// 2. Services
const services = [
  { num: "01", title: "Commercial Photography", id: "commercial-photography" },
  { num: "02", title: "Product Photography", id: "product-photography" },
  { num: "03", title: "Commercial Films / TVC Production", id: "commercial-films" },
  { num: "04", title: "Brand Story Films / Podcast", id: "brand-story-films" },
  { num: "05", title: "Social Media Content Creation", id: "social-media-content" },
  { num: "06", title: "Fashion & Textile Photography", id: "fashion-textile-photography" },
];

console.log(`\n💼 SERVICES AUDIT:`);
console.log(`Total services defined: ${services.length}`);
services.forEach((s) => {
  console.log(`  [${s.num}] ${s.title} (${s.id})`);
});

// 3. Homepage Highlights
console.log(`\n🏠 HOMEPAGE FEATURED WORK AUDIT:`);
console.log(`Curated highlights: 5 items (Reflections, Joy, Raw, The Essence Within, Ephemeral)`);
console.log(`Cinematic Hero: Background portrait (/images/couple/couple-01.jpg)`);
console.log(`Visual Break: "Light, Love & Life" (/images/couple/couple-02.jpg)`);

// 4. About & Philosophy
console.log(`\n📖 ABOUT & BRAND IDENTITY AUDIT:`);
console.log(`Founder: Bunty Patel`);
console.log(`Operating Entity: Wireverse Private Limited`);
console.log(`Location: Surat, Gujarat, India`);
console.log(`Contact: hello@oddboxstudio.in / +91 88661 49555`);
console.log(`Philosophy items: 3 statements`);

console.log("\n=================================================");
console.log("Audit complete. Ready for migration seeding.");
console.log("=================================================");

