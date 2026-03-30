import { notFound } from "next/navigation";
import { getCourse } from "@/lib/firestore/courses";
import { getLessons } from "@/lib/firestore/lessons";
import Link from "next/link";
import { EditCourseForm } from "@/components/admin/edit-course-form";
import { LessonList } from "@/components/admin/lesson-list";
import { CreateLessonForm } from "@/components/admin/create-lesson-form";

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [course, lessons] = await Promise.all([
    getCourse(courseId),
    getLessons(courseId),
  ]);

  if (!course) notFound();

  const totalDuration = lessons.reduce((sum, l) => sum + l.durationSeconds, 0);
  const freeCount = lessons.filter((l) => l.isFree).length;
  const existingSections = [...new Set(lessons.map((l) => l.section).filter(Boolean))] as string[];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          &larr; All Courses
        </Link>
      </div>

      {/* Course settings */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <EditCourseForm course={course} />
      </div>

      {/* Lessons */}
      <div className="mt-10 border-t border-border/50 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Lessons ({lessons.length})
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {Math.round(totalDuration / 60)} min total
              {freeCount > 0 && ` · ${freeCount} free preview${freeCount > 1 ? "s" : ""}`}
            </p>
          </div>
          {lessons.length > 0 && (
            <Link
              href={`/courses/${courseId}/lessons/${lessons[0].id}`}
              target="_blank"
              className="rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              Preview Course &rarr;
            </Link>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Use the arrows to reorder lessons. Click &quot;Edit&quot; to change a lesson&apos;s details.
        </p>

        <LessonList courseId={courseId} lessons={lessons} existingSections={existingSections} isFreeCourse={course.isFree} />
      </div>

      {/* Create lesson */}
      <div className="mt-10 border-t border-border/50 pt-8">
        <h2 className="text-lg font-semibold">Add New Lesson</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          New lessons are added to the end. You can reorder them above after adding.
        </p>
        <CreateLessonForm
          courseId={courseId}
          nextOrder={lessons.length + 1}
          existingSections={existingSections}
          isFreeCourse={course.isFree}
        />
      </div>
    </div>
  );
}
