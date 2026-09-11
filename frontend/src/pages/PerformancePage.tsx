import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { listReviews, createReview } from '../services/performance';
import { listEmployees } from '../services/employees';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PerformancePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canReview = user?.role === 'admin' || user?.role === 'manager';

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('2026-Q1');
  const [rating, setRating] = useState(4);
  const [comments, setComments] = useState('');

  const { data: reviewsRes, isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => listReviews(1, 100)
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['performance-employees'],
    queryFn: () => listEmployees(1, 100)
  });

  const reviews = reviewsRes?.data ?? [];
  const employees = employeesRes?.data ?? [];
  const employeeMap = new Map(employees.map((e) => [e._id, e]));

  const createMutation = useMutation({
    mutationFn: () =>
      createReview({
        employeeId: selectedEmpId || undefined,
        reviewPeriod,
        rating,
        comments
      }),
    onSuccess: () => {
      toast.success('Performance review recorded');
      setComments('');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  const ratingDescriptions: Record<number, string> = {
    1: '1 - Unsatisfactory (Urgent Improvement Required)',
    2: '2 - Needs Development (Partial Goal Achievement)',
    3: '3 - Competent (Consistently Meets Expectations)',
    4: '4 - Exceeds Expectations (High Impact Output)',
    5: '5 - Outstanding (Role Model & Strategic Leadership)'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              GROWTH & APPRAISALS
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Performance Intelligence</h1>
            <p className="mt-1 text-sm text-slate-400">
              Track talent milestones, quarter-over-quarter ratings, and management feedback loops.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-cyan-300">Cohort Average</p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-white">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Appraisals</p>
          <p className="mt-2 text-3xl font-bold text-white">{isLoading ? '…' : reviews.length}</p>
          <p className="mt-1 text-xs text-cyan-400">All archived reviews</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Rating</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{avgRating}</p>
          <p className="mt-1 text-xs text-emerald-300/70">5-point scale</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Top Performers</p>
          <p className="mt-2 text-3xl font-bold text-indigo-400">
            {reviews.filter((r) => r.rating >= 4).length}
          </p>
          <p className="mt-1 text-xs text-indigo-300/70">Rated 4.0 or above</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Employees Evaluated</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">
            {new Set(reviews.map((r) => (typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId))).size}
          </p>
          <p className="mt-1 text-xs text-cyan-200/70">Unique personnel</p>
        </div>
      </div>

      {/* Log Review Form (Visible for Admin & Manager) */}
      {canReview ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm shadow-xl">
          <h2 className="text-lg font-bold text-white">Record Performance Appraisal</h2>
          <p className="mt-1 text-xs text-slate-400">
            Select a workforce member and input quantitative ratings and qualitative coaching.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Employee</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.position || emp.department || emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Appraisal Period</label>
              <input
                type="text"
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                placeholder="e.g. 2026-Q1 or Annual 2026"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Rating: {rating} / 5</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {ratingDescriptions[n]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Coaching Notes & Milestone Evaluation
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Highlight technical contributions, collaboration, velocity, and focus areas for next quarter…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                if (!selectedEmpId) {
                  toast.error('Please select an employee');
                  return;
                }
                createMutation.mutate();
              }}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Saving Review…' : 'Submit Appraisal'}
            </button>
          </div>
        </div>
      ) : null}

      {/* Reviews Table / Cards */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Appraisal History</h2>
          <span className="text-xs text-slate-400">{reviews.length} evaluations recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Period</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-4 py-4">Feedback & Notes</th>
                <th className="px-4 py-4">Evaluator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reviews.map((r) => {
                const empName =
                  r.employeeId && typeof r.employeeId === 'object'
                    ? r.employeeId.name
                    : employeeMap.get(typeof r.employeeId === 'string' ? r.employeeId : '')?.name || 'Employee';
                const empPosition =
                  r.employeeId && typeof r.employeeId === 'object'
                    ? r.employeeId.position
                    : employeeMap.get(typeof r.employeeId === 'string' ? r.employeeId : '')?.position;

                const evaluator =
                  r.managerId && typeof r.managerId === 'object' ? r.managerId.name : 'Engineering Lead';

                return (
                  <tr key={r._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{empName}</p>
                      <p className="text-xs text-slate-400">{empPosition || 'Engineering'}</p>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-300">{r.reviewPeriod}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            r.rating >= 4
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.rating === 3
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          ★ {r.rating}.0
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-300 max-w-md">
                      <p className="line-clamp-2">{r.comments || 'No written coaching notes.'}</p>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">{evaluator}</td>
                  </tr>
                );
              })}

              {!isLoading && reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No performance evaluations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
