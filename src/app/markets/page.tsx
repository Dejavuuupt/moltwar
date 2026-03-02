import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Flame, Zap, Globe, BarChart3, Activity, Target,
  ArrowUpRight, ArrowDownRight, Anchor,
  Cpu, Vote, Droplets, ExternalLink, DollarSign, Shield
} from "lucide-react";
import { SectionHeader, StatCard } from "@/components/ui/shared";
import { FilterChips } from "@/components/ui/FilterChips";
import { loadData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Markets",
  description: "War-linked prediction markets from Polymarket. Probabilities, volume, and liquidity on conflict outcomes — tracked and analyzed.",
  openGraph: { title: "Markets | MOLTWAR", description: "War-linked prediction markets — probabilities and volume on conflict outcomes." },
};

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function delta(h: any[]) {
  if (!h || h.length < 2) return 0;
  return Math.round((h[h.length - 1].yes - h[h.length - 2].yes) * 100);
}

/* price → color palette */
function pc(p: number) {
  if (p >= 0.70) return { t: "text-emerald-400", bar: "bg-emerald-500", hex: "#10b981", glow: "", grad: "from-emerald-500/6 via-transparent to-transparent", ring: "ring-emerald-500/15", barTrail: "bg-emerald-500/15" };
  if (p >= 0.45) return { t: "text-amber-400",   bar: "bg-amber-500",   hex: "#f59e0b", glow: "", grad: "from-amber-500/6 via-transparent to-transparent",   ring: "ring-amber-500/15",   barTrail: "bg-amber-500/15" };
  if (p >= 0.20) return { t: "text-orange-400",  bar: "bg-orange-500",  hex: "#f97316", glow: "", grad: "from-orange-500/4 to-transparent",                   ring: "ring-orange-500/10",  barTrail: "bg-orange-500/10" };
  return                { t: "text-zinc-400",    bar: "bg-zinc-600",    hex: "#71717a", glow: "", grad: "",                                                   ring: "ring-zinc-700/20",    barTrail: "bg-zinc-700/30" };
}

