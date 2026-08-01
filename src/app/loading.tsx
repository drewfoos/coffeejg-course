import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SIZE } from "@/lib/constants";

export default function ResourcesLoading() {
  return (
    <main>
      {/* Header skeleton */}
      <div className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-6 w-96" />
          <Skeleton className="mt-6 h-11 w-full max-w-xl rounded-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Filter skeleton */}
        <div className="space-y-4">
          <div>
            <Skeleton className="mb-2 h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-12" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border/50"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
