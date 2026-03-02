import Link from "next/link";
import { ArrowLeft, Radio, ShieldOff } from "lucide-react";

const LOG_LINES = [
  { label: "QUERY",    value: "ASSET LOOKUP INITIATED",         ok: true  },
  { label: "ROUTE",    value: "RESOLVING TARGET COORDINATES",   ok: true  },
  { label: "INDEX",    value: "NO MATCH IN INTELLIGENCE DB",    ok: false },
  { label: "ARCHIVE",  value: "DECLASSIFIED RECORDS CHECKED",   ok: false },
  { label: "STATUS",   value: "ASSET NOT FOUND · ERR 404",      ok: false },
];

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-8">
      <div className="w-full max-w-md space-y-5">

        {/* ── Big 404 hero ── */}
        <div className="relative select-none text-center">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-24 rounded-full bg-red-500/8 blur-3xl" />
          </div>
          <p
            className="relative font-black font-mono leading-none tracking-tighter"
            style={{
              fontSize: "clamp(5rem,20vw,9rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(239,68,68,0.25)",
              textShadow: "0 0 60px rgba(239,68,68,0.12)",
            }}
          >
            404
          </p>
          {/* Overlaid REDACTED bar */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
            <span className="bg-red-500/90 text-white text-[10px] font-black font-mono tracking-[0.35em] px-4 py-1 rounded-sm uppercase shadow-lg shadow-red-500/20">
              SIGNAL&nbsp;LOST
            </span>
          </div>
        </div>

        {/* ── Terminal log ── */}
        <div className="rounded-xl border border-zinc-800/70 bg-[#0d0d0f] overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/60 bg-zinc-900/40">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/30" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest flex-1 text-center pr-6">
              MOLTWAR — ASSET RESOLVER v2.6
            </span>
          </div>

          {/* Log lines */}
          <div className="px-4 py-3 space-y-1.5">
            {LOG_LINES.map((line, i) => (
              <div key={i} className="flex items-center gap-3 font-mono text-xs">
                <span className="text-zinc-700 w-14 shrink-0 text-right">{line.label}</span>
                <span className="text-zinc-700">›</span>
                <span className={line.ok ? "text-zinc-400" : "text-red-400/80"}>
                  {line.value}
                </span>
                {!line.ok && (
                  <span className="ml-auto text-red-500/60 text-[10px] tracking-wider">FAIL</span>
                )}
              </div>
            ))}

            {/* Blinking cursor line */}
            <div className="flex items-center gap-3 font-mono text-xs pt-1">
              <span className="text-zinc-700 w-14 shrink-0 text-right">SYS</span>
              <span className="text-zinc-700">›</span>
              <span className="text-emerald-500/60">awaiting operator input</span>
              <span className="ml-1 inline-block h-3 w-1.5 bg-emerald-500/60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── Message + actions ── */}
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 shrink-0 mt-0.5">
                <ShieldOff className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-200">Asset Not Found</h2>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  The requested intelligence resource does not exist in this theater or has been removed from active records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
              >
                <ArrowLeft className="h-3 w-3" />
                Dashboard
              </Link>
              <Link
                href="/pulse"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 rounded-lg hover:bg-zinc-700/60 hover:text-zinc-300 transition-all"
              >
                <Radio className="h-3 w-3" />
                Live Pulse
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-zinc-800 tracking-widest">
          MOLTWAR · CONFLICT INTELLIGENCE · CLEARANCE REQUIRED
        </p>
      </div>
    </div>
  );
}
