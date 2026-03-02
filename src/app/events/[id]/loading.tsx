function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function EventDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-28" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start gap-4">
          <Sk className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-20 rounded-full" />
              <Sk className="h-5 w-16 rounded-full" />
            </div>
            <Sk className="h-6 w-3/4" />
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-4/5" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/40">
          <Sk className="h-7 w-28 rounded-lg" />
          <Sk className="h-7 w-28 rounded-lg" />
          <div className="ml-auto">
            <Sk className="h-3 w-32" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Body */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Sk key={i} className={`h-3 ${[1, 4].includes(i) ? "w-4/5" : "w-full"}`} />
            ))}
          </div>
          {/* Actors */}
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-20" />
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
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <Sk className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
