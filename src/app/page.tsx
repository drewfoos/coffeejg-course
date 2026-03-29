import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-16 px-8 py-20 lg:px-16">
          {/* Left: Text */}
          <div className="max-w-xl flex-1">
            <Badge variant="secondary" className="mb-6">
              Now Available
            </Badge>
            <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              Learn{" "}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                3D VTubing
              </span>{" "}
              with Warudo
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              Structured courses and curated resources to help you become a
              professional 3D VTuber. From first setup to going live.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href="/pro">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/courses/3d-vtubing-with-warudo">
                <Button size="lg" variant="outline" className="px-8">
                  Browse Course
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold">10+</p>
                <p className="text-sm text-muted-foreground">Video Lessons</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div>
                <p className="text-2xl font-bold">Free</p>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div>
                <p className="text-2xl font-bold">Lifetime</p>
                <p className="text-sm text-muted-foreground">Access</p>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="hidden flex-shrink-0 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/coffeejg-figure-compressed.png"
              alt="CoffeeJG VTuber"
              className="h-[500px] w-auto drop-shadow-2xl"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Course Section */}
      <section className="border-t border-border/50 bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Featured Course</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything you need to start your VTubing journey
            </p>
          </div>

          <Link href="/courses/3d-vtubing-with-warudo" className="block">
            <Card className="mx-auto max-w-4xl overflow-hidden transition-all hover:shadow-lg">
              <div className="grid md:grid-cols-[1.2fr_1fr]">
                <div className="aspect-video bg-muted md:aspect-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://placehold.co/800x450/1a1a2e/e94560?text=3D+VTubing+with+Warudo"
                    alt="3D VTubing with Warudo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="flex flex-col justify-center p-8">
                  <Badge variant="secondary" className="w-fit mb-3">
                    10 Lessons
                  </Badge>
                  <h3 className="text-2xl font-bold">
                    3D VTubing with Warudo: Complete Guide
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    From setting up Warudo to going live with your first stream.
                    Covers motion tracking, scene design, expressions, and OBS
                    integration.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      2 free preview lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Progress tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Lifetime access
                    </li>
                  </ul>
                </CardContent>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Resource Hub CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-16">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold">Free Resource Hub</h2>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                Browse free VTuber assets, tools, and references. Filter by
                category, save your favorites, and find everything you need in
                one place.
              </p>
            </div>
            <Link href="/resources">
              <Button size="lg" variant="outline" className="px-8">
                Browse Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5 py-20">
        <div className="mx-auto max-w-2xl text-center px-4">
          <h2 className="text-3xl font-bold">Ready to start VTubing?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started with our complete course and free resource library.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/pro">
              <Button size="lg" className="px-8">
                Get Pro Access
              </Button>
            </Link>
            <Link href="/courses/3d-vtubing-with-warudo">
              <Button size="lg" variant="outline" className="px-8">
                View Course
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
