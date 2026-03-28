import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            CoffeeJG
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link
              href="/courses/3d-vtubing-with-warudo"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Course
            </Link>
            <Link
              href="/resources"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Resources
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu userName={user.name || user.email} />
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
