import { notFound } from "next/navigation";
import { getCourse } from "@/lib/firestore/courses";
import { getLesson } from "@/lib/firestore/lessons";
import Link from "next/link";
import { ContentEditorPage } from "@/components/admin/content-editor-page";

export default async function LessonContentPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const [course, lesson] = await Promise.all([
    getCourse(courseId),
    getLesson(courseId, lessonId),
  ]);

  if (!course || !lesson) notFound();

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Compact top bar */}
      <header className="flex items-center justify-between border-b border-border/40 bg-card px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/admin/courses/${courseId}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Back to course"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{course.title}</span>
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="truncate font-medium text-foreground">{lesson.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${courseId}/lessons/${lessonId}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Preview
          </Link>
        </div>
      </header>

      {/* Editor fills remaining space */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[800px] px-4 py-6">
          <ContentEditorPage
            courseId={courseId}
            lessonId={lessonId}
            initialBlocks={lesson.blocks ?? []}
          />
        </div>
      </div>
    </div>
  );
}
