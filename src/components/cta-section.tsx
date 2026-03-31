import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/50 py-24">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
          Start your journey
        </p>
        <h2 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Ready to start{" "}
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            VTubing
          </span>
          ?
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Get started with our complete course and free resource library.
          Everything you need, all in one place.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/courses/3d-vtubing-with-warudo">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
          <Link href="/resources">
            <Button size="lg" variant="outline" className="px-8">
              Browse Resources
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
