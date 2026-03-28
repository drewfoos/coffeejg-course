import type { Timestamp } from "firebase-admin/firestore";

export interface User {
  displayName: string;
  email: string;
  authProvider: "email" | "google";
  stripeCustomerId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  stripeSessionId: string;
  enrolledAt: Timestamp;
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
  purchasedAt: Timestamp;
}

export interface Course {
  title: string;
  slug: string;
  description: string;
  stripePriceId: string;
  isFree: boolean;
  thumbnailUrl: string;
  publishedAt: Timestamp;
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
  completedAt: Timestamp | null;
}

export interface Asset {
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  source: string;
  externalUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Favorite {
  userId: string;
  assetId: string;
  favoritedAt: Timestamp;
}
