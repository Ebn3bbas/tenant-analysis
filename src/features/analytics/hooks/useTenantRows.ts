import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "@/features/analytics/api/queryKeys";
import { fetchTenantRows } from "@/features/analytics/mocks/api";
import type { TenantId } from "@/features/analytics/model/types";

export function useTenantRows(tenantId: TenantId) {
  return useQuery({
    queryKey: analyticsKeys.rows(tenantId),
    queryFn: ({ signal }) => fetchTenantRows(tenantId, signal),
    placeholderData: undefined,
  });
}
