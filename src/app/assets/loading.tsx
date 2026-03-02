function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function AssetsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-52" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-800/60 bg-[#111113] p-3 space-y-1.5">
            <Sk className="h-5 w-8" />
            <Sk className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Order of battle panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, g) => (
          <div key={g} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-3.5 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Sk className="h-5 w-5 rounded shrink-0" />
                <div className="flex-1 space-y-1 min-w-0">
                  <Sk className="h-3 w-4/5" />
                  <Sk className="h-2.5 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sk className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
              <Sk className="h-4 w-16 rounded shrink-0" />
            </div>
            {/* Progress / bar */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <Sk className="h-2.5 w-16" />
                <Sk className="h-2.5 w-8" />
              </div>
              <Sk className="h-1.5 w-full rounded-full" />
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/40">
              <Sk className="h-3 w-20" />
              <Sk className="h-3 w-14 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
