import { getAllCourses } from "@/lib/firestore/courses";
import { getLessons } from "@/lib/firestore/lessons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getAllCourses();

  // Fetch lesson counts in parallel
  const coursesWithMeta = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessons(course.id);
      const totalDuration = lessons.reduce(
        (sum, l) => sum + l.durationSeconds,
        0
      );
      return { ...course, lessonCount: lessons.length, totalDuration };
    })
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center">
          <Badge variant="secondary" className="mb-4">
            Learn
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Courses</h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
            Structured video courses to take you from first setup to going live
            as a professional 3D VTuber.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10">

      {coursesWithMeta.length === 0 ? (
        <p className="text-muted-foreground">No courses available yet.</p>
      ) : (
        <div className="grid gap-6">
          {coursesWithMeta.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group flex gap-5 rounded-lg border border-border/50 bg-card p-5 transition-colors hover:bg-accent/50"
            >
              {course.thumbnailUrl && (
                <div className="hidden shrink-0 overflow-hidden rounded-md sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-32 w-48 object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-col justify-center">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {course.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded border border-border/50 px-1.5 py-0.5">
                    {course.lessonCount} lessons
                  </span>
                  <span className="rounded border border-border/50 px-1.5 py-0.5">
                    {formatTotalDuration(course.totalDuration)}
                  </span>
                  {course.isFree && (
                    <span className="rounded border border-primary px-1.5 py-0.5 font-semibold text-primary">
                      FREE
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
