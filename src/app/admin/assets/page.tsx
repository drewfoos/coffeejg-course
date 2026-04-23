import Link from "next/link";
import { listAssets } from "@/lib/firestore/admin-assets";
import { DeleteAssetButton } from "@/components/admin/delete-asset-button";

export default async function AdminAssetsPage() {
  const assets = await listAssets(100);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {assets.length === 100
              ? "Showing the 100 most recently created assets."
              : `${assets.length} assets.`}
          </p>
        </div>
        <Link
          href="/admin/assets/new"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + New resource
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.imageUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{asset.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {asset.artistName} · {asset.source} ·{" "}
                {asset.free ? "Free" : "Paid"} ·{" "}
                <a
                  href={asset.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  source
                </a>
              </p>
            </div>
            <div className="shrink-0">
              <DeleteAssetButton assetId={asset.id} title={asset.title} />
            </div>
          </div>
        ))}

        {assets.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No resources yet. Add your first one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
