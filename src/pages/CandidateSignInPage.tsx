import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CandidateSignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.login({ mobile, password } as any);
      api.setToken(res.token);
      await refreshUserData();
      navigate('/manpower/applications');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          Candidate Sign In
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Access Candidate Portal</h1>
        <p className="mt-1 text-sm text-slate-500">Use your mobile number as username.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Mobile Number</span>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
          </div>
        </label>
        <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Password</span>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
          </div>
        </label>
        <button disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-60">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
