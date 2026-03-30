import { adminDb } from "@/lib/firebase/admin";
import type { Lesson } from "@/lib/types";

export type LessonInput = Omit<Lesson, "slug"> & { slug?: string; content?: string };

/** Strip undefined values so Firestore doesn't throw */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result as T;
}

export async function lessonExists(
  courseId: string,
  lessonId: string
): Promise<boolean> {
  const doc = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .get();
  return doc.exists;
}

export async function createLesson(
  courseId: string,
  lessonId: string,
  data: LessonInput
): Promise<void> {
  const exists = await lessonExists(courseId, lessonId);
  if (exists) {
    throw new Error(
      `A lesson with this ID already exists. Try a slightly different title.`
    );
  }

  const slug =
    data.slug ||
    data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .set(stripUndefined({ ...data, slug }));
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  data: Partial<LessonInput>
): Promise<void> {
  const exists = await lessonExists(courseId, lessonId);
  if (!exists) {
    throw new Error("This lesson no longer exists. It may have been deleted.");
  }
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .update(stripUndefined(data as Record<string, unknown>));
}

export async function deleteLesson(
  courseId: string,
  lessonId: string
): Promise<void> {
  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .delete();
}

export async function reorderLessons(
  courseId: string,
  lessonIds: string[]
): Promise<void> {
  const batch = adminDb.batch();
  lessonIds.forEach((id, index) => {
    const ref = adminDb
      .collection("courses")
      .doc(courseId)
      .collection("lessons")
      .doc(id);
    batch.update(ref, { order: index + 1 });
  });
  await batch.commit();
}
