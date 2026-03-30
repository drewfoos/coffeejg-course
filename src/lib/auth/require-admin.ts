import { getCurrentUser } from "./get-current-user";

const ADMIN_UIDS = (process.env.ADMIN_UIDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function isAdminUid(uid: string): boolean {
  return ADMIN_UIDS.includes(uid);
}

/**
 * Verifies the current user is an authenticated admin.
 * Throws if not. Use in Server Actions and server components.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  if (!isAdminUid(user.uid)) {
    throw new Error("Forbidden");
  }
  return user;
}
