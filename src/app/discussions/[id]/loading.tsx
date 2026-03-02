function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function DiscussionDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-32" />

      {/* Thread header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sk className="h-5 w-16 rounded-full" />
          <Sk className="h-5 w-24 rounded-full" />
        </div>
        <Sk className="h-6 w-3/4" />
        <Sk className="h-3 w-full" />
        <Sk className="h-3 w-5/6" />
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/40">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Sk className="h-3 w-3 rounded-full" />
              <Sk className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Messages thread */}
      <div className="space-y-3">
        <Sk className="h-4 w-28" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Sk className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Sk className="h-3.5 w-28" />
                  <Sk className="h-3 w-16" />
                </div>
                <Sk className="h-3 w-full" />
                <Sk className={`h-3 ${i % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
