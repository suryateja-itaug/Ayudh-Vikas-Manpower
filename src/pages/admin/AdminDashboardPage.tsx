import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  BellRing,
  Award,
  UserPlus,
  FileCheck2,
  ClipboardList,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'staff' as Exclude<UserRole, 'candidate'>,
    password: 'Password@123',
    department: 'Operations',
    designation: 'Operations Associate',
    basicSalary: 18000,
  });

  useEffect(() => {
    setLoading(true);
    api.getAdminStats()
      .then(res => setStats(res))
      .catch(err => console.error('Failed to load admin dashboard stats:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const appTrendData = [
    { month: 'Apr', av: 45, partner: 30 },
    { month: 'May', av: 62, partner: 48 },
    { month: 'Jun', av: 80, partner: 65 },
    { month: 'Jul', av: 95, partner: 82 },
    { month: 'Aug', av: 110, partner: 94 },
    { month: 'Sep', av: 127, partner: 108 },
  ];

  const qualificationData = [
    { name: '10th / SSC', value: 35, color: '#84cc16' },
    { name: '12th / Inter', value: 40, color: '#14b8a6' },
    { name: 'Graduates', value: 65, color: '#10b981' },
    { name: 'B.Tech / MCA', value: 25, color: '#047857' },
  ];

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMessage(null);
    if (accountForm.password.length < 8 || !/[A-Z]/.test(accountForm.password) || !/[0-9]/.test(accountForm.password)) {
      setAccountMessage({ type: 'error', text: 'Password must be at least 8 characters with one uppercase letter and one number.' });
      return;
    }
    try {
      setAccountSaving(true);
      const res = await api.createPortalAccount(accountForm);
      setAccountMessage({ type: 'success', text: `${res.user.name} created as ${res.user.role.replace('_', ' ')}. They can log in with ${res.user.email}.` });
      setAccountForm(prev => ({
        ...prev,
        name: '',
        email: '',
        mobile: '',
        password: 'Password@123',
      }));
    } catch (err: any) {
      setAccountMessage({ type: 'error', text: err.message || 'Failed to create account.' });
    } finally {
      setAccountSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Recruitment & Duty Control Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ayudh Vikas Foundation central governance for vacancy lifecycle, candidate pooling, 3-level confirmations, and workforce operations.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-2">
          <Link
            to="/manpower/admin/approvals"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>3-Level Approvals Queue</span>
          </Link>
          <Link
            to="/manpower/admin/jobs"
            className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Jobs</span>
          </Link>
        </div>
      </div>

      {/* REOPENED VACANCY APPLICANT RECALL NOTICE */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 text-white shadow-lg shadow-emerald-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Automated Applicant Recall Engine
            </span>
            <h3 className="font-bold text-base">Vacancy Reopened: Security / Facility Staff (127 Applicants)</h3>
            <p className="text-xs text-emerald-50">
              When closed vacancies reopen, the system preserves past candidate dossiers and enables 1-click notification broadcasts.
            </p>
          </div>
        </div>

        <Link
          to="/manpower/admin/jobs"
          className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md shrink-0 text-center transition-all hover:scale-105"
        >
          Review & Notify Applicants →
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Open AV Jobs</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {stats?.kpis?.openAvJobs ?? 6}
          </div>
          <span className="text-[10px] text-slate-400">Ayudh Vikas roles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Open Partner Jobs</span>
          <div className="text-2xl font-extrabold text-teal-600">
            {stats?.kpis?.openAllJobs ?? 5}
          </div>
          <span className="text-[10px] text-slate-400">Corporate openings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Candidates (Rs.10)</span>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats?.kpis?.totalCandidates ?? 129}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Rs.{(stats?.kpis?.registrationRevenue ?? 1290).toLocaleString()} Verified
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">3-Level Queue</span>
          <div className="text-2xl font-extrabold text-lime-700">
            {stats?.kpis?.pendingApprovals ?? 1}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Confirmed Employees</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {stats?.kpis?.confirmedEmployees ?? 1}
          </div>
          <span className="text-[10px] text-slate-400">On active duty</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Open Grievances</span>
          <div className="text-2xl font-extrabold text-rose-600">
            {stats?.kpis?.openComplaints ?? 1}
          </div>
          <span className="text-[10px] text-slate-400">In redressal</span>
        </div>
      </div>

      {/* Recharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Recruitment Volume (AV vs Partner Jobs)</h3>
              <p className="text-xs text-slate-400">Application intake trends across employment categories</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span className="text-slate-600">AV Jobs</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded bg-teal-600"></span>
                <span className="text-slate-600">Partner Jobs</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="av" fill="#10b981" radius={[6, 6, 0, 0]} name="AV Jobs" />
                <Bar dataKey="partner" fill="#0d9488" radius={[6, 6, 0, 0]} name="Partner Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Pool Qualification Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Candidate Pool Qualifications</h3>
            <p className="text-xs text-slate-400">Academic distribution of enrolled talent</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {qualificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {qualificationData.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <ActionWidget
          to="/manpower/admin/av-applications"
          icon={<ClipboardList className="w-5 h-5" />}
          label="Staff Reviews"
          value={stats?.kpis?.pendingStaffReviews ?? 0}
          tone="emerald"
          text="AV profiles pending first review"
        />
        <ActionWidget
          to="/manpower/admin/av-applications"
          icon={<FileCheck2 className="w-5 h-5" />}
          label="Document Issues"
          value={stats?.kpis?.documentMissingCount ?? 0}
          tone="amber"
          text="Missing or correction-needed IDs"
        />
        <ActionWidget
          to="/manpower/admin/pipeline"
          icon={<Briefcase className="w-5 h-5" />}
          label="Interviews"
          value={stats?.kpis?.pendingInterviews ?? 0}
          tone="blue"
          text="Candidates in interview stage"
        />
        <ActionWidget
          to="/manpower/admin/attendance"
          icon={<Clock className="w-5 h-5" />}
          label="On Duty"
          value={stats?.kpis?.currentlyOnDuty ?? 0}
          tone="slate"
          text="Employees currently working"
        />
        <ActionWidget
          to="/manpower/staff/walk-in"
          icon={<UserPlus className="w-5 h-5" />}
          label="Walk-ins Today"
          value={stats?.kpis?.todayWalkIns ?? 0}
          tone="lime"
          text="Cash-paid walk-in registrations"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
              <UserPlus className="w-4 h-4" />
              Portal account creation
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-950">Create Any Non-Candidate Portal Account</h2>
            <p className="mt-1 text-xs text-slate-500">Created users can sign in from the common login screen with the email and password set here.</p>
          </div>
          {accountMessage && (
            <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-start gap-2 max-w-xl ${
              accountMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {accountMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{accountMessage.text}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleAccountSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          <AdminField label="Full Name" value={accountForm.name} onChange={value => setAccountForm(prev => ({ ...prev, name: value }))} required />
          <AdminField label="Email / Username" type="email" value={accountForm.email} onChange={value => setAccountForm(prev => ({ ...prev, email: value }))} required />
          <AdminField label="Mobile" value={accountForm.mobile} onChange={value => setAccountForm(prev => ({ ...prev, mobile: value }))} required />
          <label className="block space-y-1.5 font-semibold text-slate-700">
            <span>Role</span>
            <select
              value={accountForm.role}
              onChange={e => setAccountForm(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
            >
              <option value="admin">Admin</option>
              <option value="director_admin">Director Admin</option>
              <option value="hr_admin">HR Admin</option>
              <option value="ops_admin">Ops Admin</option>
              <option value="staff">Staff</option>
              <option value="employee">Employee</option>
            </select>
          </label>
          <AdminField label="Password" type="password" value={accountForm.password} onChange={value => setAccountForm(prev => ({ ...prev, password: value }))} required />
          <AdminField label="Department" value={accountForm.department} onChange={value => setAccountForm(prev => ({ ...prev, department: value }))} />
          <AdminField label="Designation" value={accountForm.designation} onChange={value => setAccountForm(prev => ({ ...prev, designation: value }))} />
          <AdminField label="Basic Salary" type="number" value={String(accountForm.basicSalary)} onChange={value => setAccountForm(prev => ({ ...prev, basicSalary: Number(value) }))} />
          <div className="md:col-span-2 xl:col-span-4 flex justify-end">
            <button disabled={accountSaving} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 disabled:opacity-60">
              <UserPlus className="w-4 h-4" />
              {accountSaving ? 'Creating...' : 'Create Portal Account'}
            </button>
          </div>
        </form>
      </section>

      {/* Operational Quick Nav Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AV Applications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">AV Job Applications</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review applicant submissions for Ayudh Vikas premises, filter by eligibility, and advance to 3-level confirmation.
          </p>
          <Link
            to="/manpower/admin/av-applications"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-1"
          >
            <span>Manage AV Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* All Job Applications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">All Job Applications</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Process candidate matches for corporate technology, accounting, logistics, and retail partners.
          </p>
          <Link
            to="/manpower/admin/all-applications"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 pt-1"
          >
            <span>Manage Partner Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Historical Candidate Search Engine */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Historical Candidate Search</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-parameter search across all historical applicants, qualifications, past applications, and status histories.
          </p>
          <Link
            to="/manpower/admin/search"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-lime-700 hover:text-lime-800 pt-1"
          >
            <span>Launch Historical Search Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminField = ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label className="block space-y-1.5 font-semibold text-slate-700">
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
    />
  </label>
);

const ActionWidget = ({
  to,
  icon,
  label,
  value,
  text,
  tone,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  text: string;
  tone: 'emerald' | 'amber' | 'blue' | 'slate' | 'lime';
}) => {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    lime: 'bg-lime-50 text-lime-700 border-lime-100',
  };

  return (
    <Link to={to} className={`rounded-3xl border bg-white p-4 shadow-sm shadow-slate-900/5 transition-transform hover:-translate-y-0.5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
        <div className="text-3xl font-black text-slate-950">{value}</div>
      </div>
      <div className="mt-3 text-sm font-black text-slate-950">{label}</div>
      <div className="mt-1 text-[11px] font-semibold text-slate-500">{text}</div>
    </Link>
  );
};
