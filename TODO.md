# Frontend-Backend Integration TODO

## Backend (already verified working)
- [x] Backend builds (fixed `ignoreDeprecations` typo)
- [x] Tests pass
- [x] Seed script (TS) works - admin/manager/employee
- [x] Live endpoints verified (health, login, employees)
- [x] Legacy JS backend cleanup
- [x] SMTP graceful degradation

## Frontend API layer
- [x] Create shared axios instance (`services/api.ts`) with JWT interceptor
- [x] Rewrite `services/auth.ts` to use axios
- [x] Create `services/employees.ts`
- [x] Create `services/attendance.ts`
- [x] Create `services/leaves.ts`
- [x] Create `services/payroll.ts`
- [x] Create `services/performance.ts`
- [x] Create `services/reports.ts`

## State & Pages
- [x] Create `context/AuthContext.tsx`
- [x] Rewrite `Layout.tsx` to use AuthContext
- [x] Update `App.tsx` to wrap with AuthProvider
- [x] Rewrite `OverviewPage.tsx` with live stats
- [x] Rewrite `AttendancePage.tsx` with clock in/out
- [x] Rewrite `PayrollPage.tsx` with live payroll
- [x] Rewrite `PerformancePage.tsx` with live reviews
- [x] Rewrite `ReportsPage.tsx` with live reports

## Verification
- [x] Frontend builds successfully
- [x] Live test login + data fetch

