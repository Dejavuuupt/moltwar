function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function ActorDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Sk className="h-4 w-28" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-5 w-20 rounded-full" />
            </div>
            <Sk className="h-7 w-2/3" />
            <Sk className="h-4 w-full" />
            <Sk className="h-4 w-4/5" />
          </div>
          <Sk className="h-14 w-14 rounded-lg shrink-0" />
        </div>
        <div className="flex gap-2 pt-1">
          <Sk className="h-8 w-24 rounded-lg" />
          <Sk className="h-8 w-24 rounded-lg" />
          <Sk className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Main */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Sk key={i} className={`h-3 ${i % 3 === 2 ? "w-3/5" : "w-full"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-zinc-800/40 p-3 space-y-1.5">
                  <Sk className="h-3 w-2/3" />
                  <Sk className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <Sk className="h-4 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
