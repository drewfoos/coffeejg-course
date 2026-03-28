"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { toggleLessonComplete } from "@/lib/firestore/progress";

export async function toggleLessonCompleteAction(
  courseId: string,
  lessonId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in.");
  }

  const completed = await toggleLessonComplete(user.uid, courseId, lessonId);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/courses/${courseId}`);
  return completed;
}
