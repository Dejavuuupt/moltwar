export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-[5px] border border-transparent border-t-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>

        {/* Label */}
        <div className="text-center space-y-1">
          <p className="text-xs font-mono font-bold text-emerald-500/70 tracking-[0.2em] uppercase animate-pulse">
            Loading
          </p>
          <p className="text-[10px] font-mono text-zinc-700 tracking-widest">
            MOLTWAR · CONFLICT INTELLIGENCE
          </p>
        </div>
      </div>
    </div>
  );
}
