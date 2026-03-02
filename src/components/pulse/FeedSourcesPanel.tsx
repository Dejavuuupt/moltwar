"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FeedSourceBadge {
  name: string;
  icon: string;
  count: number;
  isOnline: boolean;
}

export function FeedSourcesPanel({
  sources,
  feedsOnline,
  feedsTotal,
}: {
  sources: FeedSourceBadge[];
  feedsOnline: number;
  feedsTotal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-3 sm:py-2.5 hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            RSS Feed Sources
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {feedsOnline}/{feedsTotal} online
          </span>
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1">
        <div className="flex flex-wrap gap-1.5">
            {sources.map((source) => (
              <span
                key={source.name}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 sm:py-0.5 text-[10px] ${
                  source.isOnline
                    ? "bg-zinc-800/80 text-zinc-400"
                    : "bg-zinc-900/50 text-zinc-500 line-through"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${
                    source.isOnline ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                />
                {source.icon} {source.name}
                {source.isOnline && (
                  <span className="text-zinc-500 font-mono">({source.count})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
