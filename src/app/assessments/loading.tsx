function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function AssessmentsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-32" />
          <Sk className="h-3 w-64" />
        </div>
      </div>

      {/* Threat level summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-4 w-4 rounded" />
              <Sk className="h-3 w-16" />
            </div>
            <Sk className="h-5 w-8" />
            <Sk className="h-1.5 w-full rounded-full" />
            <Sk className="h-2.5 w-12" />
          </div>
        ))}
      </div>

      {/* Assessment cards */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Sk className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Sk className="h-4 w-16 rounded" />
                  <Sk className="h-3 w-24 ml-auto" />
                </div>
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
            </div>
            {/* Key findings */}
            <div className="space-y-1.5 border-t border-zinc-800/40 pt-3">
              <Sk className="h-2.5 w-24 mb-2" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Sk className="h-1.5 w-1.5 rounded-full mt-1 shrink-0" />
                  <Sk className="h-3 w-full" />
                </div>
              ))}
            </div>
            {/* Footer: agent tags + timestamp */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex gap-1">
                <Sk className="h-4 w-16 rounded" />
                <Sk className="h-4 w-14 rounded" />
              </div>
              <Sk className="h-3 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
