import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listEmployees } from '../services/employees';
import { listLeaves } from '../services/leaves';
import { listPayrolls } from '../services/payroll';
import { getAttendanceStatus } from '../services/attendance';
import { useAuth } from '../context/AuthContext';

const OverviewPage = () => {
  const { user } = useAuth();

  const { data: employeesRes, isLoading: loadingEmployees } = useQuery({
    queryKey: ['overview-employees'],
    queryFn: () => listEmployees(1, 100)
  });

  const { data: leavesRes, isLoading: loadingLeaves } = useQuery({
    queryKey: ['overview-leaves'],
    queryFn: () => listLeaves(1, 100)
  });

  const { data: payrollRes, isLoading: loadingPayroll } = useQuery({
    queryKey: ['overview-payroll'],
    queryFn: () => listPayrolls(1, 100)
  });

  const { data: attendanceStatus } = useQuery({
    queryKey: ['overview-attendance-status'],
    queryFn: () => getAttendanceStatus()
  });

  const totalEmployees = employeesRes?.total ?? 0;
  const pendingLeaves = (leavesRes?.data ?? []).filter((l) => l.status === 'pending').length;
  const totalPayroll = (payrollRes?.data ?? []).reduce((sum, p) => sum + Number(p.netPay || 0), 0);
  const isClockedIn = Boolean(attendanceStatus?.clockedIn);

  const stats = [
    {
      label: 'Active Workforce',
      value: loadingEmployees ? '…' : String(totalEmployees),
      trend: `${(employeesRes?.data ?? []).filter((e) => e.status === 'approved').length} approved personnel`,
      color: 'text-cyan-400'
    },
    {
      label: 'Pending Leave Approvals',
      value: loadingLeaves ? '…' : String(pendingLeaves),
      trend: pendingLeaves > 0 ? `${pendingLeaves} requiring review` : 'All cleared',
      color: pendingLeaves > 0 ? 'text-amber-400' : 'text-emerald-400'
    },
    {
      label: 'Payroll Net (Cycle)',
      value: loadingPayroll ? '…' : `$${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      trend: `${(payrollRes?.data ?? []).length} active disbursements`,
      color: 'text-emerald-400'
    },
    {
      label: 'Shift Status',
      value: isClockedIn ? 'Clocked In' : 'Off Clock',
      trend: isClockedIn ? 'Active shift timer running' : 'Ready to begin session',
      color: isClockedIn ? 'text-emerald-400' : 'text-slate-400'
    }
  ];

  const recentLeaves = (leavesRes?.data ?? []).slice(0, 5);

  const quickLinks = [
    { label: 'Workforce Roster', desc: 'Browse and manage employee records', to: '/employees', icon: '👥' },
    { label: 'Time-Off Approvals', desc: 'Review and approve leave filings', to: '/leaves', icon: '📅' },
    { label: 'Attendance Telemetry', desc: 'Clock in, check hours, and review logs', to: '/attendance', icon: '⏱️' },
    { label: 'Payroll Operations', desc: 'Calculate payouts and review payslips', to: '/payroll', icon: '💳' },
    { label: 'Performance Reviews', desc: 'Log evaluations and quarterly appraisals', to: '/performance', icon: '📈' },
    { label: 'Incident Reports', desc: 'File reports and review audit feed', to: '/reports', icon: '📄' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 p-7 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              OPERATIONAL COMMAND CENTER
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {user?.name ?? 'Commander'}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              EMS Enterprise Console is online. Live synchronization with MongoDB backend and telemetry services.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400">Security Clearance</span>
              <p className="mt-0.5 font-bold uppercase text-cyan-400 text-sm">{user?.role || 'Employee'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition hover:border-slate-700"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="mt-2 text-xs text-slate-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Matrix */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Quick Access Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-md backdrop-blur-sm transition hover:border-cyan-500/50 hover:bg-slate-900/90"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl p-2 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500/20 transition">
                  {link.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition">
                    {link.label}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Team Roster Preview & Recent Leave Requests */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Team Roster Snapshot */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Workforce Roster</h2>
              <p className="text-xs text-slate-400">Recently onboarded and active team members</p>
            </div>
            <Link
              to="/employees"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:border-cyan-500 hover:text-white transition"
            >
              View All ({totalEmployees})
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(employeesRes?.data ?? []).slice(0, 5).map((emp) => (
              <div
                key={emp._id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-cyan-500/15 border border-cyan-500/30 font-bold text-cyan-400 flex items-center justify-center text-xs">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{emp.name}</p>
                    <p className="text-xs text-slate-400">
                      {emp.position || emp.department || 'Staff Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                    {emp.department || 'General'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      emp.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}

            {!loadingEmployees && (employeesRes?.data ?? []).length === 0 && (
              <p className="text-sm text-slate-500 py-6 text-center">No employee records in system.</p>
            )}
          </div>
        </div>

        {/* Leave Requests Snapshot */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Time-Off Pipeline</h2>
              <p className="text-xs text-slate-400">Latest absence filings</p>
            </div>
            <Link
              to="/leaves"
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:border-cyan-500 hover:text-white transition"
            >
              Manage
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentLeaves.map((leave) => {
              const empName =
                leave.employeeId && typeof leave.employeeId === 'object'
                  ? leave.employeeId.name
                  : 'Team Member';

              return (
                <div
                  key={leave._id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{empName}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        leave.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : leave.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>{leave.leaveType} Leave</span>
                    <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-1 italic">"{leave.reason}"</p>
                </div>
              );
            })}

            {!loadingLeaves && recentLeaves.length === 0 && (
              <p className="text-sm text-slate-500 py-6 text-center">No time-off requests registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
