import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        await register(name, email, password, role);
        if (role === 'employee') {
          setSuccessMsg('Account registered! Employee accounts require Admin approval before signing in.');
          setMode('login');
          setEmail(email);
          setPassword('');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-[140px]" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            ENTERPRISE MANAGEMENT OS
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Sign in to Console' : 'Create an Account'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' ? 'Access your workforce operations dashboard' : 'Join your organization workforce portal'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="mb-6 flex rounded-xl bg-slate-950/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition ${
              mode === 'login' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition ${
              mode === 'register' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {successMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' ? (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {mode === 'register' ? (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'employee')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
              >
                <option value="employee">Employee (Requires Admin approval)</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Processing…' : mode === 'login' ? 'Sign In to Workspace' : 'Submit Registration'}
          </button>
        </form>

        {/* 1-Click Fast Demo Logins */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-400">
            Instant Demo Logins
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickLogin('admin@company.com', 'admin123')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/60 p-2.5 text-center transition hover:border-cyan-500/60 hover:bg-slate-800 disabled:opacity-50"
            >
              <span className="text-xs font-bold text-cyan-400">Admin</span>
              <span className="mt-0.5 text-[10px] text-slate-400">Full Access</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickLogin('manager@company.com', 'manager123')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/60 p-2.5 text-center transition hover:border-indigo-500/60 hover:bg-slate-800 disabled:opacity-50"
            >
              <span className="text-xs font-bold text-indigo-400">Manager</span>
              <span className="mt-0.5 text-[10px] text-slate-400">Team Ops</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickLogin('employee@company.com', 'employee123')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/60 p-2.5 text-center transition hover:border-emerald-500/60 hover:bg-slate-800 disabled:opacity-50"
            >
              <span className="text-xs font-bold text-emerald-400">Employee</span>
              <span className="mt-0.5 text-[10px] text-slate-400">Portal View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
