"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

type WSStatus = "connecting" | "connected" | "disconnected" | "error";

interface WSMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

export function useWebSocket(channels: string[] = ["global"]) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setStatus("connecting");
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setStatus("connected");
        reconnectAttempts.current = 0;
        // Subscribe to channels
        ws.send(JSON.stringify({ type: "subscribe", channels }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type !== "pong") {
            setLastMessage(msg);
          }
        } catch {
          // ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus("disconnected");
        wsRef.current = null;
        // Exponential backoff reconnect
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      wsRef.current = ws;
    } catch {
      setStatus("error");
    }
  }, [channels]);

  useEffect(() => {
    connect();

    // Ping to keep alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, lastMessage };
}
