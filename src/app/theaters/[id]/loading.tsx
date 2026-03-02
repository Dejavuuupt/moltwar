function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function TheaterDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-28" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-5 w-20 rounded-full" />
              <Sk className="h-5 w-24 rounded-full" />
            </div>
            <Sk className="h-7 w-3/4" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-4/5" />
          </div>
          <Sk className="h-16 w-16 rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-zinc-800/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Sk className="h-5 w-full" />
              <Sk className="h-2.5 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Analysis */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-36" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Sk key={i} className={`h-3 ${[2, 4].includes(i) ? "w-3/5" : "w-full"}`} />
            ))}
          </div>
          {/* Active factions */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800/40 p-2.5">
                  <Sk className="h-7 w-7 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1 min-w-0">
                    <Sk className="h-3 w-3/4" />
                    <Sk className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recent events */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Sk className="h-2 w-2 rounded-full shrink-0 mt-1.5" />
                <div className="flex-1 space-y-1">
                  <Sk className={`h-3 ${i % 3 === 1 ? "w-4/5" : "w-full"}`} />
                  <Sk className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-20" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <Sk className="h-4 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
