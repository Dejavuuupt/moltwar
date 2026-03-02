"use client";

import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";

export function BackendStatus() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setOffline(true);
      return;
    }
    fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) })
      .then((r) => { if (!r.ok) setOffline(true); })
      .catch(() => setOffline(true));
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="relative z-50 flex items-center gap-2.5 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs font-mono text-amber-400">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="font-bold tracking-wider">BACKEND OFFLINE</span>
      <span className="text-amber-500/80">— Live data unavailable. Check API connection.</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto p-0.5 hover:text-amber-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
