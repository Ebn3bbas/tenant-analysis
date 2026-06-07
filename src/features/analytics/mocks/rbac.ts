import {
  asColumnId,
  asTenantId,
  type RbacConfig,
} from "@/features/analytics/model/types";

export const RBAC_CONFIG: RbacConfig = {
  [asTenantId("acme")]: {
    visibleColumns: {
      admin: [
        asColumnId("name"),
        asColumnId("region"),
        asColumnId("mrr"),
        asColumnId("seats"),
        asColumnId("active"),
        asColumnId("signupDate"),
      ],
      analyst: [
        asColumnId("name"),
        asColumnId("region"),
        asColumnId("mrr"),
        asColumnId("seats"),
      ],
      viewer: [asColumnId("name"), asColumnId("region")],
    },
  },
  [asTenantId("globex")]: {
    visibleColumns: {
      admin: [
        asColumnId("company"),
        asColumnId("plan"),
        asColumnId("arr"),
        asColumnId("churnRisk"),
        asColumnId("renewalDate"),
      ],
      analyst: [asColumnId("company"), asColumnId("plan"), asColumnId("arr")],
      viewer: [asColumnId("company"), asColumnId("plan")],
    },
  },
  [asTenantId("initech")]: {
    visibleColumns: {
      admin: [
        asColumnId("ticket"),
        asColumnId("status"),
        asColumnId("priority"),
      ],
      analyst: [asColumnId("ticket"), asColumnId("status")],
      viewer: [asColumnId("ticket")],
    },
  },
} satisfies RbacConfig;
