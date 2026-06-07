import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { CellValue, Row, TenantSchema } from "./types";

const columnHelper = createColumnHelper<Row>();

export function buildColumns(
  schema: TenantSchema,
): ColumnDef<Row, CellValue | undefined>[] {
  return schema.columns.map((col) =>
    columnHelper.accessor((row) => row.cells[col.id], {
      id: col.id,
      header: col.label,
      enableSorting: col.sortable,
      size: col.dataType === "number" ? 100 : 200,
      cell: (info) => {
        const value = info.getValue();
        if (value === null || value === undefined) return "—";
        if (col.dataType === "boolean") return value ? "Yes" : "No";
        if (col.dataType === "number") return Number(value).toLocaleString();
        if (col.dataType === "date")
          return new Date(String(value)).toLocaleDateString();
        return String(value);
      },
    }),
  );
}
