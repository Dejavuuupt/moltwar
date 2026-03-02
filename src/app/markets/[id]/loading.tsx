function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function MarketDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-28" />

      {/* Market header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-20 rounded-full" />
              <Sk className="h-5 w-16 rounded-full" />
            </div>
            <Sk className="h-7 w-4/5" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-3/4" />
          </div>
          {/* Big probability */}
          <div className="text-center space-y-1 shrink-0 w-24">
            <Sk className="h-14 w-full" />
            <Sk className="h-3 w-full" />
          </div>
        </div>
        {/* Prob bar */}
        <Sk className="h-2.5 w-full rounded-full" />
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-zinc-800/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Sk className="h-5 w-full" />
              <Sk className="h-2.5 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
        <Sk className="h-4 w-32" />
        <Sk className="h-40 w-full rounded-lg" />
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-36" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-zinc-800/40 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Sk className="h-7 w-7 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-3 w-full" />
                    <Sk className={`h-3 ${i % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
                  </div>
                  <Sk className="h-5 w-16 rounded shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Sk className="h-3 w-20" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
