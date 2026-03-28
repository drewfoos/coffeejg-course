import type { Timestamp } from "firebase-admin/firestore";

// Helper to convert Firestore Timestamps to ISO strings for client serialization
export function serializeTimestamp(ts: Timestamp | undefined | null): string {
  if (!ts) return new Date().toISOString();
  return ts.toDate().toISOString();
}

export function serializeDoc<T extends Record<string, unknown>>(doc: T): T {
  const result = { ...doc };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (val && typeof val === "object" && "_seconds" in val && "_nanoseconds" in val) {
      (result as Record<string, unknown>)[key] = serializeTimestamp(val as unknown as Timestamp);
    }
  }
  return result;
}

export interface User {
  displayName: string;
  email: string;
  authProvider: "email" | "google";
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  stripeSessionId: string;
  enrolledAt: string;
  status: "active" | "revoked";
  source: "purchase" | "gift" | "promo";
}

export interface Purchase {
  userId: string;
  courseId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amountPaid: number;
  currency: string;
  purchasedAt: string;
}

export interface Course {
  title: string;
  slug: string;
  description: string;
  stripePriceId: string;
  isFree: boolean;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface Lesson {
  title: string;
  slug: string;
  vimeoVideoId: string;
  isFree: boolean;
  order: number;
  durationSeconds: number;
}

export interface Progress {
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface Asset {
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  source: string;
  externalUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  userId: string;
  assetId: string;
  favoritedAt: string;
}
