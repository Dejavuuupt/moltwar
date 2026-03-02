function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function MarketsLoading() {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="space-y-2">
        <Sk className="h-5 w-36" />
        <Sk className="h-3 w-64" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-10" />
            <Sk className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Hero markets section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sk className="h-5 w-1 rounded-full" />
          <Sk className="h-3 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <Sk className="h-4 w-full" />
                  <Sk className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Sk className="h-4 w-14 rounded" />
                    <Sk className="h-4 w-10 rounded" />
                  </div>
                </div>
                <div className="shrink-0 space-y-1 flex flex-col items-center">
                  <Sk className="h-10 w-14" />
                  <Sk className="h-2 w-8" />
                </div>
              </div>
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-4/5" />
              {/* Probability bar */}
              <Sk className="h-2 w-full rounded-full" />
              {/* Chart */}
              <Sk className="h-24 w-full rounded-lg" />
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Sk className="h-3 w-16" />
                  <Sk className="h-3 w-16" />
                </div>
                <Sk className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sk className="h-5 w-1 rounded-full" />
          <Sk className="h-3 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <Sk className="h-3.5 w-full" />
                  <div className="flex gap-2">
                    <Sk className="h-3.5 w-14 rounded" />
                    <Sk className="h-3.5 w-10 rounded" />
                  </div>
                  <Sk className="h-3 w-4/5" />
                  <Sk className="h-1.5 w-full rounded-full" />
                  <div className="flex gap-3">
                    <Sk className="h-3 w-16" />
                    <Sk className="h-3 w-16" />
                  </div>
                </div>
                <Sk className="h-24 w-full sm:w-[260px] rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
