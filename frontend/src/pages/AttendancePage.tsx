import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  clockIn,
  clockOut,
  getAttendanceStatus,
  listAttendance,
  type AttendanceRecord
} from '../services/attendance';
import { listEmployees } from '../services/employees';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AttendancePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [addressInput, setAddressInput] = useState('HQ Silicon Tower, Floor 8');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1. Fetch live status from backend
  const { data: statusData, isLoading: loadingStatus } = useQuery({
    queryKey: ['attendance-status'],
    queryFn: () => getAttendanceStatus()
  });

  const isClockedIn = Boolean(statusData?.clockedIn);
  const activeSession = statusData?.activeSession;

  // 2. Fetch attendance history
  const { data: historyRes, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: () => listAttendance(1, 50)
  });

  // 3. Fetch active team roster
  const { data: employeesRes } = useQuery({
    queryKey: ['attendance-employees'],
    queryFn: () => listEmployees(1, 100)
  });

  // Live timer for active session
  useEffect(() => {
    if (!isClockedIn || !activeSession?.clockIn) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(activeSession.clockIn).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, activeSession?.clockIn]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateDuration = (inTime?: string, outTime?: string | null) => {
    if (!inTime) return '—';
    const start = new Date(inTime).getTime();
    const end = outTime ? new Date(outTime).getTime() : Date.now();
    const diffMin = Math.floor((end - start) / (1000 * 60));
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}h ${m}m`;
  };

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: () => clockIn({ address: addressInput }),
    onSuccess: () => {
      toast.success('Successfully clocked in');
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: () => clockOut(),
    onSuccess: () => {
      toast.success('Successfully clocked out');
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const records = historyRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              TELEMETRY & TIMESHEETS
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Attendance Tracking</h1>
            <p className="mt-1 text-sm text-slate-400">
              Real-time work clock, presence validation, shift logs, and workforce punctuality.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isClockedIn ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isClockedIn ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              />
            </span>
            <span className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
              {loadingStatus ? 'Connecting…' : isClockedIn ? 'Clocked In Active' : 'Off Clock'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Clock Card & Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Clock Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Work Clock Session</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isClockedIn
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isClockedIn ? 'SESSION ACTIVE' : 'NO ACTIVE SESSION'}
            </span>
          </div>

          {/* Live Timer Display */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Elapsed Shift Time</p>
            <p className="mt-2 font-mono text-5xl font-extrabold tracking-wider text-cyan-400">
              {isClockedIn ? formatTimer(elapsedSeconds) : '00:00:00'}
            </p>
            {activeSession ? (
              <p className="mt-2 text-xs text-slate-400">
                Started today at{' '}
                <span className="font-semibold text-slate-200">
                  {new Date(activeSession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>{' '}
                from {activeSession.address || 'Assigned Location'}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Record your presence to initiate your shift timer.</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Station / Location</label>
            <input
              type="text"
              disabled={isClockedIn}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="e.g. Remote Office, Silicon HQ Floor 8"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 disabled:opacity-60"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={isClockedIn || clockInMutation.isPending || loadingStatus}
              onClick={() => clockInMutation.mutate()}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clockInMutation.isPending ? 'Logging In…' : 'Clock In Now'}
            </button>
            <button
              type="button"
              disabled={!isClockedIn || clockOutMutation.isPending || loadingStatus}
              onClick={() => clockOutMutation.mutate()}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 py-3 font-semibold text-slate-200 transition hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clockOutMutation.isPending ? 'Logging Out…' : 'Clock Out Session'}
            </button>
          </div>
        </div>

        {/* Telemetry Overview */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Telemetric Health & Compliance</h2>
            <p className="mt-1 text-xs text-slate-400">Shift adherence rules and punctuality thresholds.</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-sm text-slate-300">Daily Punctuality Window</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  Standard (Before 10:00 AM)
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-sm text-slate-300">Standard Work Shift</span>
                <span className="font-mono text-sm font-semibold text-cyan-400">8.0 Hours / Day</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-sm text-slate-300">Total Workforce Checked In</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {records.filter((r) => !r.clockOut).length} of {employeesRes?.total ?? 0} active now
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-xs font-semibold text-cyan-300">GPS Geofencing Active</p>
            <p className="mt-1 text-xs text-cyan-200/70">
              Station coordinates and IP-based geolocation telemetry are attached automatically to every shift filing.
            </p>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Attendance Log Registry</h2>
          <span className="text-xs text-slate-400">{records.length} records logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Clock In</th>
                <th className="px-4 py-3.5">Clock Out</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-5 py-3.5 text-right">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((rec: AttendanceRecord) => {
                const userName =
                  rec.user && typeof rec.user === 'object' ? rec.user.name : user?.name || 'Employee';
                const userEmail =
                  rec.user && typeof rec.user === 'object' ? rec.user.email : user?.email;
                const inDate = new Date(rec.clockIn);
                const outDate = rec.clockOut ? new Date(rec.clockOut) : null;
                const duration = calculateDuration(rec.clockIn, rec.clockOut);

                return (
                  <tr key={rec._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white">{userName}</p>
                      {userEmail ? <p className="text-xs text-slate-400">{userEmail}</p> : null}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                      {inDate.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-emerald-400">
                      {inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-rose-400">
                      {outDate
                        ? outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : 'Session in progress…'}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-cyan-400">
                      {duration}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                      {rec.address || 'Silicon HQ'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {rec.late ? (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            Late Arrival
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Punctual
                          </span>
                        )}
                        {rec.earlyLeave ? (
                          <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                            Early Exit
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loadingHistory && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No attendance records found yet.
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

export default AttendancePage;
