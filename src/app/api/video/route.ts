import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { getLesson } from "@/lib/firestore/lessons";
import { validateId } from "@/lib/validation";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Returns the video embed URL for a lesson, after verifying access server-side.
 * This prevents the Vimeo video ID from leaking into client-side HTML/JS.
 *
 * GET /api/video?courseId=xxx&lessonId=yyy
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");

  if (!courseId || !lessonId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    validateId(courseId, "course ID");
    validateId(lessonId, "lesson ID");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: CORS_HEADERS });
  }

  const lesson = await getLesson(courseId, lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Not found." }, { status: 404, headers: CORS_HEADERS });
  }

  // Free lessons don't require auth
  if (!lesson.isFree) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401, headers: CORS_HEADERS });
    }

    const enrollment = await getEnrollment(user.uid, courseId);
    if (enrollment?.status !== "active") {
      return NextResponse.json({ error: "No access." }, { status: 403, headers: CORS_HEADERS });
    }
  }

  // During development, YouTube IDs are 11 chars
  const isYouTube = lesson.vimeoVideoId.length === 11;
  const embedUrl = isYouTube
    ? `https://www.youtube.com/embed/${lesson.vimeoVideoId}`
    : `https://player.vimeo.com/video/${lesson.vimeoVideoId}?dnt=1`;

  return NextResponse.json({ embedUrl }, { headers: CORS_HEADERS });
}
