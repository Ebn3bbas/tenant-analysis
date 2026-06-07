import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MockWebSocket,
  parseServerMessage,
} from "@/features/analytics/mocks/mockWebSocket";
import { analyticsKeys } from "@/features/analytics/api/queryKeys";
import type {
  ConnectionState,
  Row,
  TenantId,
} from "@/features/analytics/model/types";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 8000;

export function useLiveUpdates(tenantId: TenantId): ConnectionState {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<ConnectionState>({
    status: "connecting",
  });

  const socketRef = useRef<MockWebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      const socket = new MockWebSocket({ tenantId });
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setConnection({ status: "open", openedAt: Date.now() });
      };

      socket.onmessage = (event) => {
        const msg = parseServerMessage(event.data);
        if (!msg) return;
        queryClient.setQueryData<readonly Row[]>(
          analyticsKeys.rows(tenantId),
          (old) => {
            if (!old) return old;
            return old.map((row) => {
              if (row.id !== msg.rowId) return row;
              if (msg.updatedAt <= row.updatedAt) return row;
              return {
                ...row,
                cells: { ...row.cells, ...msg.cells } as Row["cells"],
                updatedAt: msg.updatedAt,
              };
            });
          },
        );
      };

      socket.onclose = (event) => {
        if (cancelled || event.wasClean) return;
        if (attemptRef.current >= MAX_RETRIES) {
          setConnection({ status: "closed", reason: "Max retries reached" });
          return;
        }
        attemptRef.current += 1;

        const delay = Math.min(
          MAX_DELAY_MS,
          BASE_DELAY_MS * 2 ** (attemptRef.current - 1),
        );

        setConnection({
          status: "reconnecting",
          attempt: attemptRef.current,
          nextRetryInMs: delay,
        });
        reconnectTimerRef.current = setTimeout(() => {
          if (!cancelled) connect();
        }, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.close();
      socketRef.current = null;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      attemptRef.current = 0;
    };
  }, [tenantId, queryClient]);

  return connection;
}
