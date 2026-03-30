import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCourse } from "@/lib/firestore/courses";
import { getLessons } from "@/lib/firestore/lessons";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { getCourseProgress } from "@/lib/firestore/progress";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { BuyCourseButton } from "@/components/course/buy-course-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const [course, lessons, user] = await Promise.all([
    getCourse(courseId),
    getLessons(courseId),
    getCurrentUser(),
  ]);

  if (!course) notFound();

  let isEnrolled = false;
  let progress = new Map<string, boolean>();

  if (user) {
    const [enrollment, progressResult] = await Promise.all([
      getEnrollment(user.uid, courseId),
      getCourseProgress(user.uid, courseId),
    ]);
    isEnrolled = enrollment?.status === "active";
    if (isEnrolled) {
      progress = progressResult;
    }
  }

  // Enrolled users go straight to the first lesson
  if (isEnrolled && lessons.length > 0) {
    redirect(`/courses/${courseId}/lessons/${lessons[0].id}`);
  }

  const completedCount = [...progress.values()].filter(Boolean).length;
  const firstLesson = lessons[0];
  const totalDuration = lessons.reduce((sum, l) => sum + l.durationSeconds, 0);
  const freeCount = lessons.filter((l) => l.isFree).length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        {course.thumbnailUrl && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {course.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{lessons.length} lessons</span>
          <span>&middot;</span>
          <span>{formatDuration(totalDuration)} total</span>
          {freeCount > 0 && (
            <>
              <span>&middot;</span>
              <span>{freeCount} free preview{freeCount > 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Lesson list */}
        <div className="md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">
            Lessons ({lessons.length})
          </h2>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isAccessible = lesson.isFree || isEnrolled;

              return (
                <Card key={lesson.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm">
                      {lesson.order}
                    </span>
                    <div className="flex-1">
                      {isAccessible ? (
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className="font-medium hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          {lesson.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.isFree && (
                        <Badge variant="secondary">Free</Badge>
                      )}
                      {!isAccessible && (
                        <svg
                          className="h-4 w-4 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {lessons.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No lessons available yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-20">
            <Card>
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-primary">
                      Enrolled
                    </p>
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      {completedCount} of {lessons.length} completed
                    </p>
                    {firstLesson && (
                      <Link
                        href={`/courses/${courseId}/lessons/${firstLesson.id}`}
                      >
                        <Button className="w-full">Go to Course</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BuyCourseButton courseId={courseId} price="$2.00" />
                    <p className="text-center text-xs text-muted-foreground">
                      One-time payment. Lifetime access.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
