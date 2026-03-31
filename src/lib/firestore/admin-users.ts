import { adminDb, adminAuth } from "@/lib/firebase/admin";
import type { Enrollment } from "@/lib/types";

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  authProvider: string;
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface AdminEnrollment extends Enrollment {
  id: string;
}

export async function getUsers(
  limit: number = 50,
  pageToken?: string
): Promise<{ users: AdminUser[]; hasMore: boolean; nextPageToken?: string }> {
  // List users from Firebase Auth (source of truth) and enrich with Firestore data
  const listResult = await adminAuth.listUsers(limit, pageToken || undefined);
  const hasMore = !!listResult.pageToken;

  // Batch-fetch all Firestore user docs in a single round-trip
  const userRefs = listResult.users.map((u) => adminDb.collection("users").doc(u.uid));
  const userDocs = userRefs.length > 0 ? await adminDb.getAll(...userRefs) : [];
  const userDataMap = new Map(userDocs.map((doc) => [doc.id, doc.data()]));

  const users: AdminUser[] = listResult.users.map((authUser) => {
    const data = userDataMap.get(authUser.uid);
    return {
      uid: authUser.uid,
      displayName: authUser.displayName ?? data?.displayName ?? "",
      email: authUser.email ?? data?.email ?? "",
      authProvider: data?.authProvider ?? (authUser.providerData[0]?.providerId === "google.com" ? "google" : "email"),
      stripeCustomerId: data?.stripeCustomerId ?? null,
      createdAt: authUser.metadata.creationTime ?? data?.createdAt?.toDate?.()?.toISOString?.() ?? "",
    };
  });

  return { users, hasMore, nextPageToken: listResult.pageToken };
}

export async function searchUsers(query: string): Promise<AdminUser[]> {
  const lower = query.toLowerCase().trim();
  const results: AdminUser[] = [];

  // Try exact lookups first (email, UID)
  try {
    // Search by email
    const byEmail = await adminAuth.getUserByEmail(lower);
    if (byEmail) results.push(await authUserToAdminUser(byEmail));
  } catch { /* not found */ }

  try {
    // Search by UID
    const byUid = await adminAuth.getUser(lower);
    if (byUid && !results.some((u) => u.uid === byUid.uid)) {
      results.push(await authUserToAdminUser(byUid));
    }
  } catch { /* not found */ }

  // If exact lookups didn't find anything, list all and filter
  if (results.length === 0) {
    const listResult = await adminAuth.listUsers(1000);
    const matches = listResult.users
      .filter(
        (authUser) =>
          authUser.email?.toLowerCase().includes(lower) ||
          authUser.displayName?.toLowerCase().includes(lower) ||
          authUser.uid.toLowerCase().includes(lower)
      )
      .slice(0, 50);

    // Parallelize Firestore enrichment for all matches
    const enriched = await Promise.all(
      matches.map((authUser) => authUserToAdminUser(authUser))
    );
    results.push(...enriched);
  }

  return results;
}

async function authUserToAdminUser(authUser: import("firebase-admin/auth").UserRecord): Promise<AdminUser> {
  const doc = await adminDb.collection("users").doc(authUser.uid).get();
  const data = doc.data();

  // Resolve stripeCustomerId: user doc first, then fall back to purchase records
  let stripeCustomerId = data?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const purchaseSnap = await adminDb
      .collection("purchases")
      .where("userId", "==", authUser.uid)
      .limit(1)
      .get();
    if (!purchaseSnap.empty) {
      stripeCustomerId = purchaseSnap.docs[0].data()?.stripeCustomerId ?? null;
      // Backfill user doc
      if (stripeCustomerId) {
        await adminDb
          .collection("users")
          .doc(authUser.uid)
          .set({ stripeCustomerId }, { merge: true });
      }
    }
  }

  return {
    uid: authUser.uid,
    displayName: authUser.displayName ?? data?.displayName ?? "",
    email: authUser.email ?? data?.email ?? "",
    authProvider: data?.authProvider ?? (authUser.providerData[0]?.providerId === "google.com" ? "google" : "email"),
    stripeCustomerId,
    createdAt: authUser.metadata.creationTime ?? data?.createdAt?.toDate?.()?.toISOString?.() ?? "",
  };
}

export async function getUserById(uid: string): Promise<AdminUser | null> {
  try {
    const authUser = await adminAuth.getUser(uid);
    return authUserToAdminUser(authUser);
  } catch {
    // User not found in Firebase Auth
    return null;
  }
}

export async function getUserEnrollments(
  uid: string
): Promise<AdminEnrollment[]> {
  const snapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", uid)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    // currentPeriodEnd can be a Firestore Timestamp, a JS Date, or an ISO string
    let currentPeriodEnd: string | undefined;
    if (data.currentPeriodEnd) {
      if (typeof data.currentPeriodEnd === "string") {
        currentPeriodEnd = data.currentPeriodEnd;
      } else if (data.currentPeriodEnd.toDate) {
        currentPeriodEnd = data.currentPeriodEnd.toDate().toISOString();
      } else if (data.currentPeriodEnd instanceof Date) {
        currentPeriodEnd = data.currentPeriodEnd.toISOString();
      }
    }

    return {
      id: doc.id,
      userId: data.userId,
      courseId: data.courseId,
      stripeSessionId: data.stripeSessionId ?? "",
      enrolledAt: data.enrolledAt?.toDate?.()?.toISOString?.() ?? "",
      status: data.status ?? "active",
      source: data.source ?? "purchase",
      planType: data.planType ?? "lifetime",
      stripeSubscriptionId: data.stripeSubscriptionId ?? undefined,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      currentPeriodEnd,
    };
  });
}

export async function revokeEnrollment(enrollmentId: string): Promise<void> {
  await adminDb.collection("enrollments").doc(enrollmentId).update({
    status: "revoked",
  });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const batch = adminDb.batch();

  // Delete enrollments
  const enrollments = await adminDb
    .collection("enrollments")
    .where("userId", "==", uid)
    .get();
  enrollments.docs.forEach((doc) => batch.delete(doc.ref));

  // Delete progress
  const progress = await adminDb
    .collection("progress")
    .where("userId", "==", uid)
    .get();
  progress.docs.forEach((doc) => batch.delete(doc.ref));

  // Delete favorites
  const favorites = await adminDb
    .collection("favorites")
    .where("userId", "==", uid)
    .get();
  favorites.docs.forEach((doc) => batch.delete(doc.ref));

  // Delete user doc
  batch.delete(adminDb.collection("users").doc(uid));

  await batch.commit();

  // Delete Firebase Auth account
  try {
    await adminAuth.deleteUser(uid);
  } catch (error) {
    // User may already be deleted from Auth
    console.error("Failed to delete Firebase Auth user:", error);
  }
}
