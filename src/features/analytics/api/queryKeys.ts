import type { TenantId } from "@/features/analytics/model/types";

export const analyticsKeys = {
  all: ["analytics"] as const,
  rows: (tenantId: TenantId) =>
    [...analyticsKeys.all, "rows", tenantId] as const,
} as const;
