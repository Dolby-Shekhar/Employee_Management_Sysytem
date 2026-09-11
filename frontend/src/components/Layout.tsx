import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/profile';
import { getErrorMessage } from '../services/api';

const navItems = [
  { label: 'Overview', to: '/', icon: '⊞' },
  { label: 'Employees', to: '/employees', icon: '👥' },
  { label: 'Leaves', to: '/leaves', icon: '📅' },
  { label: 'Attendance', to: '/attendance', icon: '⏱' },
  { label: 'Payroll', to: '/payroll', icon: '💳' },
  { label: 'Performance', to: '/performance', icon: '📈' },
  { label: 'Reports', to: '/reports', icon: '📄' }
];

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [profileSalary, setProfileSalary] = useState<number | null>(null);

  const handleOpenProfile = async () => {
    setShowProfileModal(true);
    setProfileLoading(true);
    try {
      const data = await getProfile();
      setEditName(data.user?.name || user?.name || '');
      setEditDept(data.employee?.department || '');
      setEditPosition(data.employee?.position || '');
      setProfileSalary(data.employee?.salary ?? null);
    } catch {
      setEditName(user?.name || '');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: editName,
        department: editDept,
        position: editPosition
      });
      await refreshUser();
      toast.success('Profile updated successfully');
      setShowProfileModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">
      {/* Mobile Topbar */}
      <header className="flex lg:hidden items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-slate-950 text-xs">
            EMS
          </div>
          <span className="font-bold tracking-tight text-white text-sm">Enterprise Console</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white transition transform duration-200 hover:scale-105"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            const html = document.documentElement;
            html.classList.toggle('dark');
          }}
          className="ml-2 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white"
          aria-label="Toggle dark mode"
        >
          🌙
        </button>
      </header>

      <div className="mx-auto flex flex-1 w-full max-w-7xl flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block w-full border-b border-slate-800 bg-slate-900/60 p-5 lg:w-64 lg:border-b-0 lg:border-r backdrop-blur-md shrink-0`}
        >
          {/* Brand */}
          <div className="mb-6 hidden lg:block">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shadow-cyan-500/20">
                EMS
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">COMMAND OS</p>
                <h2 className="text-base font-bold text-white leading-tight">Enterprise Console</h2>
              </div>
            </div>
          </div>

          {/* User Profile Mini Badge */}
          {user ? (
            <button
              type="button"
              onClick={handleOpenProfile}
              className="w-full text-left mb-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 transition transform duration-200 hover:scale-105 hover:border-cyan-500/50 hover:bg-slate-950 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-xs group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-400 transition">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
                    {user.role}
                  </p>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-300">⚙</span>
              </div>
            </button>
          ) : null}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition transform duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* System Health */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System Gateway</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">API Health</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-400">Database</span>
              <span className="text-[11px] font-mono text-cyan-400">Atlas Live</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2 text-xs font-semibold text-slate-400 transition transform duration-200 hover:scale-105 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
          >
            Sign Out
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* User Profile Modal */}
      {showProfileModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400">User Identity</p>
                <h2 className="text-lg font-bold text-white">Personnel Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {profileLoading ? (
              <div className="py-12 text-center text-xs text-cyan-400 uppercase tracking-widest animate-pulse">
                Fetching profile data…
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Position</label>
                    <input
                      type="text"
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      placeholder="e.g. Senior Engineer"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-bold uppercase text-cyan-400">{user?.role}</span>
                  </div>
                  {profileSalary !== null ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered Salary:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        ${profileSalary.toLocaleString()}/yr
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transform duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transform duration-200 hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Layout;
