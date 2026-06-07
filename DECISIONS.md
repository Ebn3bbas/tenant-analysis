# Tenant Analytics — Decisions & Tradeoffs (living ledger)

> Working doc. Raw material for the **Loom video (Task 1)** and the README
> "Decisions & Tradeoffs" section. Refine before submission; delete the TODO
> bookkeeping rows.

## Stack
- **Vite + React 18 + TS (strict)** — fastest loop, no framework opinion, own the URL-state plumbing (shows skill).
- **TanStack Query v5** — owns server state; no `useEffect` for fetching.
- **TanStack Table + Virtual (headless)** — logic-only, zero styled UI → Tailwind-only constraint stays intact.
- **nuqs v2** — type-safe URL state for filter/sort (Ch.5).
- **Tailwind v4** (`@tailwindcss/vite`) — utility CSS, not a UI lib.

## Checkpoint log
| # | Checkpoint | Status |
|---|---|---|
| 1.1 | Scaffold, strict tsconfig, QueryClient, feature-first folders | ✅ |
| 1.2 | Domain type model (branded ids, schema-as-data, RBAC shape, ConnectionState union) | ✅ (stale-status decision open) |
| 1.3 | Mock layer (3 schemas, RBAC config, 10k generator, AbortSignal API) | ✅ |
| 0.5 | `mockWebSocket.ts` (800ms stream, 60s unclean drop) | ✅ (nextRowUpdate + parse stubs open) |
| 2 | Tenant switching + live cancellation | ✅ wired, green |
| 3 | Virtualized 10k table | ✅ (verified in-browser: 33 DOM rows, not 10k) |
| 4 | RBAC-driven column visibility | ✅ (verified: admin=6, analyst=3, viewer=1 cols) |
| 5 | Multi-sort + priority labels + URL state (nuqs) + global filter | ✅ (verified: ?sort= round-trips, ?q= filters to 1 row) |
| 6 | WS hook: apply updates w/o full re-render + exponential backoff (max 5) | ✅ verified in console: 800ms row patches + backoff 1000→2000→4000→8000ms + recovery |
| 7 | Stale indicator (non-blocking banner) + final constraint sweep | ✅ (sweep PASS: no any / no UI lib / no useEffect-fetch; banner keeps table mounted) |

**Task 1 requirements 1–4: all implemented + browser-verified.** Remaining = demo aids + polish + Loom (see TODOs).

## Decisions & tradeoffs (the Loom/README gold)
| Decision | Why | Trade-off |
|---|---|---|
| **Schema-as-data** (rows = `{id, cells: Record<ColumnId, CellValue>}`), not concrete per-tenant types | Multi-tenant platforms store schema as data; one generic table renders any tenant; RBAC can reference column ids | Lose per-field static types; bought back safety with the closed `CellValue` union |
| **Branded ids** (`TenantId`/`ColumnId`/`RowId`) | Compiler rejects mixing the three string id kinds (real bug class) | Mild ceremony (`asTenantId(...)` at boundaries) |
| **`satisfies` over `as`** for mock config | Compiler validates config AND keeps literal types; `as` silently masked an `align:"center"` bug | None — strictly safer |
| **`noUncheckedIndexedAccess`** on | Forces handling missing RBAC role / missing cell instead of runtime crash | More guards to write |
| **`tenantId` in queryKey + `signal` in queryFn** | Switching key drops old observer → TanStack Query aborts the in-flight fetch natively (req. 1); no `useEffect`, no manual AbortController | Cancellation only fires if queryFn consumes `signal` — easy to forget |
| **No `keepPreviousData` on switch** | Showing tenant A's rows under tenant B breaks data isolation | Brief loading flash vs. a correctness/trust risk → correctness wins |
| **`gcTime` 5min (keep warm) / `staleTime` 60s / `retry` 1** | Liveness comes from the WS, not refetch; fast tenant switch-back from cache; low retry keeps cancellation clean | Memory holds visited tenants' rows; would evict aggressively at 50+ tenants |
| **Mock mirrors real `WebSocket` API + JSON-string frames** | Drop-in swap to a real socket; forces boundary parsing/validation like prod | More boilerplate; parse ceremony |
| **Unclean 1006 drop vs clean 1000 close** | Reconnect/backoff only on unclean drop, never on intentional client close | Slight protocol nuance |
| **Two repos (Analytics / Kanban)** | Two distinct deliverables + stacks (Kanban adds @dnd-kit) | Two repos to manage |

## Pending TODOs (clear before submit)
- [ ] Add explicit `@typescript-eslint/no-explicit-any: 'error'` to eslint config
- [ ] Decide stale-status (steer: derive from `status !== 'open'`)
- [ ] `placeholderData` confirming comment in `useTenantRows`
- [ ] `mockWebSocket.nextRowUpdate` + `parseServerMessage` bodies
- [ ] Remove `console.log` in `api.ts` before submit
- [ ] TenantSwitcher button polish (rounded/padding/transition)

## Debugging story (good Loom material)
- Symptom: "slow fetch", switch frozen, React Fast Refresh `Maximum call stack size exceeded`.
- Diagnosis: measured the DOM — **10,000 `<tr>` rendered**, scroll container `clientHeight === scrollHeight === 400040px`. Virtualization was dead.
- Root cause: a `flex items-center justify-center` wrapper removed the table's height constraint → `overflow-auto` never clamped → virtualizer saw a 400,000px viewport → rendered all rows; the huge fiber tree then overflowed Fast Refresh's recursive walk on save.
- Fix: drop the centering wrapper so the table's `flex-1 min-h-0 overflow-auto` is bounded by the `h-screen` column. Result: 33 DOM rows.
- Lesson: virtualization correctness depends on the SCROLL CONTAINER having a bounded height — verify with `clientHeight < scrollHeight`, not by eye.

## Loom talking points (5-min budget — full script later)
1. Architecture tour: feature-first folders, strict TS, no `any`.
2. **Headline:** tenant switch cancels in-flight request — show DevTools + abort log.
3. Schema-as-data + branded ids (30s).
4. One conscious tradeoff (pick: no-keepPreviousData for isolation, OR schema-as-data).
5. Virtualized 10k table + RBAC columns + URL state (when built).
