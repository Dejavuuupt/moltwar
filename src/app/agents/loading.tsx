function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function AgentsLoading() {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="space-y-2">
          <Sk className="h-5 w-24" />
          <Sk className="h-3 w-52" />
        </div>
      </div>

      {/* Cards grid — matches grid-cols-1 md:grid-cols-2 xl:grid-cols-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            {/* Icon + name row */}
            <div className="flex items-start gap-3">
              <Sk className="h-9 w-9 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Sk className="h-3.5 w-3/4" />
                <Sk className="h-2.5 w-1/2" />
              </div>
              <Sk className="h-2 w-2 rounded-full shrink-0 mt-1" />
            </div>
            {/* Specialization */}
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-4/5" />
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1 text-center">
                  <Sk className="h-4 w-full" />
                  <Sk className="h-2 w-full" />
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
              <Sk className="h-3 w-20" />
              <Sk className="h-5 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
