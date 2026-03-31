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
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">What You&apos;ll Find Here</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything is built around getting you streaming as a 3D VTuber
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
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
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Find Me Everywhere</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Come hang out, watch streams, or just say hi
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Twitch",
                desc: "Live streams",
                href: "https://www.twitch.tv/coffeejg",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                  </svg>
                ),
                color: "group-hover:text-[#9146FF]",
              },
              {
                name: "YouTube",
                desc: "Videos & VODs",
                href: "https://www.youtube.com/@coffeejg-coffee?sub_confirmation=1",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
                  </svg>
                ),
                color: "group-hover:text-[#FF0000]",
              },
              {
                name: "TikTok",
                desc: "Extra streams",
                href: "https://www.tiktok.com/@coffeejg2",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                ),
                color: "group-hover:text-foreground",
              },
              {
                name: "X (Twitter)",
                desc: "Updates & posts",
                href: "https://x.com/coffeejg",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
                color: "group-hover:text-foreground",
              },
              {
                name: "Discord",
                desc: "Community server",
                href: "https://discord.gg/STGMCZVxUx",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                ),
                color: "group-hover:text-[#5865F2]",
              },
              {
                name: "Linktree",
                desc: "All links",
                href: "https://linktr.ee/coffeejg",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.953 15.066l-.038.002a.974.974 0 01-.936-.725l-.002-.01a.972.972 0 01.467-1.067l.006-.004 4.272-2.596a.037.037 0 00.013-.045.037.037 0 00-.039-.02h-4.6a.974.974 0 01-.928-.726.977.977 0 01.464-1.075l9.496-5.781a.976.976 0 011.335.354.978.978 0 01-.353 1.335l-4.27 2.596a.037.037 0 00-.014.045c.006.016.022.026.04.021h4.598a.974.974 0 01.929.726.977.977 0 01-.465 1.075l-9.496 5.781a.974.974 0 01-.48.138zm3.823 8.63h.493c.272 0 .493-.22.493-.493v-6.382a.037.037 0 01.037-.037h.025a.037.037 0 01.037.037v6.382c0 .272.22.493.493.493h.493c.272 0 .493-.22.493-.493v-6.382a.037.037 0 01.038-.037h.024a.037.037 0 01.037.037v6.382c0 .272.22.493.493.493h.493a.493.493 0 00.493-.493v-7.753a.973.973 0 00-.973-.974h-3.09a.973.973 0 00-.974.974v7.753c0 .272.221.493.493.493z" />
                  </svg>
                ),
                color: "group-hover:text-[#43E55E]",
              },
            ].map(({ name, desc, href, icon, color }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors ${color}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <svg className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
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
