"use client";

import { useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { Globe, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const GEO_URL = "/data/world-110m.json";

const threatDotColor: Record<string, string> = {
  critical: "#ef4444",
  severe: "#f97316",
  high: "#f59e0b",
  moderate: "#eab308",
  low: "#22c55e",
};

const connections = [
  ["iranian-mainland", "persian-gulf"],
  ["persian-gulf", "strait-of-hormuz"],
  ["iranian-mainland", "iraq-theater"],
  ["red-sea", "strait-of-hormuz"],
  ["iranian-mainland", "lebanon-border"],
];

const DEFAULT_CENTER: [number, number] = [50, 28];
const DEFAULT_ZOOM = 2.2;

export default function TheaterMap({ theaters }: { theaters: any[] }) {
  const theaterMap = Object.fromEntries(theaters.map((t: any) => [t.id, t]));

  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  const handleZoomIn = useCallback(() => {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 12) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: DEFAULT_CENTER, zoom: DEFAULT_ZOOM });
  }, []);

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Globe className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-zinc-100">CENTCOM Area of Responsibility</span>
            <span className="text-[10px] text-zinc-500 ml-2 font-mono">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-mono font-bold">ACTIVE CONFLICT</span>
        </div>
      </div>

      {/* Map container */}
      <div className="relative mx-3 mb-3 rounded-lg border border-zinc-800/40 overflow-hidden bg-[#060610]">
        {/* Classification banner */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-red-900/70 text-center py-0.5 pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-red-200 tracking-widest">
            SECRET // NOFORN — OPERATION BURNING SPEAR — THEATER OVERVIEW
          </span>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-5 right-3 z-20 flex flex-col gap-1">
          <button onClick={handleZoomIn} className="h-7 w-7 rounded bg-zinc-900/90 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800 transition-colors" title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button onClick={handleZoomOut} className="h-7 w-7 rounded bg-zinc-900/90 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800 transition-colors" title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button onClick={handleReset} className="h-7 w-7 rounded bg-zinc-900/90 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-800 transition-colors" title="Reset view">
            <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute top-5 left-3 z-20 bg-zinc-900/80 rounded px-2 py-0.5 pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500">{position.zoom.toFixed(1)}x</span>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 180,
          }}
          style={{ width: "100%", display: "block" }}
          width={900}
          height={420}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={12}
          >
            {/* Country shapes */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const isIran = name === "Iran";
                  const isIraq = name === "Iraq";
                  const isHighlight = ["Israel", "Lebanon", "Syria", "Yemen", "Saudi Arabia", "United Arab Emirates", "Qatar", "Bahrain", "Kuwait", "Oman"].includes(name);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        isIran ? "#1c0a0a" :
                        isIraq ? "#141018" :
                        isHighlight ? "#161620" :
                        "#111118"
                      }
                      stroke={
                        isIran ? "#ef4444" :
                        isIraq ? "#f59e0b" :
                        isHighlight ? "#2a2a40" :
                        "#1a1a2e"
                      }
                      strokeWidth={isIran ? 1.2 : isIraq ? 0.8 : 0.4}
                      strokeDasharray={isIran ? "4,2" : undefined}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: isIran ? "#2a0a0a" : "#1a1a28" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Connection lines between theaters */}
            {connections.map(([fromId, toId], i) => {
              const from = theaterMap[fromId];
              const to = theaterMap[toId];
              if (!from || !to) return null;
              return (
                <Line
                  key={`line-${i}`}
                  from={[from.coordinates.lng, from.coordinates.lat]}
                  to={[to.coordinates.lng, to.coordinates.lat]}
                  stroke="#ef4444"
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                  strokeOpacity={0.3}
                />
              );
            })}

            {/* Theater markers */}
            {theaters.map((t: any) => {
              const color = threatDotColor[t.threat_level] || "#71717a";
              const isCritical = t.threat_level === "critical";

              return (
                <Marker key={t.id} coordinates={[t.coordinates.lng, t.coordinates.lat]}>
                  {/* Outer glow */}
                  <circle r={isCritical ? 10 : 7} fill={color} opacity={0.08} />
                  {/* Pulse ring */}
                  <circle r={6} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4}>
                    <animate attributeName="r" values="4;9;4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                  </circle>
                  {isCritical && (
                    <circle r={4} fill="none" stroke={color} strokeWidth={0.3} opacity={0.3}>
                      <animate attributeName="r" values="3;7;3" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Core dot */}
                  <circle r={isCritical ? 2.5 : 2} fill={color} stroke="#09090b" strokeWidth={0.8} />
                  {/* Inner bright */}
                  <circle r={0.8} fill="white" opacity={0.5} />

                  {/* Label */}
                  <g transform="translate(6, -3)">
                    <rect
                      x={0}
                      y={-4}
                      width={Math.min(t.name.length * 2.8 + 6, 70)}
                      height={9}
                      rx={1.5}
                      fill="#09090b"
                      fillOpacity={0.9}
                      stroke={color}
                      strokeWidth={0.3}
                      strokeOpacity={0.5}
                    />
                    <text x={3} y={2.5} fill="#d4d4d8" fontSize={4} fontFamily="ui-monospace, monospace" fontWeight={500}>
                      {t.name.length > 22 ? t.name.slice(0, 20) + "…" : t.name}
                    </text>
                  </g>

                  {/* Status tag for critical */}
                  {isCritical && (
                    <g transform="translate(6, 7)">
                      <rect x={0} y={-3.5} width={24} height={7} rx={1.5} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.2} strokeOpacity={0.3} />
                      <text x={2.5} y={1.5} fill={color} fontSize={3.5} fontFamily="ui-monospace, monospace" fontWeight={700}>
                        CRITICAL
                      </text>
                    </g>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Bottom timestamp bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 px-3 py-1 z-10 pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500">
            LAST UPDATED: 28 FEB 2026 0600Z | SOURCE: CENTCOM J2 FUSION CELL | CLASS: TS/SCI
          </span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-7 left-3 z-10 flex items-center gap-3 bg-zinc-950/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-zinc-800/50 pointer-events-none">
          {[
            { level: "Critical", color: "#ef4444" },
            { level: "Severe", color: "#f97316" },
            { level: "High", color: "#f59e0b" },
          ].map(({ level, color }) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-[10px] text-zinc-400">{level}</span>
            </div>
          ))}
          <div className="h-3 w-px bg-zinc-700" />
          <div className="flex items-center gap-1.5">
            <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,2" opacity="0.5" /></svg>
            <span className="text-[10px] text-zinc-400">Attack vector</span>
          </div>
        </div>
      </div>
    </div>
  );
}
