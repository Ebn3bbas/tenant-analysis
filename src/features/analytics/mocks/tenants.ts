import {
  asColumnId,
  asTenantId,
  type Tenant,
  type TenantId,
  type TenantSchema,
} from "@/features/analytics/model/types";

export const TENANTS: readonly Tenant[] = [
  { id: asTenantId("acme"), name: "Acme Corp", currentUserRole: "admin" },
  { id: asTenantId("globex"), name: "Globex", currentUserRole: "analyst" },
  { id: asTenantId("initech"), name: "Initech", currentUserRole: "viewer" },
];

export const TENANT_SCHEMAS: Readonly<Record<TenantId, TenantSchema>> = {
  [asTenantId("acme")]: {
    id: asTenantId("acme"),
    columns: [
      {
        id: asColumnId("name"),
        label: "Account",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("region"),
        label: "Region",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("mrr"),
        label: "MRR",
        dataType: "number",
        sortable: true,
        align: "right",
      },
      {
        id: asColumnId("seats"),
        label: "Seats",
        dataType: "number",
        sortable: true,
        align: "right",
      },
      {
        id: asColumnId("active"),
        label: "Active",
        dataType: "boolean",
        sortable: true,
        align: "center",
      },
      {
        id: asColumnId("signupDate"),
        label: "Signed Up",
        dataType: "date",
        sortable: true,
        align: "center",
      },
    ],
  },
  [asTenantId("globex")]: {
    id: asTenantId("globex"),
    columns: [
      {
        id: asColumnId("company"),
        label: "Company",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("plan"),
        label: "Plan",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("arr"),
        label: "ARR",
        dataType: "number",
        sortable: true,
        align: "right",
      },
      {
        id: asColumnId("churnRisk"),
        label: "Churn Risk",
        dataType: "number",
        sortable: true,
        align: "right",
      },
      {
        id: asColumnId("renewalDate"),
        label: "Renewal Date",
        dataType: "date",
        sortable: true,
        align: "center",
      },
    ],
  },
  [asTenantId("initech")]: {
    id: asTenantId("initech"),
    columns: [
      {
        id: asColumnId("ticket"),
        label: "Ticket",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("status"),
        label: "Status",
        dataType: "string",
        sortable: true,
        align: "left",
      },
      {
        id: asColumnId("priority"),
        label: "Priority",
        dataType: "string",
        sortable: true,
        align: "left",
      },
    ],
  },
} satisfies Record<TenantId, TenantSchema>;
