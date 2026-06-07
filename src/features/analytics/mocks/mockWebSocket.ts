import type {
  CellValue,
  ColumnId,
  RowId,
  TenantId,
} from "@/features/analytics/model/types";
import { getTenantRows } from "./generateRows";
import { TENANT_SCHEMAS } from "./tenants";
import { makeCell } from "./generateRows";

export interface RowUpdateMessage {
  readonly type: "row.update";
  readonly rowId: RowId;
  readonly cells: Readonly<Partial<Record<ColumnId, CellValue>>>;
  readonly updatedAt: number;
}

export type ServerMessage = RowUpdateMessage;
export const WsReadyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;
export type WsReadyState = (typeof WsReadyState)[keyof typeof WsReadyState];

export interface MockMessageEvent {
  readonly data: string;
}

export interface MockCloseEvent {
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
}

export interface MockWebSocketOptions {
  readonly tenantId: TenantId;
  readonly updateIntervalMs?: number;
  readonly dropAfterMs?: number;
  readonly connectDelayMs?: number;
  readonly failConnection?: boolean;
}

export class MockWebSocket {
  readyState: WsReadyState = WsReadyState.CONNECTING;

  onopen: (() => void) | null = null;
  onmessage: ((event: MockMessageEvent) => void) | null = null;
  onclose: ((event: MockCloseEvent) => void) | null = null;
  onerror: ((error: Error) => void) | null = null;

  private readonly tenantId: TenantId;
  private readonly updateIntervalMs: number;
  private readonly dropAfterMs: number;
  private readonly connectDelayMs: number;
  private readonly failConnection: boolean;

  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private dropTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: MockWebSocketOptions) {
    this.tenantId = options.tenantId;
    this.updateIntervalMs = options.updateIntervalMs ?? 800;
    this.dropAfterMs = options.dropAfterMs ?? 60_000;
    this.connectDelayMs = options.connectDelayMs ?? 300;
    this.failConnection = options.failConnection ?? false;
    this.connect();
  }

  private connect(): void {
    this.connectTimer = setTimeout(() => {
      if (this.failConnection) {
        this.handleClose({
          code: 1006,
          reason: "Simulated connection failure",
          wasClean: false,
        });
        return;
      }
      this.readyState = WsReadyState.OPEN;
      this.onopen?.();
      this.startStreaming();
      this.scheduleDrop();
    }, this.connectDelayMs);
  }

  private startStreaming(): void {
    this.streamTimer = setInterval(() => {
      const message = this.nextRowUpdate();
      if (message) this.onmessage?.({ data: JSON.stringify(message) });
    }, this.updateIntervalMs);
  }

  private scheduleDrop(): void {
    this.dropTimer = setTimeout(() => {
      this.handleClose({
        code: 1006,
        reason: "Simulated network drop",
        wasClean: false,
      });
    }, this.dropAfterMs);
  }

  private nextRowUpdate(): RowUpdateMessage | null {
    const rows = getTenantRows(this.tenantId);
    const schema = TENANT_SCHEMAS[this.tenantId];
    if (rows.length === 0 || !schema) return null;

    const rowIndex = Math.floor(Math.random() * rows.length);
    const row = rows[rowIndex];
    if (!row) return null;
    const column =
      schema.columns[Math.floor(Math.random() * schema.columns.length)];
    if (!column) return null;
    const newValue = makeCell(column.dataType, rowIndex);
    return {
      type: "row.update",
      rowId: row.id,
      cells: { [column.id]: newValue },
      updatedAt: Date.now(),
    };
  }

  private handleClose(event: MockCloseEvent): void {
    this.clearTimers();
    this.readyState = WsReadyState.CLOSED;
    this.onclose?.(event);
  }

  close(code = 1000, reason = "Client closed"): void {
    if (this.readyState === WsReadyState.CLOSED) return;
    this.readyState = WsReadyState.CLOSING;
    this.handleClose({ code, reason, wasClean: true });
  }

  private clearTimers(): void {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    if (this.streamTimer) clearInterval(this.streamTimer);
    if (this.dropTimer) clearTimeout(this.dropTimer);
    this.connectTimer = null;
    this.streamTimer = null;
    this.dropTimer = null;
  }
}

export function parseServerMessage(data: string): ServerMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  if (!("type" in parsed) || parsed.type !== "row.update") return null;
  if (!("rowId" in parsed) || typeof parsed.rowId !== "string") return null;
  if (!("updatedAt" in parsed) || typeof parsed.updatedAt !== "number")
    return null;
  if (
    !("cells" in parsed) ||
    typeof parsed.cells !== "object" ||
    parsed.cells === null
  ) {
    return null;
  }
  return parsed as RowUpdateMessage;
}
