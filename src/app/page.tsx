import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { VrmViewer } from "@/components/vrm-viewer";
import { WavePath } from "@/components/ui/wave-path";
import ThreeDMarquee from "@/components/ui/3d-marquee";
import { Testimonials } from "@/components/testimonials";
import { CtaSection } from "@/components/cta-section";
import { getAllCourses } from "@/lib/firestore/courses";
import { getLessonSummaries } from "@/lib/firestore/lessons";
// Static resource images for the marquee background — self-hosted WebP files
const RESOURCE_IMAGES = Array.from(
  { length: 40 },
  (_, i) => `/images/resources/resource-${String(i + 1).padStart(2, "0")}.webp`
);

export default async function Home() {
  const courses = await getAllCourses();

  const coursesWithMeta = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessonSummaries(course.id);
      return { ...course, lessonCount: lessons.length };
    })
  );
  return (
    <main>
      {/* Hero */}
      <section className="relative flex flex-col overflow-hidden lg:min-h-[80vh] lg:justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-16 px-6 py-12 sm:px-8 lg:px-16 lg:py-20">
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
              <Link href="/courses/3d-vtubing-with-warudo">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="px-8">
                  Browse Courses
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

      {/* Courses Section */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">
              {coursesWithMeta.length === 1 ? "Featured Course" : "Courses"}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything you need to start your VTubing journey
            </p>
          </div>

          <div className={
            coursesWithMeta.length === 1
              ? "mx-auto max-w-2xl"
              : coursesWithMeta.length === 2
                ? "grid gap-6 sm:grid-cols-2 mx-auto max-w-4xl"
                : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }>
            {coursesWithMeta.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="block">
                <Card className="overflow-hidden transition-all hover:shadow-lg h-full">
                  <div className="relative aspect-video bg-muted">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-pink-500/20">
                        <span className="text-lg font-medium text-muted-foreground">
                          {course.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="secondary">
                        {course.lessonCount} {course.lessonCount === 1 ? "Lesson" : "Lessons"}
                      </Badge>
                      {course.isFree && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Free
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {coursesWithMeta.length > 3 && (
            <div className="mt-8 text-center">
              <Link href="/courses">
                <Button variant="outline" size="lg" className="px-8">
                  View All Courses
                </Button>
              </Link>
            </div>
          )}
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

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <CtaSection />
    </main>
  );
}
