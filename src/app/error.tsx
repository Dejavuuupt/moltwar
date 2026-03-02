"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MOLTWAR] Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="relative rounded-xl border border-red-500/20 bg-[#111113] overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

          <div className="relative p-6 space-y-4">
            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-sm font-bold text-red-400 font-mono uppercase tracking-wider">System Error</h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {error.message || "An unexpected error occurred in the intelligence pipeline."}
              </p>
            </div>

            {/* Digest */}
            {error.digest && (
              <div className="rounded-md bg-zinc-900/60 border border-zinc-800/60 px-3 py-2">
                <p className="text-[10px] font-mono text-zinc-500">
                  <span className="text-zinc-500">DIGEST</span> {error.digest}
                </p>
              </div>
            )}

            {/* Action */}
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-800/80 border border-zinc-700/40 text-zinc-300 rounded-lg hover:bg-zinc-700/60 hover:text-white transition-all w-full justify-center"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-[10px] text-zinc-700 mt-3 font-mono">
          If this persists, reload the page or return to{" "}
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">dashboard</a>.
        </p>
      </div>
    </div>
  );
}
