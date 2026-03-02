function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function EventsLoading() {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-56" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-14" />
          </div>
        ))}
      </div>

      {/* Timeline / feed */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4">
            <div className="flex items-start gap-3">
              {/* Type badge icon */}
              <Sk className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                {/* Tag + timestamp row */}
                <div className="flex items-center gap-2">
                  <Sk className="h-4 w-20 rounded" />
                  <Sk className="h-3 w-24 ml-auto" />
                </div>
                {/* Description */}
                <Sk className="h-3.5 w-full" />
                <Sk className="h-3 w-5/6" />
                {/* Agent info */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Sk className="h-5 w-5 rounded" />
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-14 ml-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
