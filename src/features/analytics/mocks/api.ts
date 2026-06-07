import type { Row, TenantId } from "@/features/analytics/model/types";
import { getTenantRows } from "./generateRows";

export function fetchTenantRows(
  tenantId: TenantId,
  signal?: AbortSignal,
): Promise<readonly Row[]> {
  return new Promise<readonly Row[]>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(
      () => {
        cleanup();
        resolve(getTenantRows(tenantId));
      },
      600 + Math.random() * 900,
    );

    function cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    function onAbort() {
      cleanup();
      reject(signal?.reason);
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
