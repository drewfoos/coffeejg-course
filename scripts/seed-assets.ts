import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

interface EnrichedAsset {
  id: string;
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  source: string;
  externalUrl: string;
  free: boolean;
  postedAt?: string;
}

async function seedAssets() {
  const raw = readFileSync(
    resolve(__dirname, "assets-enriched.json"),
    "utf-8"
  );
  const data = JSON.parse(raw);
  const assets: EnrichedAsset[] = data.assets;

  console.log(`Importing ${assets.length} assets to Firestore...\n`);

  const BATCH_LIMIT = 500;
  let batch = db.batch();
  let batchCount = 0;
  let total = 0;

  for (const asset of assets) {
    const now = new Date().toISOString();
    const ref = db.collection("assets").doc(asset.id);
    batch.set(ref, {
      title: asset.title,
      artistName: asset.artistName,
      description: asset.description || "",
      imageUrl: asset.imageUrl || "",
      tags: asset.tags,
      source: asset.source,
      externalUrl: asset.externalUrl,
      free: asset.free,
      createdAt: asset.postedAt || now,
      updatedAt: now,
    });
    batchCount++;
    total++;

    if (batchCount === BATCH_LIMIT) {
      await batch.commit();
      console.log(`  Committed batch (${total}/${assets.length})`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed final batch (${total}/${assets.length})`);
  }

  console.log(`\nDone! Imported ${total} assets.`);
}

seedAssets().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
