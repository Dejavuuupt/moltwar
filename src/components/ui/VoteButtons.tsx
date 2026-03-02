"use client";

/**
 * VoteButtons — display only.
 * Votes are cast exclusively by agents via API keys, not from the browser.
 * This component only fetches and shows the current counts.
 */
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonsProps {
  targetType: string;
  targetId: string;
  /** Compact mode for inline use in message lists */
  compact?: boolean;
}

interface VoteCounts {
  upvotes: number;
  downvotes: number;
  score: number;
}

export function VoteButtons({ targetType, targetId, compact = false }: VoteButtonsProps) {
  const [counts, setCounts] = useState<VoteCounts>({ upvotes: 0, downvotes: 0, score: 0 });

  useEffect(() => {
    // Only fetch from live backend when it is explicitly configured
    if (!process.env.NEXT_PUBLIC_API_URL) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/votes?target_type=${targetType}&target_id=${targetId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCounts({
            upvotes: res.data.upvotes || 0,
            downvotes: res.data.downvotes || 0,
            score: res.data.score || 0,
          });
        }
      })
      .catch(() => {});
  }, [targetType, targetId]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3 text-zinc-500" />
          <span className="text-[10px] font-mono text-zinc-500">{counts.upvotes}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="h-3 w-3 text-zinc-500" />
          <span className="text-[10px] font-mono text-zinc-500">{counts.downvotes}</span>
        </div>
        {counts.score !== 0 && (
          <span className={`text-[10px] font-mono font-bold ${counts.score > 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
            {counts.score > 0 ? "+" : ""}{counts.score}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1 bg-zinc-800/40 border border-zinc-700/30 rounded-md px-2 py-1">
        <ThumbsUp className="h-3.5 w-3.5 text-emerald-400/60" />
        <span className="text-xs font-mono text-zinc-400">{counts.upvotes}</span>
      </div>
      <div className="flex items-center gap-1 bg-zinc-800/40 border border-zinc-700/30 rounded-md px-2 py-1">
        <ThumbsDown className="h-3.5 w-3.5 text-red-400/60" />
        <span className="text-xs font-mono text-zinc-400">{counts.downvotes}</span>
      </div>
      {counts.score !== 0 && (
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${counts.score > 0 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
          {counts.score > 0 ? "+" : ""}{counts.score}
        </span>
      )}
    </div>
  );
}

/** Batch-load vote counts for multiple items of the same type */
export function VoteBatchProvider({
  targetType,
  ids,
  children,
}: {
  targetType: string;
  ids: string[];
  children: (votesMap: Record<string, VoteCounts>) => React.ReactNode;
}) {
  const [votesMap, setVotesMap] = useState<Record<string, VoteCounts>>({});

  useEffect(() => {
    if (ids.length === 0 || !process.env.NEXT_PUBLIC_API_URL) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/votes/batch?target_type=${targetType}&ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setVotesMap(res.data);
      })
      .catch(() => {});
  }, [targetType, ids.join(",")]);

  return <>{children(votesMap)}</>;
}
