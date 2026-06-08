import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Account header */}
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full sm:size-16" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      {/* Snapshot */}
      <div className="space-y-4 rounded-2xl border border-border/60 p-6">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Editor cards */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-border/60 p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
