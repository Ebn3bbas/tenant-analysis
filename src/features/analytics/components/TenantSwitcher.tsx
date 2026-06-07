import { TENANTS } from "@/features/analytics/mocks/tenants";
import type { TenantId } from "@/features/analytics/model/types";

interface TenantSwitcherProps {
  readonly activeTenantId: TenantId;
  readonly onSwitch: (tenantId: TenantId) => void;
}

export function TenantSwitcher({
  activeTenantId,
  onSwitch,
}: TenantSwitcherProps) {
  return (
    <div className="flex flex-row gap-2 p-2">
      {TENANTS.map((tenant) => {
        const isActive = tenant.id === activeTenantId;
        return (
          <button
            key={tenant.id}
            type="button"
            onClick={() => onSwitch(tenant.id)}
            aria-pressed={isActive}
            className={`${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-1.5 transition`}
          >
            {tenant.name}
          </button>
        );
      })}
    </div>
  );
}
