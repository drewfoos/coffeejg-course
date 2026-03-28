import { notFound, redirect } from "next/navigation";
import { getLesson } from "@/lib/firestore/lessons";
import { getLessons } from "@/lib/firestore/lessons";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { getCourseProgress } from "@/lib/firestore/progress";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { VideoPlayer } from "@/components/course/video-player";
import { MarkCompleteButton } from "@/components/course/mark-complete-button";
import { LessonSidebar } from "@/components/course/lesson-sidebar";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const lesson = await getLesson(courseId, lessonId);
  if (!lesson) notFound();

  // Access control
  let isEnrolled = false;
  let progressMap: Record<string, boolean> = {};

  if (!lesson.isFree) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const enrollment = await getEnrollment(user.uid, courseId);
    if (!enrollment || enrollment.status !== "active") {
      redirect(`/courses/${courseId}`);
    }
    isEnrolled = true;

    const progress = await getCourseProgress(user.uid, courseId);
    progressMap = Object.fromEntries(progress);
  } else {
    // Even for free lessons, load progress if authenticated
    const user = await getCurrentUser();
    if (user) {
      const enrollment = await getEnrollment(user.uid, courseId);
      isEnrolled = enrollment?.status === "active";
      const progress = await getCourseProgress(user.uid, courseId);
      progressMap = Object.fromEntries(progress);
    }
  }

  const lessons = await getLessons(courseId);
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const isCompleted = progressMap[lessonId] ?? false;
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-6">
          <VideoPlayer vimeoVideoId={lesson.vimeoVideoId} />
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {user && (
              <MarkCompleteButton
                courseId={courseId}
                lessonId={lessonId}
                initialCompleted={isCompleted}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between border-t pt-4">
            {prevLesson ? (
              <a
                href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                &larr; {prevLesson.title}
              </a>
            ) : (
              <span />
            )}
            {nextLesson && (nextLesson.isFree || isEnrolled) ? (
              <a
                href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {nextLesson.title} &rarr;
              </a>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h2 className="mb-4 text-lg font-semibold">Course Content</h2>
            <LessonSidebar
              lessons={lessons}
              courseId={courseId}
              currentLessonId={lessonId}
              progress={progressMap}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
