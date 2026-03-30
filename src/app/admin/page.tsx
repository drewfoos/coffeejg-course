import { getAllCourses } from "@/lib/firestore/courses";
import { getLessons } from "@/lib/firestore/lessons";
import Link from "next/link";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export default async function AdminDashboard() {
  const courses = await getAllCourses();

  // Fetch lesson counts in parallel
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessons(course.id);
      return { ...course, lessonCount: lessons.length };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your courses and lessons. Click a course to edit its lessons.
      </p>

      {/* Course list */}
      <div className="mt-6 space-y-3">
        {coursesWithCounts.map((course) => (
          <div
            key={course.id}
            className="rounded-lg border border-border/50 bg-card px-5 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="text-sm font-semibold transition-colors hover:text-primary"
                >
                  {course.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
                  {" "}&middot;{" "}
                  {course.isFree ? (
                    <span className="text-green-500">Free</span>
                  ) : course.stripePriceId ? (
                    <span>Paid (Stripe connected)</span>
                  ) : (
                    <span className="text-yellow-500">Paid (no Stripe Price ID!)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                >
                  Edit
                </Link>
                <DeleteCourseButton courseId={course.id} title={course.title} />
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No courses yet. Create your first course below.
            </p>
          </div>
        )}
      </div>

      {/* Create course form */}
      <div className="mt-10 border-t border-border/50 pt-8">
        <h2 className="text-lg font-semibold">Create New Course</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          After creating a course, you can add lessons to it.
        </p>
        <CreateCourseForm />
      </div>
    </div>
  );
}
