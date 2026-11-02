import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  console.log("Testing Cloudinary connection for:", process.env.CLOUDINARY_CLOUD_NAME);
  try {
    const res = await cloudinary.api.ping();
    console.log("SUCCESS! Cloudinary ping response:", res);
  } catch (err: any) {
    console.error("ERROR connecting to Cloudinary:", err.message || err);
  }
}

main();

