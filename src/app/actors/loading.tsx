function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function ActorsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-56" />
        </div>
      </div>

      {/* Side group headers */}
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="space-y-3">
          {/* Group label */}
          <div className="flex items-center gap-2">
            <Sk className="h-4 w-4 rounded" />
            <Sk className="h-3.5 w-28" />
            <Sk className="h-3 w-12 ml-auto" />
          </div>
          {/* Actor cards in group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
                {/* Avatar + name */}
                <div className="flex items-start gap-3">
                  <Sk className="h-14 w-14 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Sk className="h-4 w-3/4" />
                    <Sk className="h-3 w-1/2" />
                    <Sk className="h-2.5 w-16 rounded mt-1" />
                  </div>
                </div>
                {/* Description */}
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-4/5" />
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Sk className="h-2.5 w-16" />
                    <Sk className="h-3 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Sk className="h-2.5 w-16" />
                    <Sk className="h-3 w-14" />
                  </div>
                </div>
                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-800/40">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Sk key={j} className="h-4 w-16 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
