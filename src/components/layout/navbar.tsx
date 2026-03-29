import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        {/* Left */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <svg
              viewBox="0 0 32 32"
              className="h-7 w-7 text-primary"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M9 22V10h4.5c1.3 0 2.3.3 3 1 .7.6 1 1.5 1 2.5s-.3 1.9-1 2.5c-.7.7-1.7 1-3 1H12v5H9Zm3-7.5h1.2c.5 0 .9-.1 1.2-.4.3-.3.4-.6.4-1.1 0-.4-.1-.8-.4-1-.3-.3-.7-.4-1.2-.4H12v2.9Z"
                fill="white"
              />
              <path
                d="M19 22V10h3v12h-3Z"
                fill="white"
                opacity="0.7"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight">CoffeeJG</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/courses/3d-vtubing-with-warudo"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Course
            </Link>
            <Link
              href="/resources"
              className="text-sm text-foreground transition-colors hover:text-primary"
            >
              Resources
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <Link href="/pro">
            <Button
              variant="ghost"
              className="cursor-pointer bg-primary/10 text-foreground hover:bg-primary/20 hover:text-primary font-semibold px-5 py-1.5 h-auto text-sm transition-colors"
            >
              Pro
            </Button>
          </Link>
          <ThemeToggle />
          {user ? (
            <UserMenu userName={user.name || user.email} />
          ) : (
            <Link
              href="/login"
              className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
