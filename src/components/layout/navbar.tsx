import Link from "next/link";
import { Coffee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        {/* Left */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-7 w-7 text-primary" />
          </Link>
          {/* Courses link hidden until the course launches — see redirects in next.config.ts */}
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Resources
            </Link>
            <Link
              href="/favorites"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Favorites
            </Link>
            <Link
              href="/about"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <UserMenu userName={user.name || user.email} photoURL={user.photoURL} />
          ) : (
            <Link
              href="/login"
              className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Sign In
            </Link>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
