"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
  emoji?: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  paramName?: string;
  accent?: "red" | "amber" | "blue" | "purple" | "teal" | "emerald" | "orange" | "cyan";
  /** Label shown on the "all" chip */
  allLabel?: string;
}

const accentCfg = {
  red:     "bg-red-500/15 border-red-500/35 text-red-400",
  amber:   "bg-amber-500/15 border-amber-500/35 text-amber-400",
  blue:    "bg-blue-500/15 border-blue-500/35 text-blue-400",
  purple:  "bg-purple-500/15 border-purple-500/35 text-purple-400",
  teal:    "bg-teal-500/15 border-teal-500/35 text-teal-400",
  emerald: "bg-emerald-500/15 border-emerald-500/35 text-emerald-400",
  orange:  "bg-orange-500/15 border-orange-500/35 text-orange-400",
  cyan:    "bg-cyan-500/15 border-cyan-500/35 text-cyan-400",
};

export function FilterChips({
  options,
  paramName = "filter",
  accent = "blue",
  allLabel = "All",
}: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get(paramName) || "";

  const setFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!key) {
      params.delete(paramName);
    } else {
      params.set(paramName, key);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const activeCls = accentCfg[accent];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* All chip */}
      <button
        onClick={() => setFilter("")}
        className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-wider transition-all duration-150 ${
          !current
            ? activeCls
            : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 hover:text-zinc-400"
        }`}
      >
        {allLabel.toUpperCase()}
      </button>

      {options.map(({ key, label, count, emoji }) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-wider transition-all duration-150 ${
              active
                ? activeCls
                : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 hover:text-zinc-400"
            }`}
          >
            {emoji && <span className="text-[11px]">{emoji}</span>}
            {label.toUpperCase()}
            {count !== undefined && (
              <span className={`ml-0.5 px-1 py-0.5 rounded text-[9px] font-mono ${active ? "bg-black/20" : "bg-zinc-800"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
