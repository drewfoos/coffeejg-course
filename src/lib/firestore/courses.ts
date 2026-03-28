import { adminDb } from "@/lib/firebase/admin";
import type { Course } from "@/lib/types";

export type CourseWithId = Course & { id: string };

export async function getCourse(
  courseId: string
): Promise<CourseWithId | null> {
  const doc = await adminDb.collection("courses").doc(courseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Course) };
}

export async function getAllCourses(): Promise<CourseWithId[]> {
  const snapshot = await adminDb
    .collection("courses")
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Course),
  }));
}
