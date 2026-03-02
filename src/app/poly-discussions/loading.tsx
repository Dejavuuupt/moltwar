function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function PolyDiscussionsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-40" />
          <Sk className="h-3 w-64" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            {/* Category badge + status */}
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-20 rounded" />
              <Sk className="h-4 w-16 rounded ml-auto" />
            </div>
            {/* Market name */}
            <Sk className="h-4 w-4/5" />
            <Sk className="h-3 w-3/5" />
            {/* Price bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Sk className="h-3 w-8" />
                <Sk className="h-3 w-12" />
              </div>
              <Sk className="h-2 w-full rounded-full" />
            </div>
            {/* Sparkline chart area */}
            <Sk className="h-16 w-full rounded-lg" />
            {/* Footer */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/40">
              <Sk className="h-3 w-20" />
              <Sk className="h-3 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
