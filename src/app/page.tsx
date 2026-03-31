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
// Static resource images for the marquee background — no database call needed
const RESOURCE_IMAGES = [
  "https://storage.ko-fi.com/cdn/useruploads/display/1caceb4c-55bc-4426-8fe9-4d49d69e79ab_easterballoons.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/92ad753a-3604-4776-b54e-ba607817f070_aboutme1.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/e7b243ff-be62-4057-90cd-593e0e055ecb_easterpreview_1.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/889ac20a-ab9e-4c5c-903b-3cd8b853f91a_preview2.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/f4341550-a432-43c8-8435-05c88c02a87c_img_5403.jpeg",
  "https://storage.ko-fi.com/cdn/useruploads/display/0fa77bd8-6566-4707-9f52-0539adc45c9a_spring_2024_01.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/4a887233-1036-4965-bc72-4e64f0969fcc_mokkeemotes.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/d38b4fd5-c272-466c-b88d-186a76d1335a_yellowdutchbunny.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/421b5517-f9fd-4904-8b13-d91089dd862e_blackdutchbunny.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/b4321773-c58f-4581-b984-c1207f0363dc_starbges5.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/4a5f34ca-62d7-4a1b-9075-7ea820384fd7_asdasdasdcv.png",
  "https://booth.pximg.net/94833bc0-b0eb-4b50-919a-d053bb7a2806/i/4554282/4dce6b0a-4528-409e-8a6a-4fd5bda66cdc_base_resized.jpg",
  "https://booth.pximg.net/c6a7ce95-9c3c-4443-8848-ca10f7acddf6/i/3592778/8be2019d-d34b-487c-bafd-4dc08cdc0c2f_base_resized.jpg",
  "https://booth.pximg.net/53221c0e-08f8-406b-aae5-4c6534bc38b6/i/2664299/2e5ee615-83f3-44b0-ab96-04bc5aa17876_base_resized.jpg",
  "https://booth.pximg.net/c/620x620/25a148c5-d1c1-497c-b51b-3cb2c90e777b/i/4877199/3f9b9556-f1e7-4a8e-be51-e6366cd3f100_base_resized.jpg",
  "https://booth.pximg.net/d66683e2-3a8f-4bd6-997c-8563c8fceabb/i/3029414/e6f8dea8-e288-4ed2-94b7-403799f71130_base_resized.jpg",
  "https://booth.pximg.net/ca361a94-d9a4-431e-80e9-d85e12a39bf6/i/4550276/db8269aa-2b55-4d47-8b18-8abea09becb3_base_resized.jpg",
  "https://booth.pximg.net/e6129b72-54ab-4167-865c-1bd66ea02e66/i/3613390/27a6a462-f671-472e-be2c-34833cbed753_base_resized.jpg",
  "https://booth.pximg.net/0346351e-0d91-4ef4-8931-edbb68a01e5f/i/3778749/b82722f1-853b-4a9b-a645-cc58a852f326_base_resized.jpg",
  "https://booth.pximg.net/0346351e-0d91-4ef4-8931-edbb68a01e5f/i/4170307/2fc7f681-74f1-46fb-a589-48369128db55_base_resized.jpg",
  "https://booth.pximg.net/0346351e-0d91-4ef4-8931-edbb68a01e5f/i/4349672/83639919-4a67-4913-99b9-795c386b967c_base_resized.jpg",
  "https://booth.pximg.net/0346351e-0d91-4ef4-8931-edbb68a01e5f/i/4478499/5e6cb427-ebc3-4137-88e3-c31163b3d675_base_resized.jpg",
  "https://booth.pximg.net/a3e0fbac-db1c-4d57-9806-afcbed65b1dc/i/5101536/b7d89d01-1274-4bf1-a477-b802f270ad9b_base_resized.jpg",
  "https://booth.pximg.net/c/620x620/a0c5522d-a359-46ef-a8eb-0c93b34fba93/i/5367096/618a50a7-000a-44e7-8507-7c9886635c83_base_resized.jpg",
  "https://booth.pximg.net/1236a738-b0ee-4cef-895d-e6402f725d6c/i/4859035/e2179da9-565b-4f1b-9f50-a7a62409ddf4_base_resized.jpg",
  "https://booth.pximg.net/93e6de58-c405-4da5-b5a9-6542c16703e9/i/5854921/814509ac-0c06-4bdb-881e-d5d2441d7db1_base_resized.jpg",
  "https://booth.pximg.net/7c08ff90-352e-4b0e-bafa-24a891ecb0fb/i/3480146/39cd14d5-582b-4d24-9724-00110375b2ee_base_resized.jpg",
  "https://booth.pximg.net/2489e670-2dbe-4aad-b781-abb4ae1035a3/i/5380991/915c1b2c-cc33-460e-8aa9-77ef947deff8_base_resized.jpg",
  "https://booth.pximg.net/c025737e-c5c0-424c-821d-5886ed011eec/i/4118786/944bb0bb-9cca-444c-9e7f-42f4117790e2_base_resized.jpg",
  "https://storage.ko-fi.com/cdn/useruploads/display/05a1fe93-e680-41ea-a5d4-99ecdb6ae60d_example2.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/ea146423-0563-4602-b38a-802179120320_retrosystemoverlopng.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/ae46eaeb-75ee-4e40-aa95-961e77cf18c4_hearthlightch.01frameoverlaythumbnail.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/37f061d1-55d0-4215-b55d-33a13ccce019_thumbnail.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/76679323-f2aa-4a7c-babb-5230f799131b_f2uheartoverlayprev.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/ea52917c-aa51-4501-b6f1-82a108f3b461_demoimg.png",
  "https://storage.vgen.co/uploads/03269c21-1ed5-4573-9a1a-f06202c539f8/services/153b7b8f-5cd9-48d6-8371-2ef000f4ffd8.webp",
  "https://storage.ko-fi.com/cdn/useruploads/display/ffb4b6b7-ff3c-470f-9bf1-f59e46833fd4_bges.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/d185629d-4fe4-459b-89ec-09e9847f1443_frontpage.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/277e5dc3-37ca-4299-b6ca-6654fe9ffef4_kofigraphics.png",
  "https://storage.ko-fi.com/cdn/useruploads/display/49a64f2d-d08f-4003-8d9a-384d248eb6ab_flowercrown_promo.png",
];

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
