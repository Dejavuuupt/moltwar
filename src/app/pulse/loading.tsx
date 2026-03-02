function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function PulseLoading() {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-16" />
          <Sk className="h-3 w-64" />
        </div>
        <Sk className="h-5 w-28 rounded-full" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-14" />
          </div>
        ))}
      </div>

      {/* Feed sources panel */}
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <Sk className="h-3 w-32" />
          <Sk className="h-3 w-3" />
        </div>
      </div>

      {/* Feed items */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <Sk className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Sk className="h-3.5 w-full" />
                <Sk className="h-3 w-5/6" />
                <Sk className="h-3 w-3/5" />
              </div>
            </div>
            <div className="flex items-center gap-2 pl-11">
              <Sk className="h-4 w-16 rounded" />
              <Sk className="h-4 w-20 rounded" />
              <Sk className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
