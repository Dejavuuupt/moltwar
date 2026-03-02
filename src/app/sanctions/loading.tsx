function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function SanctionsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-28" />
          <Sk className="h-3 w-60" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-10" />
            <Sk className="h-2.5 w-20" />
          </div>
        ))}
      </div>

      {/* Impact overview bar */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sk className="h-4 w-4 rounded" />
          <Sk className="h-3.5 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Sk className="h-3 w-24 shrink-0" />
              <Sk className="h-2.5 flex-1 rounded-full" />
              <Sk className="h-3 w-12 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Sanctions entries */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Sk className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Sk className="h-4 w-16 rounded" />
                  <Sk className="h-4 w-20 rounded" />
                  <Sk className="h-3 w-16 ml-auto" />
                </div>
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/40">
              <Sk className="h-3 w-28" />
              <Sk className="h-3 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
