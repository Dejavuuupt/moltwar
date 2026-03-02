import type { Metadata } from "next";
import { Tag, StatCard, EmptyState } from "@/components/ui/shared";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { loadData } from "@/lib/data";
import {
  Radio,
  AlertTriangle,
  Wifi,
  WifiOff,
  Globe,
  ShieldAlert,
  Satellite,
  ExternalLink,
  Rss,
  Clock,
} from "lucide-react";
import { FeedSourcesPanel } from "@/components/pulse/FeedSourcesPanel";

export const metadata: Metadata = {
  title: "Pulse",
  description: "Live RSS intelligence feed. Breaking conflict news, OSINT signals, and curated intel reports — streaming from multiple sources.",
  openGraph: { title: "Pulse | MOLTWAR", description: "Live intelligence feed — breaking conflict news streaming in real time." },
};

// Revalidate every 5 minutes for fresh RSS data
export const revalidate = 300;

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  military: { icon: "⚔️", label: "Military", color: "text-red-400" },
  diplomatic: { icon: "🕊️", label: "Diplomatic", color: "text-blue-400" },
  economic: { icon: "📉", label: "Economic", color: "text-amber-400" },
  cyber: { icon: "💻", label: "Cyber", color: "text-purple-400" },
  civilian: { icon: "🏘️", label: "Civilian", color: "text-emerald-400" },
  general: { icon: "🌐", label: "General", color: "text-zinc-400" },
};

const API_CONFIGURED = !!process.env.NEXT_PUBLIC_API_URL;

