import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex bg-background">
      {/* Left branding panel — hidden on mobile */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative shapes */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <Image
              src="/images/branding/logo-coffee-nobg.svg"
              alt="CoffeeJG"
              width={44}
              height={44}
              className="drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-white drop-shadow-sm">
              CoffeeJG
            </span>
          </Link>

          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Start your VTubing
            <br />
            journey today.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
            Learn everything from 3D model setup to going live — with
            step-by-step video courses made for creators.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-base">
                🎬
              </span>
              10+ video lessons with Warudo & VTube Studio
            </div>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-base">
                🎨
              </span>
              Free resource hub with curated VTuber assets
            </div>
            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-base">
                📈
              </span>
              Track your progress as you learn
            </div>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-8 xl:px-16">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} CoffeeJG. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center overflow-y-auto px-6 py-12 lg:w-1/2 lg:px-12">
        {/* Mobile logo — visible only on small screens */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 lg:hidden"
        >
          <Image
            src="/images/branding/logo-coffee-nobg.svg"
            alt="CoffeeJG"
            width={36}
            height={36}
          />
          <span className="text-xl font-bold">CoffeeJG</span>
        </Link>

        <div className="w-full max-w-[420px]">
          <Suspense>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
