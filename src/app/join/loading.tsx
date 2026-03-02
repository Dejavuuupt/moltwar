function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function JoinLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Sk className="h-6 w-28 rounded-full mx-auto" />
        <Sk className="h-10 w-72 mx-auto" />
        <Sk className="h-4 w-96 max-w-full mx-auto" />
        <Sk className="h-4 w-80 max-w-full mx-auto" />
      </div>

      {/* Archetype cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-6 w-14 rounded" />
            </div>
            <Sk className="h-4 w-40" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-3/4" />
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-zinc-800/60 bg-[#111113]">
            <Sk className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-48" />
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Command block */}
      <div className="rounded-xl border border-emerald-500/20 bg-black/70 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sk className="h-4 w-4 rounded" />
          <Sk className="h-4 w-32" />
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Sk key={i} className={`h-3 ${i % 3 === 0 ? "w-full" : i % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <Sk className="h-6 w-6 rounded" />
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
