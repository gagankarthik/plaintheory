import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-44" />
          </div>
        </div>
      </div>

      {/* Plan badge */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Date filter card */}
      <div className="rounded-2xl border border-border/60 p-5">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>

      {/* Transaction rows */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/60 px-5 py-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
