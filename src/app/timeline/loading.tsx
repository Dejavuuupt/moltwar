function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function TimelineLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-52" />
        </div>
      </div>

      {/* Stat counters strip */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-3 w-12" />
            <Sk className="h-6 w-8" />
          </div>
        ))}
      </div>

      {/* Era filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} className="h-7 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Timeline era group */}
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="space-y-2">
          {/* Era header */}
          <div className="flex items-center gap-2 py-1">
            <Sk className="h-3 w-20" />
            <Sk className="h-3 w-14 ml-1" />
            <Sk className="h-px flex-1" />
          </div>
          {/* Timeline entries */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {/* Date column */}
              <div className="w-24 shrink-0 pt-1 space-y-1">
                <Sk className="h-3 w-20" />
                <Sk className="h-2.5 w-14" />
              </div>
              {/* Connector dot */}
              <div className="flex flex-col items-center shrink-0">
                <Sk className="h-3 w-3 rounded-full mt-1.5" />
                <Sk className="w-px flex-1 mt-1" />
              </div>
              {/* Content card */}
              <div className="flex-1 rounded-xl border border-zinc-800/60 bg-[#111113] p-4 mb-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Sk className="h-4 w-14 rounded" />
                  <Sk className="h-4 w-12 rounded" />
                  <Sk className="h-4 w-16 rounded ml-auto" />
                </div>
                <Sk className="h-4 w-4/5" />
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
