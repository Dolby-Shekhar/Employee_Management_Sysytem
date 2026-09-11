import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { listPayrolls, createPayroll, type Payroll } from '../services/payroll';
import { listEmployees } from '../services/employees';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const PayrollPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canGenerate = user?.role === 'admin' || user?.role === 'manager';

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);

  // Form inputs
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [baseSalary, setBaseSalary] = useState(6000);
  const [overtime, setOvertime] = useState(0);
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState(1000);

  const { data: payrollRes, isLoading } = useQuery({
    queryKey: ['payroll-list'],
    queryFn: () => listPayrolls(1, 100)
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['payroll-employees'],
    queryFn: () => listEmployees(1, 100)
  });

  const payrolls = payrollRes?.data ?? [];
  const employees = employeesRes?.data ?? [];
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.netPay || 0), 0);

  // Map employee details if not populated
  const employeeMap = new Map(employees.map((e) => [e._id, e]));

  // When selecting employee in modal, auto-populate monthly salary
  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employeeMap.get(empId);
    if (emp?.salary) {
      // Annual salary divided by 12 rounded to 2 decimals
      const monthly = Math.round((Number(emp.salary) / 12) * 100) / 100;
      setBaseSalary(monthly);
    }
  };

  const calculatedNet = baseSalary + overtime + bonuses - deductions;

  const generateMutation = useMutation({
    mutationFn: () =>
      createPayroll({
        employeeId: selectedEmpId || undefined,
        month: Number(month),
        year: Number(year),
        baseSalary: Number(baseSalary),
        overtime: Number(overtime),
        bonuses: Number(bonuses),
        deductions: Number(deductions)
      }),
    onSuccess: () => {
      toast.success('Payroll generated and recorded successfully');
      setShowGenerateModal(false);
      queryClient.invalidateQueries({ queryKey: ['payroll-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(payrolls, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payroll report downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              FINANCIAL OPERATIONS
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Payroll & Compensation</h1>
            <p className="mt-1 text-sm text-slate-400">
              Calculate wages, review payslips, disburse bonuses, and manage tax withholdings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              Export JSON
            </button>
            {canGenerate ? (
              <button
                type="button"
                onClick={() => {
                  if (employees.length > 0 && !selectedEmpId) {
                    handleEmployeeSelect(employees[0]._id);
                  }
                  setShowGenerateModal(true);
                }}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400"
              >
                + Generate Payroll
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Payroll Records</p>
          <p className="mt-2 text-3xl font-bold text-white">{isLoading ? '…' : payrolls.length}</p>
          <p className="mt-1 text-xs text-cyan-400">Archived cycles</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Net Disbursed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {isLoading ? '…' : `$${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="mt-1 text-xs text-emerald-300/70">Calculated net pay</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Roster Headcount</p>
          <p className="mt-2 text-3xl font-bold text-indigo-400">{employeesRes?.total ?? '…'}</p>
          <p className="mt-1 text-xs text-indigo-300/70">Eligible recipients</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Net Payout</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">
            {payrolls.length ? `$${(totalNet / payrolls.length).toFixed(0)}` : '$0'}
          </p>
          <p className="mt-1 text-xs text-cyan-200/70">Per employee period</p>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Compensation Ledger</h2>
          <span className="text-xs text-slate-400">Click any row to inspect payslip</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Pay Period</th>
                <th className="px-4 py-4">Base Salary</th>
                <th className="px-4 py-4">Overtime & Bonus</th>
                <th className="px-4 py-4">Deductions</th>
                <th className="px-4 py-4 font-bold text-emerald-400">Net Pay</th>
                <th className="px-5 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payrolls.map((p) => {
                const empName =
                  p.employeeId && typeof p.employeeId === 'object'
                    ? p.employeeId.name
                    : employeeMap.get(typeof p.employeeId === 'string' ? p.employeeId : '')?.name || 'Employee';
                const empDept =
                  p.employeeId && typeof p.employeeId === 'object'
                    ? p.employeeId.department
                    : employeeMap.get(typeof p.employeeId === 'string' ? p.employeeId : '')?.department;

                const base = Number(p.baseSalary || 0);
                const ot = Number(p.overtime || 0);
                const bonus = Number(p.bonuses || 0);
                const ded = Number(p.deductions || 0);
                const net = Number(p.netPay || 0);

                return (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedPayslip(p)}
                    className="cursor-pointer transition hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{empName}</p>
                      <p className="text-xs text-slate-400">{empDept || 'Engineering'}</p>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-300">
                      {p.month.toString().padStart(2, '0')}/{p.year}
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-300">${base.toLocaleString()}</td>

                    <td className="px-4 py-4 font-mono text-xs text-cyan-300">
                      +${(ot + bonus).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-rose-400">
                      -${ded.toLocaleString()}
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-emerald-400 text-base">
                      ${net.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayslip(p);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-cyan-400 transition hover:border-cyan-500 hover:text-white"
                      >
                        View Payslip
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && payrolls.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No payroll disbursements found in this cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Generate Payroll Payout</h2>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                generateMutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Employee</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.department || emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })} ({m})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base Monthly Salary ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Overtime Pay ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={overtime}
                    onChange={(e) => setOvertime(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Performance Bonus ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bonuses}
                    onChange={(e) => setBonuses(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Deductions / Tax ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Live Net Pay Preview */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-emerald-300">Projected Net Payout</p>
                <p className="mt-1 font-mono text-3xl font-bold text-emerald-400">
                  ${calculatedNet.toFixed(2)}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {generateMutation.isPending ? 'Processing…' : 'Issue Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Payslip Digital View Modal */}
      {selectedPayslip ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400">Official Payslip Voucher</p>
                <h2 className="text-xl font-bold text-white">
                  Period: {selectedPayslip.month}/{selectedPayslip.year}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-3 font-mono text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                <span>Base Salary:</span>
                <span className="text-white">${Number(selectedPayslip.baseSalary || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                <span>Overtime Compensation:</span>
                <span className="text-cyan-300">+${Number(selectedPayslip.overtime || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                <span>Performance Bonuses:</span>
                <span className="text-cyan-300">+${Number(selectedPayslip.bonuses || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                <span>Taxes & Deductions:</span>
                <span className="text-rose-400">-${Number(selectedPayslip.deductions || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-emerald-500/40 text-lg font-bold">
                <span className="text-emerald-300">Net Disbursed Pay:</span>
                <span className="text-emerald-400">${Number(selectedPayslip.netPay || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PayrollPage;
