import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Mochi",
    handle: "@mochi_vt",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Mochi&backgroundColor=c084fc",
    quote:
      "I went from knowing nothing about 3D VTubing to having my full Warudo setup running in a weekend. The lessons are so clear and easy to follow!",
  },
  {
    name: "Starla",
    handle: "@starla_streams",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Starla&backgroundColor=f472b6",
    quote:
      "The resource hub alone saved me hours of searching. Having everything curated in one place is a game changer for new VTubers.",
  },
  {
    name: "Kai",
    handle: "@kai_vtube",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Kai&backgroundColor=818cf8",
    quote:
      "I was intimidated by 3D VTubing but this course broke it down step by step. Now I'm live on Twitch every week with my own model!",
  },
  {
    name: "Luna",
    handle: "@luna_pixel",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Luna&backgroundColor=fb923c",
    quote:
      "Best investment I've made for my VTubing journey. The Warudo walkthrough alone is worth it — everything just clicked after watching.",
  },
  {
    name: "Nyx",
    handle: "@nyx_after_dark",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Nyx&backgroundColor=a78bfa",
    quote:
      "Finally a VTubing course that doesn't assume you already know everything. Super beginner-friendly and the community Discord is great too.",
  },
  {
    name: "Berry",
    handle: "@berry_bun",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Berry&backgroundColor=f9a8d4",
    quote:
      "I've watched a ton of VTuber tutorials on YouTube but nothing compares to having a structured course. 10/10 would recommend to anyone starting out.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Loved by VTubers</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            See what people are saying about the course
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.handle} className="flex">
              <Card className="flex-1 border-border/50 transition-shadow hover:shadow-md hover:shadow-primary/5">
                <CardContent className="flex h-full flex-col p-6">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-5 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.handle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
