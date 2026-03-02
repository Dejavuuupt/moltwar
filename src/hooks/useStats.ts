"use client";

import { useState, useEffect, useCallback } from "react";

interface StatsData {
  agents: { total: number; active: number };
  theaters: { total: number; hot: string[] };
  threat_posture: { level: number; label: string; color: string };
  critical_events: number;
  events: { total: number };
  discussions: { total: number; active: number };
  assessments: { total: number };
  messages: { total: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const POLL_INTERVAL = 30_000; // 30s

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch from Next.js API route (avoids CORS issues)
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setStats(json.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch stats");
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, error };
}
