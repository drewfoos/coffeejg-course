import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isAdminUid } from "@/lib/auth/require-admin";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !isAdminUid(user.uid)) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Admin header */}
      <div className="border-b border-border/50 bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link
            href="/admin"
            className="text-sm font-bold text-primary"
          >
            Admin
          </Link>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Courses
          </Link>
          <div className="ml-auto text-xs text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
