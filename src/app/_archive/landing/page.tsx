import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { VrmViewer } from "@/components/vrm-viewer";
import { WavePath } from "@/components/ui/wave-path";
import ThreeDMarquee from "@/components/ui/3d-marquee";
import { Construction } from "lucide-react";
// Static resource images for the marquee background — self-hosted WebP files
const RESOURCE_IMAGES = Array.from(
  { length: 40 },
  (_, i) => `/images/resources/resource-${String(i + 1).padStart(2, "0")}.webp`
);

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex flex-col overflow-hidden lg:min-h-[80vh] lg:justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-16 px-6 py-12 sm:px-8 lg:px-16 lg:py-20">
          {/* Left: Text */}
          <div className="max-w-xl flex-1">
            <Badge variant="secondary" className="mb-6">
              Your VTubing Journey Starts Here
            </Badge>
            <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              Learn{" "}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                3D VTubing
              </span>{" "}
              with CoffeeJG
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              Courses, curated resources, and everything you need to become a
              professional 3D VTuber. From first setup to going live.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href="/resources">
                <Button size="lg" className="px-8">
                  Browse Resources
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="px-8">
                  View Courses
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold">490+</p>
                <p className="text-sm text-muted-foreground">Free Assets</p>
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

          {/* Right: 3D model on desktop only */}
          <div className="hidden flex-shrink-0 lg:block">
            <VrmViewer
              url="/models/3859814441197244330.vrm"
              className="h-[550px] w-[400px]"
              showStage
            />
          </div>
        </div>

        {/* Mobile: character image centered below text */}
        <div className="flex justify-center pb-8 lg:hidden">
          <Image
            src="/images/hero/coffeejg-figure-compressed.png"
            alt="CoffeeJG VTuber character"
            width={280}
            height={380}
            className="h-[320px] w-auto object-contain sm:h-[380px]"
            priority
          />
        </div>
      </section>

      {/* Wave divider */}
      <div className="flex justify-center py-4">
        <WavePath />
      </div>

      {/* Courses Coming Soon */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-3xl px-8 lg:px-16">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Construction className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-bold">Courses Coming Soon</h2>
            <p className="mt-3 max-w-lg text-lg text-muted-foreground">
              We&apos;re building comprehensive video courses covering
              everything from initial setup to advanced streaming techniques.
            </p>
            <div className="mt-8">
              <Link href="/courses">
                <Button variant="outline" size="lg" className="px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Hub CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <ThreeDMarquee images={RESOURCE_IMAGES} className="h-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-8 lg:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-2xl bg-background/80 px-8 py-12 backdrop-blur-sm">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                100% Free
              </Badge>
              <h2 className="text-3xl font-bold">Resource Hub</h2>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                Browse free VTuber assets, tools, and references. Filter by
                category, save your favorites, and find everything you need in
                one place.
              </p>
              <div className="mt-8">
                <Link href="/resources">
                  <Button size="lg" className="px-8">
                    Browse Resources
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
