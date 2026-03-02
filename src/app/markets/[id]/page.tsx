import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ExternalLink, TrendingUp, TrendingDown,
  CheckCircle2, Clock, Flame, Droplets, Zap, Globe,
  BarChart3, Anchor, Vote, Cpu, DollarSign, Calendar,
} from "lucide-react";
import { loadData } from "@/lib/data";
import { Tag } from "@/components/ui/shared";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const markets = await loadData("markets");
  const market = markets.find((m: any) => m.id === id);
  if (!market) return { title: "Market Not Found" };
  return {
    title: market.title,
    description: market.description || `Prediction market: ${market.title}`,
    openGraph: { title: `${market.title} | MOLTWAR` },
  };
}

/* ─── Helpers ─── */
function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function pc(p: number) {
  if (p >= 0.70) return { t: "text-emerald-400", bar: "bg-emerald-500", hex: "#10b981", ring: "ring-emerald-500/15" };
  if (p >= 0.45) return { t: "text-amber-400", bar: "bg-amber-500", hex: "#f59e0b", ring: "ring-amber-500/15" };
  if (p >= 0.20) return { t: "text-orange-400", bar: "bg-orange-500", hex: "#f97316", ring: "ring-orange-500/10" };
  return { t: "text-zinc-400", bar: "bg-zinc-600", hex: "#71717a", ring: "ring-zinc-700/20" };
}

