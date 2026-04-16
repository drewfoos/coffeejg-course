import Link from "next/link";
import { Coffee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
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
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/courses"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Courses
            </Link>
            <Link
              href="/resources"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Resources
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
          <Link href="/pro" className="hidden sm:block">
            <Button
              variant="ghost"
              className="cursor-pointer bg-primary/10 text-foreground hover:bg-primary/20 hover:text-primary font-semibold px-5 py-1.5 h-auto text-sm transition-colors"
            >
              Pro
            </Button>
          </Link>
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
