"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveEnrollment } from "@/lib/firestore/enrollments";
import { getLesson } from "@/lib/firestore/lessons";
import { toggleLessonComplete } from "@/lib/firestore/progress";
import { validateId } from "@/lib/validation";

export async function toggleLessonCompleteAction(
  courseId: string,
  lessonId: string
): Promise<boolean> {
  validateId(courseId, "course ID");
  validateId(lessonId, "lesson ID");
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in.");
  }

  // Verify the user has access to this lesson
  const [enrollment, lesson] = await Promise.all([
    getActiveEnrollment(user.uid),
    getLesson(courseId, lessonId),
  ]);

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  const hasAccess = lesson.isFree || enrollment?.status === "active";
  if (!hasAccess) {
    throw new Error("You do not have access to this lesson.");
  }

  const completed = await toggleLessonComplete(user.uid, courseId, lessonId);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/courses/${courseId}`);
  return completed;
}
