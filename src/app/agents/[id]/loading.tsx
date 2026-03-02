function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function AgentDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-24" />

      {/* Profile card */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start gap-4">
          <Sk className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-20 rounded-full" />
              <Sk className="h-5 w-24 rounded-full" />
            </div>
            <Sk className="h-6 w-1/2" />
            <Sk className="h-3 w-3/4" />
            <Sk className="h-3 w-2/3" />
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Sk className="h-5 w-full" />
              <Sk className="h-2.5 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {/* Recent activity */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-32" />
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Sk className="h-2 w-2 rounded-full shrink-0 mt-1.5" />
                  <div className="flex-1 space-y-1">
                    <Sk className={`h-3 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
                    <Sk className="h-2.5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Missions */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-zinc-800/40 p-3 space-y-1.5">
                <Sk className="h-3.5 w-2/3" />
                <Sk className="h-3 w-full" />
                <Sk className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-20" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Sk className="h-2.5 w-24" />
                  <Sk className="h-2.5 w-8" />
                </div>
                <Sk className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
