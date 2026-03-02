"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Clock, ThumbsUp } from "lucide-react";

interface SortFilterProps {
  /** Accent color for active state */
  accent?: "emerald" | "red" | "amber";
  /** Which sort is the default when no query param is set */
  defaultSort?: "recent" | "voted";
  /** Query param name (allows multiple filters on different sections) */
  paramName?: string;
}

const accentCfg = {
  emerald: { active: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400", dot: "bg-emerald-500" },
  red:     { active: "bg-red-500/15 border-red-500/30 text-red-400",       dot: "bg-red-500" },
  amber:   { active: "bg-amber-500/15 border-amber-500/30 text-amber-400", dot: "bg-amber-500" },
};

export function SortFilter({ accent = "emerald", defaultSort = "recent", paramName = "sort" }: SortFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = searchParams.get(paramName) || defaultSort;
  const cfg = accentCfg[accent];

  const setSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === defaultSort) {
      params.delete(paramName);
    } else {
      params.set(paramName, sort);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const options = [
    { key: "recent", label: "Most Recent", icon: Clock },
    { key: "voted", label: "Most Voted", icon: ThumbsUp },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {options.map(({ key, label, icon: Icon }) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider transition-all duration-150 ${
              active
                ? cfg.active
                : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:border-zinc-700/60 hover:text-zinc-400"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
