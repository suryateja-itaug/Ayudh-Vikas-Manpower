import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          <span className="text-[11px] text-slate-400 font-medium">Candidates (₹10)</span>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats?.kpis?.totalCandidates ?? 129}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            ₹{(stats?.kpis?.totalCandidateFeesCollected ?? 1290).toLocaleString()} Verified
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
