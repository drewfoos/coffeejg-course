import { adminDb } from "@/lib/firebase/admin";
import type { Lesson } from "@/lib/types";
import { serializeDoc } from "@/lib/types";

export type LessonWithId = Lesson & { id: string };

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
