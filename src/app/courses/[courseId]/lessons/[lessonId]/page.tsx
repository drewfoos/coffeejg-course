import { notFound } from "next/navigation";
import { getCourse } from "@/lib/firestore/courses";
import { getLesson, getLessonSummaries } from "@/lib/firestore/lessons";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { getCourseProgress } from "@/lib/firestore/progress";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import dynamic from "next/dynamic";
import { VideoPlayer } from "@/components/course/video-player";
import { MarkCompleteButton } from "@/components/course/mark-complete-button";
import { CourseSidebarWrapper } from "@/components/course/course-sidebar-wrapper";
import { LessonRating } from "@/components/course/lesson-rating";
import { extractPlateHeadings } from "@/lib/plate-utils";
import Link from "next/link";

const PlateRenderer = dynamic(
  () => import("@/components/course/plate-renderer").then((m) => m.PlateRenderer),
  {
    loading: () => (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    ),
  }
);

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const [course, lesson, lessons, user] = await Promise.all([
    getCourse(courseId),
    getLesson(courseId, lessonId),
    getLessonSummaries(courseId),
    getCurrentUser(),
  ]);

  if (!course || !lesson) notFound();

  let isEnrolled = false;
  let progressMap: Record<string, boolean> = {};

  if (user) {
    const [enrollment, progress] = await Promise.all([
      getEnrollment(user.uid, courseId),
      getCourseProgress(user.uid, courseId),
    ]);

    isEnrolled = enrollment?.status === "active";
    progressMap = Object.fromEntries(progress);
  }

  const hasAccess = lesson.isFree || isEnrolled;

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const isCompleted = progressMap[lessonId] ?? false;
  const completedCount = Object.values(progressMap).filter(Boolean).length;

  // getLessonSummaries already returns only sidebar-safe fields (no vimeoVideoId, blocks, etc.)

  const headings =
    lesson.blocks && lesson.blocks.length > 0
      ? extractPlateHeadings(lesson.blocks)
      : [];
  const tocTopics = headings.length > 0
    ? headings.map((h) => h.text)
    : (lesson.topics ?? []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Collapsible Sidebar */}
      <CourseSidebarWrapper
        courseTitle={course.title}
        completedCount={completedCount}
        totalCount={lessons.length}
        isEnrolled={isEnrolled}
        lessons={lessons}
        courseId={courseId}
        currentLessonId={lessonId}
        progressMap={progressMap}
      />

      {/* Main content — max-width 1000px, left-aligned, padding 15px */}
      <main className="min-w-0 flex-1 max-w-[1000px] px-[15px] pb-10 pt-[15px]">
        {/* Title */}
        <h1 className="mb-5 text-[22px] font-semibold leading-snug">
          {lesson.order} - {lesson.title}
        </h1>

        {/* Video — fills content width */}
        <div className="mb-5 overflow-hidden rounded-lg">
          {hasAccess ? (
            <VideoPlayer courseId={courseId} lessonId={lessonId} />
          ) : (
            <div className="relative aspect-video w-full bg-muted/50">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-foreground">
                <svg className="h-16 w-16 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="text-lg font-semibold">This lesson requires Pro access</p>
                <p className="text-sm text-muted-foreground">Unlock all lessons with a one-time purchase</p>
                <Link
                  href="/pro"
                  className="mt-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Unlimited Access
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Lesson controls toolbar — sticky, full content width */}
        <div className="sticky top-0 z-30 mb-5">
          <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
            {/* Row 1: Mark complete + nav */}
            <div className="flex items-center justify-between">
              <div>
                {user && hasAccess ? (
                  <MarkCompleteButton
                    courseId={courseId}
                    lessonId={lessonId}
                    initialCompleted={isCompleted}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(lesson.durationSeconds)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {prevLesson ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Previous lesson"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 320 512">
                      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
                    </svg>
                  </Link>
                ) : (
                  <div className="h-9 w-9" />
                )}
                {nextLesson ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Next lesson"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 320 512">
                      <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                    </svg>
                  </Link>
                ) : (
                  <div className="h-9 w-9" />
                )}
              </div>
            </div>

            {/* Row 2: Rating */}
            {hasAccess && (
              <div className="mt-3 border-t border-border/40 pt-3">
                <LessonRating />
              </div>
            )}
          </div>
        </div>

        {/* Article with TOC — TOC is absolutely positioned to the right */}
        {hasAccess ? (
          <div className="relative">
            {/* Article — fills content width */}
            <div>
              <div className="rounded-lg border border-border/50 bg-card p-6">
                {lesson.blocks && lesson.blocks.length > 0 ? (
                  <PlateRenderer value={lesson.blocks} />
                ) : lesson.description ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {lesson.description}
                  </p>
                ) : null}
              </div>

              {/* Next lesson card */}
              {nextLesson && (
                <Link
                  href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="mt-4 flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Up Next
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold">
                      {nextLesson.title}
                    </p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Table of Contents — absolutely positioned to the right, outside content flow */}
            {tocTopics.length > 0 && (
              <aside className="absolute left-full top-0 ml-5 hidden w-[250px] xl:block">
                <div className="sticky top-20">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Table of Contents
                  </h3>
                  <ul className="mt-3 space-y-0">
                    {tocTopics.map((topic, i) => (
                      <li
                        key={i}
                        className="border-l-2 border-border/50 py-2 pl-3 text-[13px] text-muted-foreground"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
            <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="mt-4 text-lg font-semibold">Lesson articles are for Pro members</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get unlimited access to all lesson content, notes, and resources.
            </p>
            <Link
              href="/pro"
              className="mt-5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Unlimited Access
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
