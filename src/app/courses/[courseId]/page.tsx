import { notFound, redirect } from "next/navigation";
import { getCourse } from "@/lib/firestore/courses";
import { getLessonSummaries } from "@/lib/firestore/lessons";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const [course, lessons] = await Promise.all([
    getCourse(courseId),
    getLessonSummaries(courseId),
  ]);

  if (!course) notFound();

  if (lessons.length > 0) {
    redirect(`/courses/${courseId}/lessons/${lessons[0].id}`);
  }

  notFound();
}
