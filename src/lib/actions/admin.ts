"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  type CourseInput,
} from "@/lib/firestore/admin-courses";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  type LessonInput,
} from "@/lib/firestore/admin-lessons";
import { revalidatePath } from "next/cache";
import type { PlateValue } from "@/lib/types";

// ── Helpers ─────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateUrl(url: string, fieldName: string): void {
  if (!url) return; // optional
  try {
    new URL(url);
  } catch {
    throw new Error(`${fieldName} must be a valid URL (e.g. https://example.com/image.jpg)`);
  }
}

function validateVimeoId(id: string): void {
  if (!id) return; // optional
  // Strip full URL if user pasted one
  const cleaned = id.replace(/^https?:\/\/(www\.)?vimeo\.com\//, "").replace(/[/?#].*$/, "");
  if (!/^\d+$/.test(cleaned)) {
    throw new Error("Vimeo Video ID must be a number (e.g. 123456789). You can also paste a full Vimeo URL.");
  }
}

function extractVimeoId(input: string): string {
  if (!input) return "";
  // Accept full URL or plain ID
  const cleaned = input.replace(/^https?:\/\/(www\.)?vimeo\.com\//, "").replace(/[/?#].*$/, "");
  return cleaned;
}

// ── Course Actions ──────────────────────────────────────────────

export async function createCourseAction(data: {
  title: string;
  description: string;
  stripePriceId: string | null;
  isFree: boolean;
  thumbnailUrl: string;
}) {
  await requireAdmin();

  const title = (data.title ?? "").trim();
  if (!title) throw new Error("Course title is required.");
  if (title.length > 100) throw new Error("Course title must be under 100 characters.");

  const id = slugify(title);
  if (!id) throw new Error("Could not generate a valid ID from this title. Try a different title.");

  const description = (data.description ?? "").trim();
  const stripePriceId = (data.stripePriceId ?? "").trim();
  const thumbnailUrl = (data.thumbnailUrl ?? "").trim();

  if (!data.isFree && !stripePriceId) {
    throw new Error("Paid courses require a Stripe Price ID. Find this in your Stripe Dashboard under Products.");
  }
  if (stripePriceId && !stripePriceId.startsWith("price_")) {
    throw new Error("Stripe Price ID should start with \"price_\". Check your Stripe Dashboard.");
  }

  validateUrl(thumbnailUrl, "Thumbnail URL");

  const courseData: CourseInput = {
    title,
    slug: id,
    description,
    stripePriceId,
    isFree: data.isFree,
    thumbnailUrl,
  };

  await createCourse(id, courseData);
  revalidatePath("/admin");
  revalidatePath("/courses");
  return { id };
}

export async function updateCourseAction(
  id: string,
  data: {
    title: string;
    description: string;
    stripePriceId: string | null;
    isFree: boolean;
    thumbnailUrl: string;
  }
) {
  await requireAdmin();

  const title = (data.title ?? "").trim();
  if (!title) throw new Error("Course title is required.");
  if (title.length > 100) throw new Error("Course title must be under 100 characters.");

  const stripePriceId = (data.stripePriceId ?? "").trim();
  const thumbnailUrl = (data.thumbnailUrl ?? "").trim();

  if (!data.isFree && !stripePriceId) {
    throw new Error("Paid courses require a Stripe Price ID.");
  }
  if (stripePriceId && !stripePriceId.startsWith("price_")) {
    throw new Error("Stripe Price ID should start with \"price_\".");
  }

  validateUrl(thumbnailUrl, "Thumbnail URL");

  await updateCourse(id, {
    title,
    description: data.description.trim(),
    stripePriceId,
    isFree: data.isFree,
    thumbnailUrl,
  });
  revalidatePath("/admin");
  revalidatePath(`/courses/${id}`);
}

export async function deleteCourseAction(id: string) {
  await requireAdmin();
  await deleteCourse(id);
  revalidatePath("/admin");
  revalidatePath("/courses");
}

// ── Lesson Actions ──────────────────────────────────────────────

export async function createLessonAction(
  courseId: string,
  data: {
    title: string;
    vimeoVideoId: string;
    isFree: boolean;
    order: number;
    durationMinutes: number;
    section: string;
    description: string;
    topics: string;
    content: string;
    blocks: string;
  }
) {
  await requireAdmin();

  const title = (data.title ?? "").trim();
  if (!title) throw new Error("Lesson title is required.");
  if (title.length > 120) throw new Error("Lesson title must be under 120 characters.");

  const lessonId = slugify(title);
  if (!lessonId) throw new Error("Could not generate a valid ID from this title.");

  const vimeoRaw = (data.vimeoVideoId ?? "").trim();
  validateVimeoId(vimeoRaw);
  const vimeoVideoId = extractVimeoId(vimeoRaw);

  const durationSeconds = Math.max(0, Math.round((data.durationMinutes || 0) * 60));

  const topics = (data.topics ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  let blocks: PlateValue = [];
  try {
    const parsed = JSON.parse(data.blocks || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    // Invalid JSON — empty blocks
  }

  const lessonData: LessonInput = {
    title,
    vimeoVideoId,
    isFree: data.isFree,
    order: data.order,
    durationSeconds,
    section: (data.section ?? "").trim(),
    description: (data.description ?? "").trim(),
    topics: topics.length > 0 ? topics : [],
    content: (data.content ?? "").trim(),
    blocks,
  };

  await createLesson(courseId, lessonId, lessonData);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  return { lessonId };
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  data: {
    title: string;
    vimeoVideoId: string;
    isFree: boolean;
    durationMinutes: number;
    section: string;
    description: string;
    topics: string;
    content: string;
    blocks: string;
  }
) {
  await requireAdmin();

  const title = (data.title ?? "").trim();
  if (!title) throw new Error("Lesson title is required.");
  if (title.length > 120) throw new Error("Lesson title must be under 120 characters.");

  const vimeoRaw = (data.vimeoVideoId ?? "").trim();
  validateVimeoId(vimeoRaw);
  const vimeoVideoId = extractVimeoId(vimeoRaw);

  const durationSeconds = Math.max(0, Math.round((data.durationMinutes || 0) * 60));

  const topics = (data.topics ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  let blocks: PlateValue = [];
  try {
    const parsed = JSON.parse(data.blocks || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    // Invalid JSON — empty blocks
  }

  await updateLesson(courseId, lessonId, {
    title,
    vimeoVideoId,
    isFree: data.isFree,
    durationSeconds,
    section: (data.section ?? "").trim(),
    description: (data.description ?? "").trim(),
    topics: topics.length > 0 ? topics : [],
    content: (data.content ?? "").trim(),
    blocks,
  });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteLessonAction(
  courseId: string,
  lessonId: string
) {
  await requireAdmin();
  await deleteLesson(courseId, lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
}

export async function updateLessonBlocksAction(
  courseId: string,
  lessonId: string,
  blocksJson: string
) {
  await requireAdmin();

  let blocks: PlateValue = [];
  try {
    const parsed = JSON.parse(blocksJson || "[]");
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {
    // Invalid JSON — empty blocks
  }

  await updateLesson(courseId, lessonId, { blocks });
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}/content`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function reorderLessonsAction(
  courseId: string,
  lessonIds: string[]
) {
  await requireAdmin();
  await reorderLessons(courseId, lessonIds);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
}
