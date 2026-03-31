import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/cta-section";

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-12 px-6 py-16 sm:px-8 md:flex-row md:gap-16 lg:px-16 lg:py-24">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <Badge variant="secondary" className="mb-4">
              About
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Hey, I&apos;m{" "}
              <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                CoffeeJG
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              I&apos;m a 3D VTuber and content creator passionate about helping
              others break into the world of VTubing. I stream on Twitch, post
              videos on YouTube, and build resources so you don&apos;t have to
              figure everything out the hard way.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              This platform is my way of sharing everything I&apos;ve learned
              &mdash; from setting up your first 3D model in Warudo to going
              live with a full production setup.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/courses">
                <Button size="lg">Browse Courses</Button>
              </Link>
              <Link href="/resources">
                <Button size="lg" variant="outline">
                  Free Resources
                </Button>
              </Link>
            </div>
          </div>

          {/* Character image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 blur-2xl" />
              <Image
                src="/images/hero/coffeejg-figure-compressed.png"
                alt="CoffeeJG VTuber character"
                width={350}
                height={450}
                className="relative h-[350px] w-auto object-contain sm:h-[420px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What you'll find */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">What You&apos;ll Find Here</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything is built around getting you streaming as a 3D VTuber
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  🎓
                </div>
                <h3 className="text-lg font-bold">Structured Courses</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Step-by-step video lessons that take you from zero to a fully
                  set up 3D VTuber. No guesswork, no skipping around.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  🎨
                </div>
                <h3 className="text-lg font-bold">Free Resource Hub</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A curated library of free VTuber assets &mdash; models, props,
                  emotes, overlays, and tools all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  💬
                </div>
                <h3 className="text-lg font-bold">Community</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Join the Discord to connect with other VTubers, ask questions,
                  share your setup, and get feedback.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Socials / Connect */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Find Me Everywhere</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Come hang out, watch streams, or just say hi
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              {
                name: "Twitch",
                desc: "Live streams",
                href: "https://www.twitch.tv/coffeejg",
              },
              {
                name: "YouTube",
                desc: "Videos & VODs",
                href: "https://www.youtube.com/@coffeejg-coffee?sub_confirmation=1",
              },
              {
                name: "TikTok",
                desc: "Extra streams",
                href: "https://www.tiktok.com/@coffeejg2",
              },
              {
                name: "X (Twitter)",
                desc: "Updates & posts",
                href: "https://x.com/coffeejg",
              },
              {
                name: "Discord",
                desc: "Community server",
                href: "https://discord.gg/STGMCZVxUx",
              },
              {
                name: "Linktree",
                desc: "All links",
                href: "https://linktr.ee/coffeejg",
              },
            ].map(({ name, desc, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
              >
                <div className="flex-1">
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {name}
                  </p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <span className="text-muted-foreground/40 transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />
    </main>
  );
}
