import { adminDb } from "@/lib/firebase/admin";
import type { Lesson } from "@/lib/types";
import { serializeDoc } from "@/lib/types";

export type LessonWithId = Lesson & { id: string };

export type LessonSummary = Pick<
  LessonWithId,
  "id" | "title" | "order" | "durationSeconds" | "isFree" | "section"
>;

export async function getLessons(
  courseId: string
): Promise<LessonWithId[]> {
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order", "asc")
    .get();

  return snapshot.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...(doc.data() as Lesson) })
  );
}

/** Lightweight fetch — only fields needed for sidebar/listing. */
export async function getLessonSummaries(
  courseId: string
): Promise<LessonSummary[]> {
  const snapshot = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order", "asc")
    .select("title", "order", "durationSeconds", "isFree", "section")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<LessonSummary, "id">),
  }));
}

export async function getLesson(
  courseId: string,
  lessonId: string
): Promise<LessonWithId | null> {
  const doc = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .get();

  if (!doc.exists) return null;
  return serializeDoc({ id: doc.id, ...(doc.data() as Lesson) });
}
