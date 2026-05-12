import { Skeleton } from "@/components/ui/skeleton";

export default function PlanLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-52" />
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-border/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Focus actions */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 mb-3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 px-5 py-4">
            <Skeleton className="size-5 rounded-full shrink-0" />
            <Skeleton className="size-4 w-4 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Custom task input */}
      <div className="rounded-2xl border border-border/60 p-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      {/* Water & mood */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