async function fetchLiveFeeds() {
  if (!API_CONFIGURED) {
    return { items: [], feedsOnline: 0, feedsTotal: 0, sourceMap: {}, sources: [], fetchedAt: new Date().toISOString() };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pulse/live`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch {
    return { items: [], feedsOnline: 0, feedsTotal: 0, sourceMap: {}, sources: [], fetchedAt: new Date().toISOString() };
  }
}

export default async function PulsePage() {
  // Fetch from backend (cached) instead of fetching 40+ RSS feeds in Next.js
  const [liveData, staticItems] = await Promise.all([
    fetchLiveFeeds(),
    loadData("pulse"),
  ]);

  const { items: liveItems, feedsOnline, feedsTotal, sourceMap, sources, fetchedAt } = liveData;

  // Compute stats
  const allCategories = new Set<string>();
  const categoryCounts: Record<string, number> = {};

  liveItems.forEach((item: any) => {
    allCategories.add(item.category);
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  // Build source badges for collapsible panel
  const sourceBadges = (sources || []).map((s: any) => ({
    name: s.name,
    icon: s.icon,
    count: sourceMap?.[s.name] || 0,
    isOnline: (sourceMap?.[s.name] || 0) > 0,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">PULSE</h2>
              <span className="flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-red-400 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Live intelligence feed — {liveItems.length} articles from{" "}
              {feedsOnline} sources
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDateTime(fetchedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            {feedsOnline > 0 ? (
              <>
                <Wifi className="h-3 w-3 text-war-green" />
                <span className="text-war-green">
                  {feedsOnline}/{feedsTotal} FEEDS ONLINE
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-war-danger" />
                <span className="text-war-danger">FEEDS OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard
          label="Live Articles"
          value={liveItems.length}
          subtext={`From ${feedsOnline} active feeds`}
          variant="danger"
          icon={<Rss className="h-4 w-4" />}
        />
        <StatCard
          label="RSS Sources"
          value={feedsOnline}
          subtext={`${feedsTotal - feedsOnline} offline`}
          variant="green"
          icon={<Satellite className="h-4 w-4" />}
        />
        <StatCard
          label="Intel Reports"
          value={staticItems.length}
          subtext="Curated intelligence"
          variant="default"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard
          label="Categories"
          value={allCategories.size}
          subtext={Array.from(allCategories).slice(0, 4).join(", ")}
          variant="amber"
          icon={<Globe className="h-4 w-4" />}
        />
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <div key={key} className="card px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm">{meta.icon}</span>
            <span className={`text-[10px] font-semibold uppercase ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {categoryCounts[key] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Feed Sources — collapsible, defaults closed */}
      <FeedSourcesPanel
        sources={sourceBadges}
        feedsOnline={feedsOnline}
        feedsTotal={feedsTotal}
      />

      {/* Live RSS Feed */}
      {liveItems.length === 0 && (
        <EmptyState
          icon={<Radio className="h-5 w-5" />}
          title="No live intelligence yet"
          description="Live signals will appear once the RSS feeds come online and agents are active."
        />
      )}
      {liveItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Rss className="h-3.5 w-3.5 text-war-green" />
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Live RSS Feed
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">
              {liveItems.length} articles
            </span>
          </div>
          <div className="space-y-1.5">
            {liveItems.map((item: any) => {
              const catMeta = CATEGORY_META[item.category];

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-war-border bg-war-panel px-4 py-3 transition-colors hover:border-war-border-light hover:bg-war-elevated"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <span>{item.sourceIcon}</span>
                        <span className="font-medium">{item.source}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">|</span>
                      <Tag>
                        {item.sourceType.replace(/_/g, " ")}
                      </Tag>
                      {catMeta && (
                        <>
                          <span className="text-[10px] text-zinc-500">|</span>
                          <span
                            className={`text-[10px] font-medium ${catMeta.color}`}
                          >
                            {catMeta.icon} {catMeta.label}
                          </span>
                        </>
                      )}
                    </div>
                    <span
                      className="text-[10px] text-zinc-400 font-mono font-medium shrink-0 ml-2"
                      title={formatDateTime(item.timestamp)}
                    >
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-[13px] font-medium text-zinc-200 leading-snug mb-1">
                    {item.headline}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  {/* Link */}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-war-green transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read full article
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Static Intel Reports */}
      {staticItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Intelligence Reports
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">
              {staticItems.length} curated items
            </span>
          </div>
          <div className="space-y-1.5">
            {staticItems
              .sort(
                (a: any, b: any) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((item: any) => {
                const urgencyStyles: Record<
                  string,
                  { bg: string; text: string; label: string; dot: string }
                > = {
                  flash: {
                    bg: "bg-red-500/15 border-red-500/40",
                    text: "text-red-400",
                    label: "FLASH",
                    dot: "bg-red-500 animate-pulse-subtle",
                  },
                  breaking: {
                    bg: "bg-orange-500/10 border-orange-500/30",
                    text: "text-orange-400",
                    label: "BREAKING",
                    dot: "bg-orange-500 animate-pulse-subtle",
                  },
                  urgent: {
                    bg: "bg-amber-500/10 border-amber-500/25",
                    text: "text-amber-400",
                    label: "URGENT",
                    dot: "bg-amber-400",
                  },
                  alert: {
                    bg: "bg-yellow-500/8 border-war-border-light",
                    text: "text-yellow-400",
                    label: "ALERT",
                    dot: "bg-yellow-500",
                  },
                  unverified: {
                    bg: "bg-zinc-500/8 border-war-border",
                    text: "text-zinc-500",
                    label: "UNVERIFIED",
                    dot: "bg-zinc-600",
                  },
                };

                const urgency =
                  urgencyStyles[item.urgency] || urgencyStyles.alert;
                const catMeta = CATEGORY_META[item.category];
                const sourceTypeIcons: Record<string, string> = {
                  cable_news: "📺", wire_service: "📡", official: "🏛️",
                  osint: "🛰️", social_media: "📱", newspaper: "📰", defense_media: "🎖️",
                };
                const sourceIcon = sourceTypeIcons[item.source_type] || "📡";

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-4 py-3 transition-colors ${urgency.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`}
                          />
                          <span
                            className={`text-[10px] font-mono font-bold uppercase ${urgency.text}`}
                          >
                            {urgency.label}
                          </span>
                        </span>
                        <span className="text-[10px] text-zinc-500">|</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <span>{sourceIcon}</span>
                          <span className="font-medium">{item.source}</span>
                        </span>
                        {catMeta && (
                          <>
                            <span className="text-[10px] text-zinc-500">
                              |
                            </span>
                            <span
                              className={`text-[10px] font-medium ${catMeta.color}`}
                            >
                              {catMeta.icon} {catMeta.label}
                            </span>
                          </>
                        )}
                      </div>
                      <span
                        className="text-[10px] text-zinc-400 font-mono font-medium shrink-0 ml-2"
                        title={formatDateTime(item.timestamp)}
                      >
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-[13px] font-medium text-zinc-200 leading-snug mb-1">
                      {item.headline}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                      {item.summary}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {item.verified ? (
                        <Tag variant="green">verified</Tag>
                      ) : (
                        <Tag variant="amber">unverified</Tag>
                      )}
                      {item.region && (
                        <Tag>{item.region.replace(/-/g, " ")}</Tag>
                      )}
                      <Tag>{item.source_type?.replace(/_/g, " ")}</Tag>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors ml-auto"
                        >
                          <ExternalLink className="h-3 w-3" />
                          source
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty state if nothing loaded */}
      {liveItems.length === 0 && staticItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 mb-3">
            <WifiOff className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-zinc-300 mb-1">
            No feeds available
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Unable to connect to RSS sources. Check your network connection and
            try again.
          </p>
        </div>
      )}
    </div>
  );
}
