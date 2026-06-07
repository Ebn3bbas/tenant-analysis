import { useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { buildColumns } from "@/features/analytics/model/columns";
import { useUrlSorting } from "@/features/analytics/hooks/useUrlSorting";
import { useUrlFilter } from "@/features/analytics/hooks/useUrlFilter";
import type { Row, TenantSchema } from "@/features/analytics/model/types";

const ROW_HEIGHT = 40;

function alignClass(align: "left" | "right" | "center" | undefined): string {
  switch (align) {
    case "right":
      return "justify-end text-right";
    case "center":
      return "justify-center text-center";
    default:
      return "justify-start text-left";
  }
}

interface DataTableProps {
  readonly schema: TenantSchema;
  readonly rows: readonly Row[];
}

export function DataTable({ schema, rows }: DataTableProps) {
  const columns = useMemo(() => buildColumns(schema), [schema]);

  const alignById = useMemo(
    () => new Map(schema.columns.map((c) => [c.id as string, c.align])),
    [schema],
  );
  const [sorting, setSorting] = useUrlSorting();
  const [globalFilter, setGlobalFilter] = useUrlFilter();

  const table = useReactTable({
    data: rows as Row[],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: (updater) =>
      setSorting(typeof updater === "function" ? updater(sorting) : updater),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
  });

  const tableRows = table.getRowModel().rows;
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search all columns…"
          className="w-full border rounded px-3 py-1.5"
        />
      </div>

      <div ref={parentRef} className="flex-1 min-h-0 overflow-auto">
        <table className="grid">
          <thead className="grid sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="flex w-full">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const sortIndex = header.column.getSortIndex();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`flex items-center gap-1 px-3 py-2 font-semibold ${alignClass(
                        alignById.get(header.column.id),
                      )} ${canSort ? "cursor-pointer select-none" : ""}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sorted && <span>{sorted === "asc" ? "▲" : "▼"}</span>}
                      {sorting.length > 1 && sortIndex >= 0 && (
                        <span className="ml-1 rounded bg-blue-100 px-1 text-xs text-blue-700">
                          {sortIndex + 1}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody
            className="grid relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              if (!row) return null;
              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  className="flex w-full absolute border-b hover:bg-gray-200 even:bg-gray-100"
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className={`flex items-center px-3 truncate ${alignClass(
                        alignById.get(cell.column.id),
                      )}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
