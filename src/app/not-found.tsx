import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-pink-500 text-primary-foreground shadow-lg shadow-primary/20">
        <Coffee className="h-10 w-10" />
      </div>
      <h1 className="mt-8 text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-xl font-medium text-foreground">
        Page not found
      </p>
      <p className="mt-2 max-w-md text-muted-foreground">
        Looks like this page wandered off. Maybe it&apos;s practicing a new dance
        animation somewhere.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
        <Link href="/courses">
          <Button size="lg" variant="outline">
            Browse Courses
          </Button>
        </Link>
      </div>
    </main>
  );
}