const CAT: Record<string, { icon: any; c: string; bg: string; border: string; label: string }> = {
  conflict:  { icon: Flame,     c: "text-red-400",     bg: "bg-red-500/8",     border: "border-red-500/25",     label: "CONFLICT" },
  energy:    { icon: Droplets,  c: "text-amber-400",   bg: "bg-amber-500/8",   border: "border-amber-500/25",   label: "ENERGY" },
  nuclear:   { icon: Zap,       c: "text-purple-400",  bg: "bg-purple-500/8",  border: "border-purple-500/25",  label: "NUCLEAR" },
  diplomacy: { icon: Globe,     c: "text-blue-400",    bg: "bg-blue-500/8",    border: "border-blue-500/25",    label: "DIPLOMACY" },
  markets:   { icon: BarChart3, c: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/25", label: "MARKETS" },
  maritime:  { icon: Anchor,    c: "text-cyan-400",    bg: "bg-cyan-500/8",    border: "border-cyan-500/25",    label: "MARITIME" },
  political: { icon: Vote,      c: "text-violet-400",  bg: "bg-violet-500/8",  border: "border-violet-500/25",  label: "POLITICAL" },
  cyber:     { icon: Cpu,       c: "text-sky-400",     bg: "bg-sky-500/8",     border: "border-sky-500/25",     label: "CYBER" },
};

/* ─── Full-width Catmull-Rom chart ─── */
function FullChart({ history }: { history: any[] }) {
  if (!history || history.length < 2) return null;
  const vals = history.map((h: any) => h.yes);
  const mx = Math.max(...vals, 0.1);
  const mn = Math.min(...vals, 0);
  const pad = (mx - mn) * 0.12 || 0.05;
  const yMin = Math.max(mn - pad, 0);
  const yMax = Math.min(mx + pad, 1.05);
  const rng = yMax - yMin || 0.1;

  const W = 600; const H = 180;
  const PX = 40; const PT = 12; const PB = 24; const PR = 16;
  const gw = W - PX - PR; const gh = H - PT - PB;
  const coords: [number, number][] = vals.map((v, i) => [
    PX + (i / (vals.length - 1)) * gw,
    PT + gh - ((v - yMin) / rng) * gh,
  ]);

  let d = `M${coords[0][0]},${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }

  const last = coords[coords.length - 1];
  const first = coords[0];
  const area = `${d} L${last[0]},${PT + gh} L${first[0]},${PT + gh} Z`;
  const lastVal = vals[vals.length - 1];
  const hex = lastVal >= 0.60 ? "#10b981" : lastVal >= 0.30 ? "#f59e0b" : "#ef4444";
  const uid = "full-chart";

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      <defs>
        <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hex} stopOpacity="0.25" />
          <stop offset="100%" stopColor={hex} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yTicks.map((tick) => {
        const y = PT + gh - ((tick - yMin) / rng) * gh;
        if (y < PT || y > PT + gh) return null;
        return (
          <g key={tick}>
            <line x1={PX} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <text x={PX - 4} y={y + 3.5} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
              {Math.round(tick * 100)}%
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={area} fill={`url(#area-${uid})`} />
      {/* Line */}
      <path d={d} fill="none" stroke={hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Endpoint dot */}
      <circle cx={last[0]} cy={last[1]} r="4" fill={hex} />
      <circle cx={last[0]} cy={last[1]} r="7" fill={hex} opacity="0.2" />
      {/* X axis dates */}
      <text x={PX} y={H - 4} textAnchor="start" fontSize="9" fill="rgba(255,255,255,0.3)">
        {history[0]?.date}
      </text>
      <text x={W - PR} y={H - 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
        {history[history.length - 1]?.date}
      </text>
    </svg>
  );
}

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const markets = await loadData("markets");
  const market = markets.find((m: any) => m.id === id);
  if (!market) notFound();

  const p = pc(market.yes_price);
  const cat = CAT[market.category] || CAT.conflict;
  const CatIcon = cat.icon;
  const isResolved = market.status?.startsWith("resolved");
  const yesWon = market.outcome === "YES";

  const related = markets
    .filter((m: any) => m.id !== market.id && m.category === market.category)
    .slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/markets" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Markets
      </Link>

      {/* Hero card */}
      <div className={`relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ring-1 ${p.ring}`}>
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${p.hex}60, transparent)` }} />

        <div className="p-6 space-y-4">
          {/* Category + status row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`${cat.bg} border ${cat.border} rounded px-2 py-0.5 flex items-center gap-1.5`}>
              <CatIcon className={`h-3 w-3 ${cat.c}`} />
              <span className={`text-[10px] font-bold ${cat.c} tracking-widest`}>{cat.label}</span>
            </div>
            {isResolved ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${yesWon ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                <CheckCircle2 className="h-3 w-3" />
                RESOLVED {market.outcome}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="h-3 w-3" /> ACTIVE
              </span>
            )}
            {market.tags?.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>

          {/* Title */}
          <div className="flex items-start gap-4">
            <h1 className="flex-1 text-xl font-bold text-zinc-100 leading-snug">{market.title}</h1>
            {/* Big probability */}
            <div className="flex flex-col items-center shrink-0">
              <span className={`text-4xl font-black tabular-nums leading-none ${p.t}`}>
                {Math.round(market.yes_price * 100)}<span className="text-xl">%</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono mt-1 tracking-wider">YES</span>
            </div>
          </div>

          {/* Probability bar */}
          <div>
            <div className="h-2 rounded-full overflow-hidden bg-zinc-800/80">
              <div className={`h-full rounded-full ${p.bar} transition-all`} style={{ width: `${market.yes_price * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-zinc-500 font-mono">NO {Math.round((1 - market.yes_price) * 100)}¢</span>
              <span className={`text-xs font-mono ${p.t}`}>YES {Math.round(market.yes_price * 100)}¢</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-300 leading-relaxed">{market.description}</p>
        </div>
      </div>

      {/* Chart + stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Chart */}
        <div className="md:col-span-2 rounded-xl border border-zinc-800/60 bg-[#111113] p-4">
          <div className="flex items-center gap-2 mb-3">
            {market.yes_price >= 0.5 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Price History</span>
          </div>
          <FullChart history={market.price_history} />
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 space-y-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Market Stats</span>
            </div>
            {[
              { label: "Volume", value: fmt(market.volume_usd), color: "text-emerald-400" },
              { label: "Liquidity", value: fmt(market.liquidity_usd || 0), color: "text-blue-400" },
              { label: "Created", value: market.created_date || "—", color: "text-zinc-300" },
              { label: "Resolution", value: market.resolution_date || "TBD", color: "text-zinc-300" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">{s.label}</span>
                <span className={`text-xs font-semibold font-mono ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {isResolved && market.resolution_source && (
            <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className={`h-3.5 w-3.5 ${yesWon ? "text-emerald-400" : "text-red-400"}`} />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Resolution</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">{market.resolution_source}</p>
            </div>
          )}
        </div>
      </div>

      {/* Price history table */}
      {market.price_history && market.price_history.length > 0 && (
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Price History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pb-2">Date</th>
                  <th className="text-right text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pb-2">YES Price</th>
                  <th className="text-right text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pb-2">Change</th>
                </tr>
              </thead>
              <tbody>
                {[...market.price_history].reverse().map((h: any, i: number, arr: any[]) => {
                  const prev = arr[i + 1];
                  const change = prev ? Math.round((h.yes - prev.yes) * 100) : null;
                  const p2 = pc(h.yes);
                  return (
                    <tr key={h.date} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-2 text-zinc-400 font-mono">{h.date}</td>
                      <td className={`py-2 text-right font-bold font-mono ${p2.t}`}>
                        {Math.round(h.yes * 100)}¢
                      </td>
                      <td className="py-2 text-right font-mono">
                        {change !== null ? (
                          <span className={`text-[10px] font-bold ${change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-zinc-500"}`}>
                            {change > 0 ? "+" : ""}{change}¢
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Polymarket link */}
      {market.slug && (
        <a
          href={`https://polymarket.com/event/${market.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-zinc-800/60 bg-[#111113] text-xs text-zinc-400 hover:text-emerald-400 hover:border-zinc-700 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View on Polymarket
        </a>
      )}

      {/* Related markets */}
      {related.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-zinc-600" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">RELATED MARKETS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {related.map((m: any) => {
              const rp = pc(m.yes_price);
              return (
                <Link
                  key={m.id}
                  href={`/markets/${m.id}`}
                  className={`block rounded-xl border border-zinc-800/60 bg-[#111113] p-4 hover:border-zinc-700 transition-colors ring-1 ${rp.ring}`}
                >
                  <p className="text-xs font-semibold text-zinc-200 leading-snug line-clamp-2 mb-2">{m.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-black font-mono ${rp.t}`}>{Math.round(m.yes_price * 100)}%</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{fmt(m.volume_usd)} vol</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
