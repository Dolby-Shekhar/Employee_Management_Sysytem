const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Employee workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
          </div>
          <button
            onClick={() => localStorage.removeItem('token')}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-400">Attendance</p>
            <p className="mt-2 text-2xl font-semibold">On track</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-400">Leave balance</p>
            <p className="mt-2 text-2xl font-semibold">12 days</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm text-slate-400">Payroll</p>
            <p className="mt-2 text-2xl font-semibold">Updated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
