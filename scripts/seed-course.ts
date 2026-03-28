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

interface LessonData {
  id: string;
  title: string;
  slug: string;
  vimeoVideoId: string;
  isFree: boolean;
  order: number;
  durationSeconds: number;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  stripePriceId: string;
  isFree: boolean;
  thumbnailUrl: string;
  lessons: LessonData[];
}

async function seedCourse() {
  const raw = readFileSync(resolve(__dirname, "../data/course.json"), "utf-8");
  const courseData: CourseData = JSON.parse(raw);

  const { lessons, id: courseId, ...courseFields } = courseData;

  // Write course document
  console.log(`Writing course: ${courseId}`);
  await db
    .collection("courses")
    .doc(courseId)
    .set({
      ...courseFields,
      publishedAt: FieldValue.serverTimestamp(),
    });
  console.log(`  ✓ Course "${courseFields.title}" written.`);

  // Write lesson documents
  for (const lesson of lessons) {
    const { id: lessonId, ...lessonFields } = lesson;
    console.log(`  Writing lesson: ${lessonId}`);
    await db
      .collection("courses")
      .doc(courseId)
      .collection("lessons")
      .doc(lessonId)
      .set(lessonFields);
    console.log(`    ✓ Lesson "${lessonFields.title}" written.`);
  }

  console.log(`\nDone! Seeded 1 course with ${lessons.length} lessons.`);
}

seedCourse().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
