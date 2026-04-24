import Link from "next/link";
import { AssetForm } from "@/components/admin/asset-form";
import { getSuggestion } from "@/lib/firestore/admin-suggestions";

export default async function NewAssetPage({
  searchParams,
}: {
  searchParams: Promise<{ suggestion?: string }>;
}) {
  const { suggestion: suggestionId } = await searchParams;

  const suggestion = suggestionId ? await getSuggestion(suggestionId) : null;
  const defaults = suggestion
    ? {
        title: suggestion.title,
        artistName: suggestion.artistName,
        description: suggestion.description,
        imageUrl: suggestion.imageUrl,
        externalUrl: suggestion.externalUrl,
        source: suggestion.source,
        tags: suggestion.tags ?? [],
      }
    : undefined;

  return (
    <div>
      <Link
        href={suggestionId ? "/admin/suggestions" : "/admin/assets"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </Link>

      <h1 className="text-2xl font-bold">
        {suggestionId ? "Import suggestion" : "New resource"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {suggestionId
          ? "Fill in the missing details. The suggestion will be marked as imported on save."
          : "Add a new resource to the hub manually."}
      </p>

      <div className="mt-6">
        <AssetForm suggestionId={suggestionId} defaults={defaults} />
      </div>
    </div>
  );
}
