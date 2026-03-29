import { adminAuth } from "@/lib/firebase/admin";
import { getSessionToken } from "./session";

export interface AuthUser {
  uid: string;
  email: string;
  name: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = await getSessionToken();
    if (!token) return null;

    const decoded = await adminAuth.verifySessionCookie(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}
