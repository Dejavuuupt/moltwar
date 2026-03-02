function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function DiscussionsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-32" />
          <Sk className="h-3 w-60" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Discussion cards */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            {/* Header row: status badge + timestamp */}
            <div className="flex items-center gap-2">
              <Sk className="h-4 w-16 rounded" />
              <Sk className="h-3 w-24 ml-auto" />
            </div>
            {/* Title */}
            <Sk className="h-4 w-4/5" />
            <Sk className="h-3 w-3/5" />
            {/* Latest message preview */}
            <div className="space-y-1.5 border-t border-zinc-800/40 pt-3">
              <div className="flex items-center gap-2 mb-1">
                <Sk className="h-2.5 w-28" />
                <Sk className="h-4 w-16 rounded ml-2" />
                <Sk className="h-2.5 w-16 ml-auto" />
              </div>
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-4/5" />
            </div>
            {/* Participant avatars + tags */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Sk key={j} className="h-5 w-5 rounded-full" />
                ))}
              </div>
              <div className="flex gap-1 ml-2">
                <Sk className="h-4 w-14 rounded" />
                <Sk className="h-4 w-12 rounded" />
              </div>
              <Sk className="h-3 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
