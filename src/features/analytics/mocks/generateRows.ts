import {
  asRowId,
  assertNever,
  type CellValue,
  type ColumnDataType,
  type ColumnId,
  type Row,
  type TenantId,
} from "@/features/analytics/model/types";
import { TENANT_SCHEMAS } from "./tenants";

export function makeCell(type: ColumnDataType, rowIndex: number): CellValue {
  switch (type) {
    case "string":
      return `Account ${rowIndex}`;
    case "number":
      return Math.floor(Math.random() * 10000);
    case "boolean":
      return Math.random() < 0.5;
    case "date":
      return new Date(
        Date.now() - Math.floor(Math.random() * 1000000000000),
      ).toISOString();
    default:
      return assertNever(type);
  }
}

const rowCache = new Map<TenantId, readonly Row[]>();

export function getTenantRows(
  tenantId: TenantId,
  count = 10_000,
): readonly Row[] {
  const cached = rowCache.get(tenantId);
  if (cached) return cached;

  const schema = TENANT_SCHEMAS[tenantId];
  if (!schema) throw new Error(`No schema for tenant: ${tenantId}`);

  const rows: Row[] = [];
  for (let i = 0; i < count; i++) {
    const cells: Record<ColumnId, CellValue> = {};
    for (const col of schema.columns) {
      cells[col.id] = makeCell(col.dataType, i);
    }
    rows.push({
      id: asRowId(`${tenantId}-${i}`),
      cells,
      updatedAt: Date.now(),
    });
  }
  rowCache.set(tenantId, rows);
  return rows;
}
