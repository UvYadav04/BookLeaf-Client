"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

function getWebSocketBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  return base.replace(/^http/i, "ws");
}

export function useAuthorTicketWebSocket(onUpdate: () => void) {
  const token = useAppSelector((s) => s.auth.tokens?.accessToken);

  useEffect(() => {
    if (!token) return;

    let closed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      const url = `${getWebSocketBaseUrl()}/author/tickets/ws?accessToken=${encodeURIComponent(token  || "")}`;
      socket = new WebSocket(url);

      socket.onmessage = () => {
        if (!closed) onUpdate();
      };

      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token, onUpdate]);
}
