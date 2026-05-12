import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Habit cards */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/60 px-5 py-4">
            <Skeleton className="size-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Heat grid */}
      <div className="rounded-2xl border border-border/60 p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-7 gap-1">
          {[...Array(49)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
