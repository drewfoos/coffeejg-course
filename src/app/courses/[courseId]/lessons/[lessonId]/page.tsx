import { notFound } from "next/navigation";
import { getCourse } from "@/lib/firestore/courses";
import { getLesson } from "@/lib/firestore/lessons";
import { getLessons } from "@/lib/firestore/lessons";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { getCourseProgress } from "@/lib/firestore/progress";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { VideoPlayer } from "@/components/course/video-player";
import { MarkCompleteButton } from "@/components/course/mark-complete-button";
import { CourseSidebarWrapper } from "@/components/course/course-sidebar-wrapper";
import { LessonRating } from "@/components/course/lesson-rating";
import Link from "next/link";

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
    getLessons(courseId),
    getCurrentUser(),
  ]);

  if (!lesson) notFound();

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

  // Strip sensitive fields (vimeoVideoId, description, topics) before sending to client
  const sidebarLessons = lessons.map(({ id, title, order, durationSeconds, isFree, section }) => ({
    id, title, order, durationSeconds, isFree, section,
  }));

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Collapsible Sidebar */}
      <CourseSidebarWrapper
        courseTitle={course?.title || "Course"}
        completedCount={completedCount}
        totalCount={lessons.length}
        isEnrolled={isEnrolled}
        lessons={sidebarLessons}
        courseId={courseId}
        currentLessonId={lessonId}
        progressMap={progressMap}
      />

      {/* Main content */}
      <main className="flex-1">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {lesson.order}
            </span>
            <h1 className="truncate text-[15px] font-semibold">{lesson.title}</h1>
            {lesson.isFree && (
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                FREE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {prevLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Previous lesson"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>
            ) : (
              <div className="h-8 w-8" />
            )}
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {lessons.length}
            </span>
            {nextLesson ? (
              <Link
                href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Next lesson"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : (
              <div className="h-8 w-8" />
            )}
            {user && hasAccess && (
              <>
                <div className="mx-1 h-5 w-px bg-border" />
                <MarkCompleteButton
                  courseId={courseId}
                  lessonId={lessonId}
                  initialCompleted={isCompleted}
                />
              </>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="flex items-center justify-center bg-card">
          {hasAccess ? (
            <div className="w-full max-w-5xl">
              <VideoPlayer courseId={courseId} lessonId={lessonId} />
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-5xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/50 text-foreground">
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

        {/* Below video content */}
        <div className="mx-auto max-w-5xl px-6 py-6">
          {/* Rating */}
          <div className="flex items-center justify-between border-b border-border/50 pb-5">
            <div>
              <h2 className="text-lg font-bold">{lesson.title}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {formatDuration(lesson.durationSeconds)}
                </span>
                {lesson.section && (
                  <>
                    <span className="text-border">·</span>
                    <span>{lesson.section}</span>
                  </>
                )}
              </div>
            </div>
            {hasAccess && <LessonRating />}
          </div>

          {hasAccess ? (
            /* Description + Table of Contents */
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
              {/* Left: Lesson description */}
              <div>
                {lesson.description && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      About this lesson
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {lesson.description}
                    </p>
                  </div>
                )}

                {/* Next lesson card */}
                {nextLesson && (
                  <Link
                    href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="mt-8 flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/50"
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

              {/* Right: Table of Contents */}
              {lesson.topics && lesson.topics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    In this lesson
                  </h3>
                  <ul className="mt-3 space-y-0">
                    {lesson.topics.map((topic, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 border-l-2 border-border/50 py-2 pl-3 text-[13px] text-muted-foreground"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold leading-none text-muted-foreground">
                          {i + 1}
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Locked article content */
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
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
        </div>
      </main>
    </div>
  );
}
