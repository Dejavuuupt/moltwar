import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "MOLTWAR-Intelligence-Aggregator/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:description", "mediaDescription"],
      ["description", "description"],
      ["dc:creator", "creator"],
    ],
  },
});

export interface FeedSource {
  name: string;
  url: string;
  type: "wire_service" | "cable_news" | "newspaper" | "defense_media" | "official" | "osint";
  category: "military" | "diplomatic" | "economic" | "cyber" | "civilian" | "general";
  icon: string;
}

export interface PulseItem {
  id: string;
  source: string;
  sourceType: string;
  sourceIcon: string;
  category: string;
  headline: string;
  summary: string;
  url: string | null;
  timestamp: string;
  feedName: string;
}

// Major news RSS feeds covering world / middle-east / conflict
export const FEED_SOURCES: FeedSource[] = [
  // Wire Services
  {
    name: "Reuters — Wire",
    url: "https://news.google.com/rss/search?q=reuters+iran+war&hl=en-US&gl=US&ceid=US:en",
    type: "wire_service",
    category: "general",
    icon: "📡",
  },
  {
    name: "AP News — Wire",
    url: "https://news.google.com/rss/search?q=associated+press+iran+middle+east&hl=en-US&gl=US&ceid=US:en",
    type: "wire_service",
    category: "general",
    icon: "📡",
  },

  // Cable News
  {
    name: "CNN — World",
    url: "http://rss.cnn.com/rss/edition_world.rss",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "CNN — Middle East",
    url: "http://rss.cnn.com/rss/edition_meast.rss",
    type: "cable_news",
    category: "military",
    icon: "📺",
  },
  {
    name: "BBC — World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "BBC — Middle East",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    type: "cable_news",
    category: "military",
    icon: "📺",
  },
  {
    name: "Al Jazeera — All",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "France 24 — Middle East",
    url: "https://www.france24.com/en/middle-east/rss",
    type: "cable_news",
    category: "military",
    icon: "📺",
  },
  {
    name: "DW — World",
    url: "https://rss.dw.com/rdf/rss-en-world",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },

  // Newspapers
  {
    name: "The Guardian — World",
    url: "https://www.theguardian.com/world/rss",
    type: "newspaper",
    category: "general",
    icon: "📰",
  },
  {
    name: "NY Times — World",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    type: "newspaper",
    category: "general",
    icon: "📰",
  },
  {
    name: "NY Times — Middle East",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
    type: "newspaper",
    category: "military",
    icon: "📰",
  },

  // Defense / Military Media
  {
    name: "USNI News",
    url: "https://news.usni.org/feed",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },
  {
    name: "Defense News",
    url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },
  {
    name: "War on the Rocks",
    url: "https://warontherocks.com/feed/",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },
  {
    name: "The War Zone",
    url: "https://www.thedrive.com/the-war-zone/feed",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },

  // Official
  {
    name: "US DoD News",
    url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=20&ContentType=1&Site=945",
    type: "official",
    category: "military",
    icon: "🏛️",
  },
  {
    name: "UN News — Middle East",
    url: "https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml",
    type: "official",
    category: "diplomatic",
    icon: "🏛️",
  },

  // Economic
  {
    name: "Bloomberg — Markets",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    type: "newspaper",
    category: "economic",
    icon: "📰",
  },
  {
    name: "CNBC — World",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362",
    type: "cable_news",
    category: "economic",
    icon: "📺",
  },
  {
    name: "FT — World",
    url: "https://www.ft.com/rss/home",
    type: "newspaper",
    category: "economic",
    icon: "📰",
  },
  {
    name: "OilPrice.com",
    url: "https://oilprice.com/rss/main",
    type: "newspaper",
    category: "economic",
    icon: "📰",
  },

  // Cyber
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    type: "osint",
    category: "cyber",
    icon: "🛰️",
  },
  {
    name: "CyberScoop",
    url: "https://cyberscoop.com/feed/",
    type: "osint",
    category: "cyber",
    icon: "🛰️",
  },
  {
    name: "BleepingComputer",
    url: "https://www.bleepingcomputer.com/feed/",
    type: "osint",
    category: "cyber",
    icon: "🛰️",
  },
  {
    name: "Dark Reading",
    url: "https://www.darkreading.com/rss.xml",
    type: "osint",
    category: "cyber",
    icon: "🛰️",
  },

  // Regional / Middle East Specialists
  {
    name: "Middle East Monitor",
    url: "https://www.middleeastmonitor.com/feed/",
    type: "newspaper",
    category: "military",
    icon: "📰",
  },
  {
    name: "Breaking Defense",
    url: "https://breakingdefense.com/feed/",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },
  {
    name: "Politico — Defense",
    url: "https://rss.politico.com/defense.xml",
    type: "newspaper",
    category: "military",
    icon: "📰",
  },
  {
    name: "Task & Purpose",
    url: "https://taskandpurpose.com/feed/",
    type: "defense_media",
    category: "military",
    icon: "🎖️",
  },
  {
    name: "The National (UAE)",
    url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml",
    type: "newspaper",
    category: "general",
    icon: "📰",
  },
  {
    name: "Times of Israel",
    url: "https://www.timesofisrael.com/feed/",
    type: "newspaper",
    category: "military",
    icon: "📰",
  },
  {
    name: "Jerusalem Post",
    url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx",
    type: "newspaper",
    category: "military",
    icon: "📰",
  },
  {
    name: "Iran International",
    url: "https://www.iranintl.com/en/feed",
    type: "cable_news",
    category: "military",
    icon: "📺",
  },

  // Think Tanks & Analysis
  {
    name: "Foreign Affairs",
    url: "https://www.foreignaffairs.com/rss.xml",
    type: "defense_media",
    category: "diplomatic",
    icon: "🎖️",
  },
  {
    name: "Foreign Policy",
    url: "https://foreignpolicy.com/feed/",
    type: "defense_media",
    category: "diplomatic",
    icon: "🎖️",
  },
  {
    name: "The Diplomat",
    url: "https://thediplomat.com/feed/",
    type: "defense_media",
    category: "diplomatic",
    icon: "🎖️",
  },

  // OSINT / Intelligence
  {
    name: "Bellingcat",
    url: "https://www.bellingcat.com/feed/",
    type: "osint",
    category: "military",
    icon: "🛰️",
  },
  {
    name: "Google News — Iran War",
    url: "https://news.google.com/rss/search?q=iran+war+military+strike&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "military",
    icon: "🛰️",
  },
  {
    name: "The Intercept",
    url: "https://theintercept.com/feed/?rss",
    type: "newspaper",
    category: "general",
    icon: "📰",
  },

  // Nuclear / Arms Control
  {
    name: "Arms Control Association",
    url: "https://www.armscontrol.org/rss.xml",
    type: "defense_media",
    category: "diplomatic",
    icon: "🎖️",
  },
  {
    name: "Google News — Strait of Hormuz",
    url: "https://news.google.com/rss/search?q=strait+of+hormuz+OR+persian+gulf+shipping&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "economic",
    icon: "🛰️",
  },

  // International Wire / Agencies
  {
    name: "AFP — World",
    url: "https://www.france24.com/en/rss",
    type: "wire_service",
    category: "general",
    icon: "📡",
  },
  {
    name: "NPR — World",
    url: "https://feeds.npr.org/1004/rss.xml",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "PBS NewsHour — World",
    url: "https://www.pbs.org/newshour/feeds/rss/world",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "ABC News — International",
    url: "https://abcnews.go.com/abcnews/internationalheadlines",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },
  {
    name: "Sky News — World",
    url: "https://feeds.skynews.com/feeds/rss/world.xml",
    type: "cable_news",
    category: "general",
    icon: "📺",
  },

  // Shipping / Maritime (Strait of Hormuz relevant)
  {
    name: "gCaptain — Maritime",
    url: "https://gcaptain.com/feed/",
    type: "osint",
    category: "economic",
    icon: "🛰️",
  },
  {
    name: "Google News — Oil Markets",
    url: "https://news.google.com/rss/search?q=oil+price+crude+energy+war&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "economic",
    icon: "🛰️",
  },

  // Aggregated Conflict Searches
  {
    name: "Google News — CENTCOM",
    url: "https://news.google.com/rss/search?q=CENTCOM+OR+%22US+military%22+middle+east&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "military",
    icon: "🛰️",
  },
  {
    name: "Google News — Hezbollah",
    url: "https://news.google.com/rss/search?q=hezbollah+OR+lebanon+war+OR+israel+strike&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "military",
    icon: "🛰️",
  },
  {
    name: "Google News — Cyber Warfare",
    url: "https://news.google.com/rss/search?q=cyber+attack+iran+OR+infrastructure+hack&hl=en-US&gl=US&ceid=US:en",
    type: "osint",
    category: "cyber",
    icon: "🛰️",
  },
];

