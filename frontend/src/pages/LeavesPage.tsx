import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { listLeaves, createLeave, approveLeave, type Leave } from '../services/leaves';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const LeavesPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canApprove = user?.role === 'admin' || user?.role === 'manager';

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [commentModalLeave, setCommentModalLeave] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [managerComment, setManagerComment] = useState('');

  // Request form state
  const [leaveType, setLeaveType] = useState<Leave['leaveType']>('Annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [reason, setReason] = useState('');

  const { data: leavesRes, isLoading } = useQuery({
    queryKey: ['leaves-list'],
    queryFn: () => listLeaves(1, 100)
  });

  const allLeaves = leavesRes?.data ?? [];

  const filteredLeaves = allLeaves.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const requestMutation = useMutation({
    mutationFn: () =>
      createLeave({
        leaveType,
        startDate,
        endDate,
        reason
      }),
    onSuccess: () => {
      toast.success('Leave request submitted successfully');
      setShowRequestModal(false);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['leaves-list'] });
      queryClient.invalidateQueries({ queryKey: ['overview-leaves'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: 'approved' | 'rejected'; comment?: string }) =>
      approveLeave(id, status, comment),
    onSuccess: (_, vars) => {
      toast.success(`Leave request ${vars.status}`);
      setCommentModalLeave(null);
      setManagerComment('');
      queryClient.invalidateQueries({ queryKey: ['leaves-list'] });
      queryClient.invalidateQueries({ queryKey: ['overview-leaves'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const pendingCount = allLeaves.filter((l) => l.status === 'pending').length;
  const approvedCount = allLeaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = allLeaves.filter((l) => l.status === 'rejected').length;

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              TIME-OFF & ABSENCE
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Leave Governance</h1>
            <p className="mt-1 text-sm text-slate-400">
              Request personal leave, manage team vacations, and review time-off applications.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400 sm:self-auto"
          >
            <span className="text-base font-bold">+</span>
            Request Time Off
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Filings</p>
          <p className="mt-2 text-3xl font-bold text-white">{isLoading ? '…' : allLeaves.length}</p>
          <p className="mt-1 text-xs text-cyan-400">Across current cycle</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{isLoading ? '…' : pendingCount}</p>
          <p className="mt-1 text-xs text-amber-300/70">{pendingCount > 0 ? 'Awaiting signoff' : 'All caught up'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Approved Leaves</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{isLoading ? '…' : approvedCount}</p>
          <p className="mt-1 text-xs text-emerald-300/70">Confirmed absences</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Declined / Closed</p>
          <p className="mt-2 text-3xl font-bold text-rose-400">{isLoading ? '…' : rejectedCount}</p>
          <p className="mt-1 text-xs text-rose-300/70">Unapproved filings</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              statusFilter === tab
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Leaves Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Timeline</th>
                <th className="px-4 py-4">Reason & Notes</th>
                <th className="px-4 py-4">Status</th>
                {canApprove ? <th className="px-5 py-4 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeaves.map((leave) => {
                const empName =
                  leave.employeeId && typeof leave.employeeId === 'object'
                    ? leave.employeeId.name
                    : 'Current User';
                const empEmail =
                  leave.employeeId && typeof leave.employeeId === 'object'
                    ? leave.employeeId.email
                    : '';
                const days = calculateDays(leave.startDate, leave.endDate);

                return (
                  <tr key={leave._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{empName}</p>
                      {empEmail ? <p className="text-xs text-slate-400">{empEmail}</p> : null}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          leave.leaveType === 'Annual'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : leave.leaveType === 'Sick'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : leave.leaveType === 'Casual'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {leave.leaveType}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-300">
                      <p className="font-mono">
                        {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 mt-0.5">{days} day{days > 1 ? 's' : ''}</p>
                    </td>

                    <td className="px-4 py-4 text-xs max-w-xs">
                      <p className="text-slate-200">{leave.reason}</p>
                      {leave.managerComment ? (
                        <p className="mt-1 text-[11px] text-cyan-400 italic">
                          Manager: {leave.managerComment}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          leave.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : leave.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            leave.status === 'approved'
                              ? 'bg-emerald-400'
                              : leave.status === 'rejected'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                        />
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>

                    {canApprove ? (
                      <td className="px-5 py-4 text-right">
                        {leave.status === 'pending' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCommentModalLeave({ id: leave._id, action: 'approved' })}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setCommentModalLeave({ id: leave._id, action: 'rejected' })}
                              className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}

              {!isLoading && filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={canApprove ? 6 : 5} className="px-5 py-12 text-center text-slate-500">
                    No leave requests found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showRequestModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Request Time Off</h2>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                requestMutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as Leave['leaveType'])}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                >
                  <option value="Annual">Annual / Vacation</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Request</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for your manager…"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {requestMutation.isPending ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Decision Comment Modal */}
      {commentModalLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {commentModalLeave.action === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              You can optionally include a note or instruction for the employee.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Manager Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="e.g. Approved, please ensure client handover."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCommentModalLeave(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={decisionMutation.isPending}
                onClick={() =>
                  decisionMutation.mutate({
                    id: commentModalLeave.id,
                    status: commentModalLeave.action,
                    comment: managerComment
                  })
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 transition ${
                  commentModalLeave.action === 'approved'
                    ? 'bg-emerald-400 hover:bg-emerald-300'
                    : 'bg-rose-400 hover:bg-rose-300'
                }`}
              >
                {decisionMutation.isPending
                  ? 'Saving…'
                  : `Confirm ${commentModalLeave.action === 'approved' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeavesPage;
