import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in environment variables.");
  process.exit(1);
}

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })
    : getApps()[0];

const db = getFirestore(app);

interface AssetData {
  id: string;
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  source: string;
  externalUrl: string;
}

async function seedAssets() {
  const raw = readFileSync(resolve(__dirname, "../data/assets.json"), "utf-8");
  const assets: AssetData[] = JSON.parse(raw);

  console.log(`Seeding ${assets.length} assets...`);

  for (const asset of assets) {
    const { id: assetId, ...assetFields } = asset;
    console.log(`  Writing asset: ${assetId}`);
    await db
      .collection("assets")
      .doc(assetId)
      .set({
        ...assetFields,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    console.log(`    ✓ "${assetFields.title}" written.`);
  }

  console.log(`\nDone! Seeded ${assets.length} assets.`);
}

seedAssets().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
