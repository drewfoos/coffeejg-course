import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Course } from "@/lib/types";

export type CourseInput = Omit<Course, "publishedAt"> & {
  publishedAt?: string;
};

export async function courseExists(id: string): Promise<boolean> {
  const doc = await adminDb.collection("courses").doc(id).get();
  return doc.exists;
}

export async function createCourse(
  id: string,
  data: CourseInput
): Promise<void> {
  const exists = await courseExists(id);
  if (exists) {
    throw new Error(`A course with the ID "${id}" already exists. Choose a different title.`);
  }

  await adminDb
    .collection("courses")
    .doc(id)
    .set({
      ...data,
      publishedAt: data.publishedAt ?? FieldValue.serverTimestamp(),
    });
}

export async function updateCourse(
  id: string,
  data: Partial<CourseInput>
): Promise<void> {
  const exists = await courseExists(id);
  if (!exists) {
    throw new Error("This course no longer exists. It may have been deleted.");
  }
  await adminDb.collection("courses").doc(id).update(data);
}

export async function deleteCourse(id: string): Promise<void> {
  const lessonsSnap = await adminDb
    .collection("courses")
    .doc(id)
    .collection("lessons")
    .get();

  const batch = adminDb.batch();
  for (const doc of lessonsSnap.docs) {
    batch.delete(doc.ref);
  }
  batch.delete(adminDb.collection("courses").doc(id));
  await batch.commit();
}
