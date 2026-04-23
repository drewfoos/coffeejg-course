import Link from "next/link";
import { listSuggestions } from "@/lib/firestore/admin-suggestions";
import { SuggestionActions } from "@/components/admin/suggestion-actions";
import type { Suggestion } from "@/lib/types";

const STATUS_FILTERS: Array<{
  label: string;
  value: Suggestion["status"] | "all";
}> = [
  { label: "New", value: "new" },
  { label: "Imported", value: "imported" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (
    STATUS_FILTERS.find((f) => f.value === status)?.value ?? "new"
  ) as Suggestion["status"] | "all";

  const suggestions = await listSuggestions(
    activeStatus === "all" ? {} : { status: activeStatus }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Resource Suggestions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        User-submitted resources. Import to add to the hub, or reject to dismiss.
      </p>

      {/* Status tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.value === activeStatus;
          return (
            <Link
              key={f.value}
              href={
                f.value === "new"
                  ? "/admin/suggestions"
                  : `/admin/suggestions?status=${f.value}`
              }
              className={
                isActive
                  ? "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  : "rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-border/50 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <a
                  href={s.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-primary hover:underline"
                >
                  {s.externalUrl}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">{s.source}</span>
                  {" · "}
                  <span>{s.userEmail}</span>
                  {" · "}
                  <span>
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {s.status !== "new" && (
                    <>
                      {" · "}
                      <span className="capitalize">{s.status}</span>
                    </>
                  )}
                </p>
                {s.note && (
                  <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    {s.note}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <SuggestionActions suggestionId={s.id} status={s.status} />
              </div>
            </div>
          </div>
        ))}

        {suggestions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No suggestions in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
