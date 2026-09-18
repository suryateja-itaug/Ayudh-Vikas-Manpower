import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const demoCredentialDefaults: Record<string, string> = {
  usr_admin_01: 'Admin@123',
  usr_hr_01: 'Hr@12345',
  usr_ops_01: 'Ops@12345',
  usr_staff_01: 'Staff@123',
  usr_emp_01: 'Employee@123',
  usr_cand_01: 'Candidate@123',
  usr_cand_02: 'Candidate@123',
};

const routeForRole = (role: string) => {
  if (role === 'staff') return '/manpower/staff';
  if (role === 'employee') return '/manpower/employee/dashboard';
  if (['admin', 'hr_admin', 'ops_admin', 'director_admin'].includes(role)) return '/manpower/admin';
  return '/manpower/applications';
};

export const CandidateSignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAvailableUsers()
      .then(res => setDemoUsers((res.users || []).map((user: any) => ({
        ...user,
        username: user.username || user.mobile || user.email,
        password: user.password || demoCredentialDefaults[user.id] || '',
      }))))
      .catch(() => setDemoUsers([]));
  }, []);

  const fillDemo = (user: any) => {
    setUsername(user.username || user.mobile || user.email);
    setPassword(user.password || '');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.login({ username, password });
      api.setToken(res.token);
      await refreshUserData();
      navigate(routeForRole(res.user.role));
    } catch (err: any) {
      const loginId = username.trim().toLowerCase();
      const demoUser = demoUsers.find(user =>
        String(user.username || '').toLowerCase() === loginId ||
        String(user.email || '').toLowerCase() === loginId ||
        String(user.mobile || '') === username.trim()
      );

      if (demoUser && demoUser.password === password) {
        api.setToken(demoUser.id);
        await refreshUserData();
        navigate(routeForRole(demoUser.role));
        return;
      }

      setError(err.message || 'Unable to sign in with these credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 pb-16">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            Common Portal Login
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Sign in to Ayudh Vikas Manpower</h1>
          <p className="mt-1 text-sm text-slate-500">Use the same login form for candidate, employee, staff, and admin access.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
            <span>Username / Mobile / Email</span>
            <div className="relative">
              <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                placeholder="mobile number or email"
                required
              />
            </div>
          </label>
          <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
            <span>Password</span>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                required
              />
            </div>
          </label>
          <button disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Demo Credentials</h2>
          <p className="text-xs text-slate-500 mt-1">Click a row to fill the login form.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoUsers.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => fillDemo(user)}
              className="text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 p-3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs">{user.name}</span>
                <span className="text-[10px] uppercase font-bold rounded bg-white border border-slate-200 px-1.5 py-0.5 text-slate-600">
                  {String(user.role).replace('_', ' ')}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                <div><span className="font-bold text-slate-700">User:</span> {user.username || user.mobile || user.email}</div>
                <div><span className="font-bold text-slate-700">Pass:</span> {user.password}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
