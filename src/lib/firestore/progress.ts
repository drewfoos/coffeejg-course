import { adminDb } from "@/lib/firebase/admin";
import { makeProgressId } from "@/lib/constants";
import { FieldValue } from "firebase-admin/firestore";

export async function getCourseProgress(
  uid: string,
  courseId: string
): Promise<Map<string, boolean>> {
  const snapshot = await adminDb
    .collection("progress")
    .where("userId", "==", uid)
    .where("courseId", "==", courseId)
    .select("lessonId", "completed")
    .get();

  const progress = new Map<string, boolean>();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    progress.set(data.lessonId, data.completed ?? false);
  });

  return progress;
}

export async function toggleLessonComplete(
  uid: string,
  courseId: string,
  lessonId: string
): Promise<boolean> {
  const docId = makeProgressId(uid, courseId, lessonId);
  const ref = adminDb.collection("progress").doc(docId);
  const doc = await ref.get();

  const currentlyCompleted = doc.exists ? doc.data()?.completed ?? false : false;
  const newCompleted = !currentlyCompleted;

  await ref.set(
    {
      userId: uid,
      courseId,
      lessonId,
      completed: newCompleted,
      completedAt: newCompleted ? FieldValue.serverTimestamp() : null,
    },
    { merge: true }
  );

  return newCompleted;
}
