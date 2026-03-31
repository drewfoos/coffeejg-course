import Link from "next/link";
import { Coffee, ExternalLink } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}


function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

const socials = [
  { icon: XIcon, href: "https://x.com/coffeejg", label: "X" },
  { icon: YoutubeIcon, href: "https://www.youtube.com/@coffeejg-coffee?sub_confirmation=1", label: "YouTube" },
  { icon: TwitchIcon, href: "https://www.twitch.tv/coffeejg", label: "Twitch" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@coffeejg2", label: "TikTok" },
  { icon: DiscordIcon, href: "https://discord.gg/STGMCZVxUx", label: "Discord" },
];

const courses = [
  { label: "3D VTubing with Warudo", href: "/courses/3d-vtubing-with-warudo" },
];

const resources = [
  { label: "Resource Hub", href: "/resources" },
  { label: "Browse Courses", href: "/courses" },
  { label: "About", href: "/about" },
];

const externalLinks = [
  { label: "Linktree", href: "https://linktr.ee/coffeejg" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-card/30 pt-10 pb-6 overflow-hidden">
      {/* Subtle purple glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16">
        {/* Brand row */}
        <div className="flex items-start gap-4 sm:items-center sm:gap-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-pink-500 text-primary-foreground shadow-lg">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              CoffeeJG
            </span>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-md">
              Structured courses and curated resources to help you become a
              professional 3D VTuber.
            </p>
          </div>
          <div className="hidden sm:flex flex-wrap gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns — 3-col on mobile, 4-col on lg */}
        <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-8 lg:grid-cols-4">
          {/* Courses */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Courses
            </h4>
            <ul className="space-y-2">
              {courses.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h4>
            <ul className="space-y-2">
              {resources.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h4>
            <ul className="space-y-2">
              {externalLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    {label}
                    <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/pro"
                  className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="mr-2 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  Get Pro Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social icons — mobile only */}
        <div className="mt-6 flex flex-wrap gap-2 sm:hidden">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        {/* Bottom spacer */}
        <div className="mt-12" />
      </div>
    </footer>
  );
}
