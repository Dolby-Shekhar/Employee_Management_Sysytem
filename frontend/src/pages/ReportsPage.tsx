import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { listReports, createReport, respondToReport, type Report } from '../services/reports';
import { listEmployees } from '../services/employees';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReportsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canRespond = user?.role === 'admin' || user?.role === 'manager';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Manager response modal state
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ['reports-list'],
    queryFn: () => listReports(1, 100)
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['reports-employees'],
    queryFn: () => listEmployees(1, 100)
  });

  const reports = reportsRes?.data ?? [];
  const employees = employeesRes?.data ?? [];
  const employeeMap = new Map(employees.map((e) => [e._id, e]));

  const createMutation = useMutation({
    mutationFn: () => createReport({ title, content }),
    onSuccess: () => {
      toast.success('Report filed and submitted to management');
      setTitle('');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['reports-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const respondMutation = useMutation({
    mutationFn: () => respondToReport(activeReport!._id, responseText),
    onSuccess: () => {
      toast.success('Response logged successfully');
      setActiveReport(null);
      setResponseText('');
      queryClient.invalidateQueries({ queryKey: ['reports-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              AUDIT TRAIL & LOGS
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Incident & Progress Reports</h1>
            <p className="mt-1 text-sm text-slate-400">
              File operational summaries, report system blockers, and receive leadership feedback.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-cyan-300">Total Filings</p>
            <p className="mt-0.5 font-mono text-2xl font-bold text-white">{reports.length}</p>
          </div>
        </div>
      </div>

      {/* Submit Report Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm shadow-xl">
        <h2 className="text-lg font-bold text-white">File an Operational Report</h2>
        <p className="mt-1 text-xs text-slate-400">
          Document sprint outcomes, critical incident postmortems, or weekly status updates.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Report Subject / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Infrastructure Migration Summary"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Detailed Narrative & Findings
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detail key metrics, completed objectives, risks, or next steps…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Filing Report…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Reports Audit Feed */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Report Feed & Audit History</h2>
          <span className="text-xs text-slate-400">{reports.length} reports logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Filer / Author</th>
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Content Summary</th>
                <th className="px-4 py-4">Leadership Feedback</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((r) => {
                const authorName =
                  r.createdBy && typeof r.createdBy === 'object'
                    ? r.createdBy.name
                    : employeeMap.get(typeof r.createdBy === 'string' ? r.createdBy : '')?.name || 'Staff Member';

                return (
                  <tr key={r._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{authorName}</p>
                      <p className="text-[11px] text-slate-400">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-cyan-300 max-w-xs">{r.title}</td>

                    <td className="px-4 py-4 text-xs text-slate-300 max-w-sm">
                      <p className="line-clamp-2">{r.content}</p>
                    </td>

                    <td className="px-4 py-4 text-xs max-w-xs">
                      {r.managerResponse ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
                          <p className="font-semibold text-[11px] text-emerald-400">Management Note:</p>
                          <p className="mt-0.5 line-clamp-2">{r.managerResponse}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Awaiting response</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {canRespond ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReport(r);
                            setResponseText(r.managerResponse || '');
                          }}
                          className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-cyan-400 transition hover:border-cyan-500 hover:text-white"
                        >
                          {r.managerResponse ? 'Edit Note' : 'Respond'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!isLoading && reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No reports submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leadership Response Modal */}
      {activeReport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400">Management Response</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeReport.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Executive / Manager Feedback
              </label>
              <textarea
                rows={4}
                required
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide instructions, acknowledgement, or approval remarks…"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={respondMutation.isPending || !responseText.trim()}
                onClick={() => respondMutation.mutate()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
              >
                {respondMutation.isPending ? 'Submitting…' : 'Save Response'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