const CAT: Record<string, { icon: any; c: string; bg: string; border: string; label: string }> = {
  conflict:  { icon: Flame,     c: "text-red-400",     bg: "bg-red-500/8",      border: "border-red-500/25",     label: "CONFLICT" },
  energy:    { icon: Droplets,  c: "text-amber-400",   bg: "bg-amber-500/8",    border: "border-amber-500/25",   label: "ENERGY" },
  nuclear:   { icon: Zap,       c: "text-purple-400",  bg: "bg-purple-500/8",   border: "border-purple-500/25",  label: "NUCLEAR" },
  diplomacy: { icon: Globe,     c: "text-blue-400",    bg: "bg-blue-500/8",     border: "border-blue-500/25",    label: "DIPLOMACY" },
  markets:   { icon: BarChart3, c: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/25", label: "MARKETS" },
  maritime:  { icon: Anchor,    c: "text-cyan-400",    bg: "bg-cyan-500/8",     border: "border-cyan-500/25",    label: "MARITIME" },
  political: { icon: Vote,      c: "text-violet-400",  bg: "bg-violet-500/8",   border: "border-violet-500/25",  label: "POLITICAL" },
  cyber:     { icon: Cpu,       c: "text-sky-400",     bg: "bg-sky-500/8",      border: "border-sky-500/25",     label: "CYBER" },
};

/* ── Catmull-Rom → Cubic Bezier SVG path (smooth curve) ─── */

function catmullRom(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;

  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/* ── Chart Component ─────────────────────────────────────── */

function Chart({ history, uid, large = false }: { history: any[]; uid: string; large?: boolean }) {
  if (!history || history.length < 2) return null;

  const W = large ? 380 : 280;
  const H = large ? 120 : 80;
  const PX = 36;  // left padding for y-axis
  const PT = 8;   // top
  const PB = 18;  // bottom for x-axis
  const PR = 12;  // right

  const vals = history.map((h: any) => h.yes);
  const mx = Math.max(...vals, 0.1);
  const mn = Math.min(...vals, 0);
  const pad = (mx - mn) * 0.12 || 0.05;
  const yMin = Math.max(mn - pad, 0);
  const yMax = Math.min(mx + pad, 1.05);
  const rng = yMax - yMin || 0.1;

  const gw = W - PX - PR;
  const gh = H - PT - PB;

  const coords: [number, number][] = vals.map((v, i) => [
    PX + (i / (vals.length - 1)) * gw,
    PT + gh - ((v - yMin) / rng) * gh,
  ]);

  const line = catmullRom(coords);
  const last = coords[coords.length - 1];
  const first = coords[0];
  const area = `${line} L${last[0]},${PT + gh} L${first[0]},${PT + gh} Z`;

  const lastVal = vals[vals.length - 1];
  const hex = lastVal >= 0.60 ? "#10b981" : lastVal >= 0.30 ? "#f59e0b" : "#ef4444";

  // Y-axis ticks (4 lines)
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const frac = i / 3;
    const val = yMin + frac * rng;
    const y = PT + gh - frac * gh;
    return { val, y };
  });

  // X-axis labels (first and last date)
  const firstDate = history[0].date;
  const lastDate = history[history.length - 1].date;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      style={{ overflow: "hidden" }}
    >
      <defs>
        <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hex} stopOpacity={0.15} />
          <stop offset="50%" stopColor={hex} stopOpacity={0.05} />
          <stop offset="100%" stopColor={hex} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(({ val, y }, i) => (
        <g key={i}>
          <line x1={PX} y1={y} x2={W - PR} y2={y} stroke="#27272a" strokeWidth={0.5} strokeDasharray={i === 0 ? "0" : "2,3"} />
          <text x={PX - 5} y={y + 3} textAnchor="end" fill="#52525b" fontSize={8} fontFamily="monospace">
            {Math.round(val * 100)}¢
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={area} fill={`url(#cg-${uid})`} />

      {/* Main line */}
      <path d={line} fill="none" stroke={hex} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 3 : 1.2} fill={i === coords.length - 1 ? hex : "transparent"} stroke={hex} strokeWidth={i === coords.length - 1 ? 0 : 0.6} opacity={i === coords.length - 1 ? 1 : 0.4} />
      ))}

      {/* X-axis labels */}
      <text x={PX} y={H - 2} fill="#52525b" fontSize={7.5} fontFamily="monospace">{firstDate}</text>
      <text x={W - PR} y={H - 2} textAnchor="end" fill="#52525b" fontSize={7.5} fontFamily="monospace">{lastDate}</text>
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default async function MarketsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filterCat = searchParams.filter || "";
  const all = await loadData("markets");
  const active = all
    .filter((m: any) => m.status === "active")
    .sort((a: any, b: any) => (b.volume_usd || 0) - (a.volume_usd || 0));

  // Category counts across all active markets
  const catCounts = active.reduce((acc: Record<string, number>, m: any) => {
    const cat = (m.category || "conflict").toLowerCase();
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const catOptions = Object.keys(CAT)
    .filter((k) => catCounts[k] > 0)
    .map((k) => ({ key: k, label: CAT[k].label, count: catCounts[k] }));

  const markets = filterCat
    ? active.filter((m: any) => (m.category || "").toLowerCase() === filterCat)
    : active;

  const totalVol = markets.reduce((s: number, m: any) => s + (m.volume_usd || 0), 0);
  const totalLiq = markets.reduce((s: number, m: any) => s + (m.liquidity_usd || 0), 0);
  const avgProb = markets.length ? markets.reduce((s: number, m: any) => s + (m.yes_price || 0), 0) / markets.length : 0;
  const highProb = markets.filter((m: any) => m.yes_price >= 0.6).length;

  // top 6 for hero row
  const hero = markets.slice(0, 6);
  const rest = markets.slice(6);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Prediction Markets"
        subtitle={`${markets.length} active war-linked prediction markets via Polymarket`}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <StatCard label="Active Markets" value={markets.length} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="High Probability" value={highProb} icon={<Target className="h-4 w-4" />} variant="danger" />
        <StatCard label="Avg. Probability" value={`${Math.round(avgProb * 100)}¢`} icon={<BarChart3 className="h-4 w-4" />} variant="amber" />
        <StatCard label="Total Volume" value={fmt(totalVol)} icon={<DollarSign className="h-4 w-4" />} variant="green" />
        <StatCard label="Total Liquidity" value={fmt(totalLiq)} icon={<Shield className="h-4 w-4" />} />
      </div>

      {/* ── Category Filter ── */}
      {catOptions.length > 0 && (
        <Suspense>
          <FilterChips options={catOptions} paramName="filter" accent="emerald" allLabel="All Categories" />
        </Suspense>
      )}

      {/* ── Hero Markets (top 6 by volume) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">TOP MARKETS BY VOLUME</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-auto">{hero.length} OF {markets.length}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hero.map((m: any) => {
            const p = pc(m.yes_price);
            const d = delta(m.price_history);
            const cat = CAT[m.category] || CAT.conflict;
            const CatIcon = cat.icon;

            return (
              <div
                key={m.id}
                className={`relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ring-1 ${p.ring} ${p.glow} transition-all duration-200 hover:border-zinc-700 hover:translate-y-[-1px] group`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.grad} pointer-events-none`} />
                {/* Top edge accent */}
                <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${p.hex}30, transparent)` }} />

                <div className="relative p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-zinc-100 leading-snug pr-2">{m.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`${cat.bg} border ${cat.border} rounded px-1.5 py-[2px] flex items-center gap-1`}>
                          <CatIcon className={`h-2.5 w-2.5 ${cat.c}`} />
                          <span className={`text-[10px] font-bold ${cat.c} tracking-widest`}>{cat.label}</span>
                        </div>
                        {d !== 0 && (
                          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${d > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {d > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {d > 0 ? "+" : ""}{d}¢
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Big probability */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className={`text-3xl font-black tabular-nums leading-none ${p.t}`}>
                        {Math.round(m.yes_price * 100)}<span className="text-lg">%</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 tracking-wider">YES</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{m.description}</p>

                  {/* Probability bar */}
                  <div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800/80">
                      <div
                        className={`h-full rounded-full ${p.bar} transition-all`}
                        style={{ width: `${m.yes_price * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-zinc-500 font-mono">NO {Math.round((1 - m.yes_price) * 100)}¢</span>
                      <span className={`text-[10px] font-mono ${p.t}`}>YES {Math.round(m.yes_price * 100)}¢</span>
                    </div>
                  </div>

                  {/* Chart */}
                  {m.price_history?.length > 1 && (
                    <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/30 px-1 pt-1 pb-0 overflow-hidden">
                      <Chart history={m.price_history} uid={m.id} large />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-zinc-500">
                        <span className="text-emerald-400 font-semibold">{fmt(m.volume_usd)}</span> vol
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        <span className="text-blue-400 font-semibold">{fmt(m.liquidity_usd || 0)}</span> liq
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/markets/${m.id}`}
                        className="text-[10px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors opacity-60 group-hover:opacity-100 font-medium"
                      >
                        View Analysis
                      </Link>
                      <a
                        href={`https://polymarket.com/event/${m.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors opacity-60 group-hover:opacity-100"
                      >
                        <ExternalLink className="h-3 w-3" /> polymarket
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Remaining Markets ── */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-zinc-600" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">ALL MARKETS</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">{rest.length} REMAINING</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {rest.map((m: any) => {
              const p = pc(m.yes_price);
              const d = delta(m.price_history);
              const cat = CAT[m.category] || CAT.conflict;
              const CatIcon = cat.icon;

              return (
                <div
                  key={m.id}
                  className={`relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ring-1 ${p.ring} transition-all duration-200 hover:border-zinc-700 hover:translate-y-[-1px] group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.grad} pointer-events-none`} />
                  <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${p.hex}20, transparent)` }} />

                  <div className="relative flex flex-col sm:flex-row gap-3 p-4">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Head */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-bold text-zinc-100 leading-snug">{m.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`${cat.bg} border ${cat.border} rounded px-1.5 py-[2px] flex items-center gap-1`}>
                              <CatIcon className={`h-2.5 w-2.5 ${cat.c}`} />
                              <span className={`text-[10px] font-bold ${cat.c} tracking-widest`}>{cat.label}</span>
                            </div>
                            {d !== 0 && (
                              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${d > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {d > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                                {d > 0 ? "+" : ""}{d}¢
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Probability */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <span className={`text-2xl font-black tabular-nums leading-none ${p.t}`}>
                            {Math.round(m.yes_price * 100)}<span className="text-sm">%</span>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 tracking-wider">YES</span>
                        </div>
                      </div>

                      {/* Prob bar */}
                      <div>
                        <div className="h-1 rounded-full overflow-hidden bg-zinc-800/80">
                          <div
                            className={`h-full rounded-full ${p.bar}`}
                            style={{ width: `${m.yes_price * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[10px] text-zinc-500 font-mono">NO {Math.round((1 - m.yes_price) * 100)}¢</span>
                          <span className={`text-[10px] font-mono ${p.t}`}>YES {Math.round(m.yes_price * 100)}¢</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{m.description}</p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-500"><span className="text-emerald-400 font-semibold">{fmt(m.volume_usd)}</span> vol</span>
                          <span className="text-[10px] text-zinc-500"><span className="text-blue-400 font-semibold">{fmt(m.liquidity_usd || 0)}</span> liq</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/markets/${m.id}`}
                            className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors opacity-60 group-hover:opacity-100 font-medium"
                          >
                            Analysis
                          </Link>
                          <a
                            href={`https://polymarket.com/event/${m.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors opacity-60 group-hover:opacity-100"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right: chart */}
                    {m.price_history?.length > 1 && (
                      <div className="flex-shrink-0 w-full sm:w-[260px] rounded-lg bg-zinc-950/60 border border-zinc-800/30 px-1 pt-1 pb-0 self-center overflow-hidden">
                        <Chart history={m.price_history} uid={m.id} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
