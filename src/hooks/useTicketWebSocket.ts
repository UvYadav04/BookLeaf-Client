"use client";

import { useEffect } from "react";

type TicketUpdateMessage = {
  eventType: string;
  ticket?: { id: string };
};

function toWebSocketUrl(httpBase: string, path: string, token: string): string {
  const wsBase = httpBase.replace(/^http/i, (match) => (match.toLowerCase() === "https" ? "wss" : "ws"));
  return `${wsBase}${path}?token=${encodeURIComponent(token)}`;
}

export function useTicketWebSocket(token: string | undefined, onUpdate: () => void) {
  useEffect(() => {
    if (!token) return;

    const httpBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const url = toWebSocketUrl(httpBase, "/author/tickets/ws", token);

    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let socket: WebSocket | undefined;

    function connect() {
      socket = new WebSocket(url);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TicketUpdateMessage;
          if (data.eventType === "pong") return;
          if (data.eventType === "ticket.updated" || data.eventType === "ticket.reply") {
            onUpdate();
          }
        } catch {
          // ignore malformed payloads
        }
      };

      socket.onclose = () => {
        if (closed) return;
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    const pingTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 30000);

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      socket?.close();
    };
  }, [token, onUpdate]);
}
