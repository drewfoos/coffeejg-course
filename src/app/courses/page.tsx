import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Construction, Bell } from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center">
          <Badge variant="secondary" className="mb-4">
            Learn
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Courses</h1>
          <p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">
            Structured video courses to take you from first setup to going live
            as a professional 3D VTuber.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Construction className="h-10 w-10 text-primary" />
          </div>

          <h2 className="mt-8 text-2xl font-bold">Under Development</h2>
          <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
            We&apos;re building comprehensive VTubing courses covering
            everything from initial setup to advanced streaming techniques.
            Check back soon!
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/resources">
              <Button size="lg" className="px-8">
                Browse Free Resources
              </Button>
            </Link>
          </div>

          <div className="mt-16 w-full rounded-xl border border-border/50 bg-card/60 p-8 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>What to expect</span>
            </div>
            <div className="mt-6 grid gap-6 text-left sm:grid-cols-3">
              <div>
                <p className="font-semibold">3D VTubing with Warudo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete guide from first setup to going live
                </p>
              </div>
              <div>
                <p className="font-semibold">Video Lessons</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Step-by-step walkthroughs with real examples
                </p>
              </div>
              <div>
                <p className="font-semibold">Lifetime Access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pay once, access forever — including updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
