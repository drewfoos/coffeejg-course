"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { setSessionCookie, clearSessionCookie } from "./session";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await setSessionCookie(idToken);
      }
    });

    return () => unsubscribe();
  }, []);

  // Refresh the session cookie when the token refreshes (every ~55 min)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const idToken = await user.getIdToken(true);
      await setSessionCookie(idToken);
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(interval);
  }, [user]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    await clearSessionCookie();
    setUser(null);
  };

  return (
    <AuthContext value={{ user, loading, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
