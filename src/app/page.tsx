import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Learn 3D VTubing with Warudo
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Structured courses and curated resources to help you become a
          professional 3D VTuber. From first setup to going live.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/courses/3d-vtubing-with-warudo">
            <Button size="lg">Browse Course</Button>
          </Link>
          <Link href="/resources">
            <Button size="lg" variant="outline">
              Resource Hub
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Course */}
      <section className="mx-auto max-w-4xl px-4 pb-24">
        <h2 className="mb-6 text-2xl font-bold">Featured Course</h2>
        <Link href="/courses/3d-vtubing-with-warudo">
          <Card className="overflow-hidden transition-colors hover:bg-accent/50">
            <div className="aspect-video bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://placehold.co/800x450/1a1a2e/e94560?text=3D+VTubing+with+Warudo"
                alt="3D VTubing with Warudo"
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold">
                3D VTubing with Warudo: Complete Guide
              </h3>
              <p className="mt-2 text-muted-foreground">
                10 lessons covering everything from setting up Warudo to going
                live with your first stream. Includes motion tracking, scene
                design, and OBS integration.
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </main>
  );
}