async function fetchSingleFeed(
  source: FeedSource
): Promise<PulseItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 15).map((item, i) => ({
      id: `${source.name.replace(/\s/g, "-").toLowerCase()}-${i}`,
      source: source.name,
      sourceType: source.type,
      sourceIcon: source.icon,
      category: source.category,
      headline: (item.title || "No title").trim(),
      summary: extractSummary(item),
      url: item.link || null,
      timestamp: safeParseDate(item.isoDate || item.pubDate),
      feedName: source.name,
    }));
  } catch {
    // Feed unavailable — skip silently
    return [];
  }
}

function safeParseDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (isNaN(d.getTime())) return new Date().toISOString();
  // Clamp future dates to now (timezone offset edge cases)
  if (d.getTime() > Date.now()) return new Date().toISOString();
  return d.toISOString();
}

function extractSummary(item: Record<string, any>): string {
  // Try multiple fields — different feeds put summaries in different places
  const raw =
    item.contentSnippet ||
    item.content ||
    item.summary ||
    item.mediaDescription ||
    item.description ||
    "";
  return stripHtml(raw).slice(0, 300);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAllFeeds(): Promise<{
  items: PulseItem[];
  feedsOnline: number;
  feedsTotal: number;
  fetchedAt: string;
}> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((source) => fetchSingleFeed(source))
  );

  let feedsOnline = 0;
  const allItems: PulseItem[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      feedsOnline++;
      allItems.push(...result.value);
    }
  });

  // Sort by timestamp descending (newest first)
  allItems.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    items: allItems,
    feedsOnline,
    feedsTotal: FEED_SOURCES.length,
    fetchedAt: new Date().toISOString(),
  };
}
