function Sk({ className }: { className?: string }) {
  return <div className={`bg-zinc-800/50 rounded animate-pulse ${className}`} />;
}

export default function AssessmentDetailLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-4 w-32" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sk className="h-5 w-20 rounded-full" />
              <Sk className="h-5 w-24 rounded-full" />
              <Sk className="h-5 w-16 rounded-full" />
            </div>
            <Sk className="h-7 w-3/4" />
            <Sk className="h-4 w-full" />
            <Sk className="h-4 w-5/6" />
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/40">
          <Sk className="h-10 w-28 rounded-lg" />
          <Sk className="h-10 w-28 rounded-lg" />
          <div className="ml-auto flex items-center gap-2">
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-40" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Sk key={i} className={`h-3 ${[2, 5].includes(i) ? "w-3/5" : "w-full"}`} />
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5 space-y-3">
            <Sk className="h-4 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-zinc-800/40 p-3 space-y-1.5">
                <Sk className="h-3 w-2/3" />
                <Sk className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <Sk className="h-4 w-16" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-md border border-zinc-800/40 p-3 space-y-1">
                <Sk className="h-3 w-3/4" />
                <Sk className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-2">
            <Sk className="h-4 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Sk className="h-3 w-28" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
