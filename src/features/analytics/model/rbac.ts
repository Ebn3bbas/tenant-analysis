import { RBAC_CONFIG } from "@/features/analytics/mocks/rbac";
import type {
  ColumnDef,
  ColumnId,
  Role,
  TenantId,
  TenantSchema,
} from "./types";

export function selectVisibleColumns(
  schema: TenantSchema,
  tenantId: TenantId,
  role: Role,
): readonly ColumnDef[] {
  const tenantRbac = RBAC_CONFIG[tenantId];
  const allowed = tenantRbac?.visibleColumns[role] ?? [];

  const allowedIds = new Set<ColumnId>(allowed);
  return schema.columns.filter((col) => allowedIds.has(col.id));
}
