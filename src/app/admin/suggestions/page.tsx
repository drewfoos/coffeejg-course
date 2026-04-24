import Link from "next/link";
import {
  countSuggestions,
  listSuggestions,
  type SuggestionWithId,
} from "@/lib/firestore/admin-suggestions";
import { SuggestionActions } from "@/components/admin/suggestion-actions";
import type { Suggestion } from "@/lib/types";

type StatusFilter = Suggestion["status"] | "all";

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "New", value: "new" },
  { label: "Imported", value: "imported" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

const ACCENT: Record<Suggestion["status"], string> = {
  new: "before:bg-primary",
  imported: "before:bg-emerald-500/80",
  rejected: "before:bg-muted-foreground/30",
  approved: "before:bg-sky-500/80",
};

const STATUS_BADGE: Record<Suggestion["status"], string> = {
  new: "bg-primary/10 text-primary",
  imported: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-muted text-muted-foreground",
  approved: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (STATUS_FILTERS.find((f) => f.value === status)?.value ??
    "new") as StatusFilter;

  // One list query + four count queries in parallel. Counts power the tab
  // badges; the aggregation query is cheaper than reading docs.
  const [suggestions, newCount, importedCount, rejectedCount, totalCount] =
    await Promise.all([
      listSuggestions(activeStatus === "all" ? {} : { status: activeStatus }),
      countSuggestions("new"),
      countSuggestions("imported"),
      countSuggestions("rejected"),
      countSuggestions(),
    ]);

  const COUNT_BY_STATUS: Record<StatusFilter, number> = {
    new: newCount,
    imported: importedCount,
    rejected: rejectedCount,
    approved: 0,
    all: totalCount,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Curation
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Resource Suggestions
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Community-submitted resources awaiting review. Import to publish,
            reject to dismiss — rejections are remembered.
          </p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{newCount}</span>{" "}
          pending · {totalCount} total
        </div>
      </div>

      {/* Status tabs */}
      <div className="sticky top-0 z-10 -mx-6 mt-6 border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const isActive = f.value === activeStatus;
            const count = COUNT_BY_STATUS[f.value];
            return (
              <Link
                key={f.value}
                href={
                  f.value === "new"
                    ? "/admin/suggestions"
                    : `/admin/suggestions?status=${f.value}`
                }
                className={
                  "group inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors " +
                  (isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground")
                }
              >
                {f.label}
                <span
                  className={
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums " +
                    (isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-background")
                  }
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {suggestions.map((s, i) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            priority={i < 2}
            accentClass={ACCENT[s.status]}
            badgeClass={STATUS_BADGE[s.status]}
          />
        ))}

        {suggestions.length === 0 && <EmptyState status={activeStatus} />}
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion: s,
  priority,
  accentClass,
  badgeClass,
}: {
  suggestion: SuggestionWithId;
  priority: boolean;
  accentClass: string;
  badgeClass: string;
}) {
  const submittedOn = new Date(s.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={
        "relative overflow-hidden rounded-xl border border-border/50 bg-card transition-colors hover:border-border " +
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px] " +
        accentClass
      }
    >
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:gap-6 sm:p-5">
        {/* Preview image */}
        <a
          href={s.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/40 sm:w-56"
          aria-label={`Open preview image for ${s.title} in a new tab`}
        >
          <div className="aspect-[4/3] w-full">
            {s.imageUrl ? (
              // User-submitted image from an arbitrary host — plain <img> avoids
              // next.config remote-pattern churn for this admin-only view.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.imageUrl}
                alt=""
                width={448}
                height={336}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : "low"}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 via-black/10 to-transparent px-2.5 py-2 text-[10px] font-medium uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span>View image</span>
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>
        </a>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h2 className="min-w-0 flex-1 text-lg font-semibold leading-tight tracking-tight">
              {s.title || (
                <span className="italic text-muted-foreground">Untitled</span>
              )}
            </h2>
            <span
              className={
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                badgeClass
              }
            >
              {s.status}
            </span>
          </div>

          {s.artistName && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground/80">
                {s.artistName}
              </span>
            </p>
          )}

          <a
            href={s.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex max-w-full items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <span className="truncate">{s.externalUrl}</span>
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>

          {s.description && (
            <p className="mt-3 whitespace-pre-wrap rounded-md bg-muted/30 px-3 py-2 text-sm leading-relaxed text-foreground/80">
              {s.description}
            </p>
          )}

          {s.tags && s.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/50 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="font-semibold text-foreground/70">
                {s.source}
              </span>
              <span className="mx-1.5 opacity-50">·</span>
              {s.userEmail}
              <span className="mx-1.5 opacity-50">·</span>
              {submittedOn}
            </p>
            <SuggestionActions suggestionId={s.id} status={s.status} />
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ status }: { status: StatusFilter }) {
  const label =
    status === "new"
      ? "No suggestions waiting for review."
      : status === "imported"
        ? "Nothing imported yet."
        : status === "rejected"
          ? "No rejections to show."
          : "No suggestions in this category.";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
