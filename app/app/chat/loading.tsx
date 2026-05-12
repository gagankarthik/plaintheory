import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4 sm:px-6">
      {/* Thread sidebar + main */}
      <div className="flex flex-1 gap-4 overflow-hidden py-4">
        {/* Thread list */}
        <div className="hidden w-56 shrink-0 space-y-2 sm:block">
          <Skeleton className="h-9 w-full rounded-full" />
          <div className="space-y-1.5 pt-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex justify-end">
              <Skeleton className="h-10 w-2/3 rounded-2xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-16 w-3/4 rounded-2xl" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-1/2 rounded-2xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-24 w-4/5 rounded-2xl" />
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 pb-2">
            <Skeleton className="h-11 flex-1 rounded-2xl" />
            <Skeleton className="size-11 shrink-0 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
