function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function TheatersLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-28" />
          <Sk className="h-3 w-64" />
        </div>
      </div>

      {/* Map placeholder */}
      <Sk className="h-64 w-full rounded-xl" />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Theater cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] overflow-hidden">
            {/* Image area */}
            <Sk className="h-36 w-full rounded-none" />
            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sk className="h-4 w-20 rounded" />
                <Sk className="h-4 w-16 rounded ml-auto" />
              </div>
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-4/5" />
              {/* Forces list */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-800/40">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Sk key={j} className="h-4 w-20 rounded" />
                ))}
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <Sk className="h-2.5 w-full" />
                    <Sk className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
