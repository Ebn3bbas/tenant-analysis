declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type TenantId = Brand<string, "TenantId">;
export type ColumnId = Brand<string, "ColumnId">;
export type RowId = Brand<string, "RowId">;

export const asTenantId = (v: string): TenantId => v as TenantId;
export const asColumnId = (v: string): ColumnId => v as ColumnId;
export const asRowId = (v: string): RowId => v as RowId;

export type CellValue = string | number | boolean | null;

export type ColumnDataType = "string" | "number" | "boolean" | "date";

export interface ColumnDef {
  readonly id: ColumnId;
  readonly label: string;
  readonly dataType: ColumnDataType;
  readonly sortable: boolean;
  readonly align?: "left" | "right" | "center";
}

export interface TenantSchema {
  readonly id: TenantId;
  readonly columns: readonly ColumnDef[];
}

export interface Row {
  readonly id: RowId;
  readonly cells: Readonly<Record<ColumnId, CellValue>>;
  readonly updatedAt: number;
}

export type Role = "admin" | "analyst" | "viewer";

export interface Tenant {
  readonly id: TenantId;
  readonly name: string;
  readonly currentUserRole: Role;
}

export interface TenantRbac {
  readonly visibleColumns: Readonly<Record<Role, readonly ColumnId[]>>;
}

export type RbacConfig = Readonly<Record<TenantId, TenantRbac>>;

export type ConnectionState =
  | { readonly status: "connecting" }
  | { readonly status: "open"; readonly openedAt: number }
  | {
      readonly status: "reconnecting";
      readonly attempt: number;
      readonly nextRetryInMs: number;
    }
  | { readonly status: "closed"; readonly reason: string };

export const getIsDataStale = (state: ConnectionState): boolean =>
  state.status !== "open" && state.status !== "connecting";

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
