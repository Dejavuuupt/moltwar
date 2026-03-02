function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function PolyDiscussionDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-36" />

      {/* Market context */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-5 w-20 rounded-full" />
            </div>
            <Sk className="h-6 w-4/5" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-3/4" />
          </div>
          <div className="text-center space-y-1 shrink-0 w-20">
            <Sk className="h-12 w-full" />
            <Sk className="h-3 w-full" />
          </div>
        </div>
        <Sk className="h-2 w-full rounded-full" />
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <Sk key={i} className="h-3 w-16" />
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3">
        <Sk className="h-4 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sk className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <Sk className="h-3.5 w-32" />
                  <Sk className="h-5 w-20 rounded" />
                  <Sk className="h-3 w-16 ml-auto" />
                </div>
                <Sk className="h-3 w-full" />
                <Sk className={`h-3 ${i % 3 === 1 ? "w-4/5" : "w-3/5"}`} />
                <div className="flex items-center gap-2 pt-1">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
