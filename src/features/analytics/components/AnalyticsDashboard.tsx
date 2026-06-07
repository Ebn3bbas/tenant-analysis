import { useMemo, useState } from "react";
import { TENANT_SCHEMAS, TENANTS } from "@/features/analytics/mocks/tenants";
import { useTenantRows } from "@/features/analytics/hooks/useTenantRows";
import { TenantSwitcher } from "./TenantSwitcher";
import {
  getIsDataStale,
  type TenantId,
} from "@/features/analytics/model/types";
import { DataTable } from "./DataTable";
import { selectVisibleColumns } from "../model/rbac";
import { useLiveUpdates } from "@/features/analytics/hooks/useLiveUpdates";

export function AnalyticsDashboard() {
  const firstTenant = TENANTS[0];
  if (!firstTenant) {
    throw new Error("No tenants found");
  }
  const [tenantId, setTenantId] = useState<TenantId>(firstTenant.id);

  const schema = TENANT_SCHEMAS[tenantId];
  const { data, status } = useTenantRows(tenantId);
  const tenant = TENANTS.find((t) => t.id === tenantId) ?? firstTenant;

  const visibleSchema = useMemo(() => {
    if (!schema) return null;
    return {
      ...schema,
      columns: selectVisibleColumns(schema, tenantId, tenant.currentUserRole),
    };
  }, [schema, tenantId, tenant]);

  const connection = useLiveUpdates(tenantId);
  const isDataStale = getIsDataStale(connection);

  return (
    <div className="flex flex-col h-screen">
      <TenantSwitcher activeTenantId={tenantId} onSwitch={setTenantId} />

      {isDataStale && (
        <div
          role="status"
          className="bg-amber-100 text-amber-800 px-3 py-1.5 text-sm"
        >
          ⚠ Data may be stale —{" "}
          {connection.status === "reconnecting"
            ? `reconnecting (attempt ${connection.attempt}/5)…`
            : "connection lost."}
        </div>
      )}

      {status === "pending" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {status === "error" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error loading data</div>
        </div>
      )}

      {status === "success" &&
        visibleSchema &&
        data &&
        (visibleSchema.columns.length > 0 ? (
          <DataTable schema={visibleSchema} rows={data} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-center">
            No columns visible for {tenant.currentUserRole} role.
          </div>
        ))}

      {status === "success" && !schema && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">
            No schema found for tenant {tenantId}
          </div>
        </div>
      )}
    </div>
  );
}
