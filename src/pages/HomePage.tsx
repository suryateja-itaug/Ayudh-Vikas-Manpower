import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  Award,
  CreditCard,
} from 'lucide-react';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getAdminStats()
      .then(res => setStats(res.kpis))
      .catch(() => {
        // Fallback default numbers if unauthorized for admin stats
        setStats({
          openAvJobs: 6,
          openAllJobs: 5,
          totalCandidates: 129,
          confirmedEmployees: 1,
        });
      });
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-lime-700 text-white p-8 sm:p-12 shadow-xl shadow-emerald-900/20 border border-emerald-700/40">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/12 border border-lime-300/35 px-3 py-1 rounded-full text-lime-100 text-xs font-semibold tracking-wide uppercase">
            <Award className="w-3.5 h-3.5" />
            <span>Ayudh Vikas Foundation • Manpower Placement Solutions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Transparent Recruitment, Verified Employment & Duty Lifecycle
          </h1>

          <p className="text-emerald-50/85 text-sm sm:text-base leading-relaxed max-w-2xl">
            Connecting aspiring candidates with career opportunities across Ayudh Vikas Foundation divisions and reputable corporate partners. Featuring one-time Rs.10 portal registration, 3-level merit confirmations, and integrated duty attendance.
          </p>

          {/* Core Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/manpower/jobs/av"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 text-emerald-950 font-semibold text-sm shadow-lg shadow-lime-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-4 h-4" />
              <span>Register for AV Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/manpower/jobs/all"
              className="px-5 py-3 rounded-xl bg-white/12 hover:bg-white/18 text-white font-semibold text-sm border border-white/20 flex items-center space-x-2 transition-all"
            >
              <Building2 className="w-4 h-4 text-lime-200" />
              <span>Browse All Jobs (Partner)</span>
            </Link>

            <Link
              to="/manpower/applications"
              className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>My Applications</span>
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-lime-300/20 blur-3xl pointer-events-none"></div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats?.openAvJobs ?? 6}</div>
            <div className="text-xs text-slate-500 font-medium">Open AV Vacancies</div>
          </div>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats?.openAllJobs ?? 5}</div>
            <div className="text-xs text-slate-500 font-medium">Partner Opportunities</div>
          </div>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalCandidates ?? 129}+</div>
            <div className="text-xs text-slate-500 font-medium">Registered Candidates</div>
          </div>
        </div>

        <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">3-Tier</div>
            <div className="text-xs text-slate-500 font-medium">Verified Confirmation</div>
          </div>
        </div>
      </section>

      {/* The 7-Step Operational Lifecycle (Core Prototype Architectural Pattern) */}
      <section className="bg-white/92 p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-900/5 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            The Complete Manpower Solutions Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end recruitment, duty management, and governance aligned with official Ayudh Vikas Foundation operating standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                Rs.10 Fixed
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Candidate Portal Registration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Candidate details are captured once with a secure Rs.10 portal registration payment.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                Dual Catalog
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AV Jobs & All Jobs Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seamlessly browse Foundation internal vacancies and external partner roles with zero duplicate applications.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                Multi-Level
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3-Level Job Confirmation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Selected applicants advance through Level 1 (HR), Level 2 (Operations), and Level 3 (Managing Director) sign-offs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                Automated State
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Employee Portal Transition</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Confirmed candidates transform into active employees with unique Employee IDs, QR-enabled ID cards, and Appointment Letters.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-teal-500 text-white font-bold text-xs flex items-center justify-center">
                5
              </span>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded">
                Duty State Machine
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Duty / Attendance Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time Clock In, Break, Lunch, Resume, and Clock Out tracking with strict sequence protection and duty logs.
            </p>
          </div>

          {/* Step 6 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                6
              </span>
              <span className="text-[11px] font-semibold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded">
                HR Governance
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Salary & Grievance Redressal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Electronic monthly payslip generation, leave requests, complaint tickets, and private personal scratchpads.
            </p>
          </div>

          {/* Step 7 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
                7
              </span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                Operational
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Chat & Operational Updates</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct duty updates and operational memos between employees and operations supervisors with read receipts.
            </p>
          </div>

          {/* Step 8 */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                8
              </span>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                Applicant Recall
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Reopened Job Applicant Recall</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When closed jobs reopen, the system instantly recalls historical applicants (e.g. 127 previous applicants) with 1-click re-notification.
            </p>
          </div>
        </div>
      </section>

      {/* Two Job Sections Spotlight */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AV Jobs Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-lime-50/80 p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-sm shadow-emerald-900/5 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AV Jobs (Ayudh Vikas Vacancies)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Immediate institutional roles deployed directly across Ayudh Vikas Foundation premises, healthcare clinics, mobile vans, community outreach centers, and headquarters.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-slate-700">Security Staff</span>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-slate-700">Office Assistant</span>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-slate-700">Healthcare Support</span>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-slate-700">Housekeeping</span>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs text-slate-700">Driver</span>
            </div>
          </div>

          <Link
            to="/manpower/jobs/av"
            className="w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Explore AV Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* All Jobs Card */}
        <div className="bg-gradient-to-br from-white to-teal-50/90 p-6 sm:p-8 rounded-3xl border border-teal-200 shadow-sm shadow-teal-900/5 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">ALL JOBS (Corporate Placement)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Employment openings with partner IT companies, logistics hubs, e-commerce centers, retail enterprises, and BPO service networks.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs text-slate-700">Software & Web (IT)</span>
              <span className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs text-slate-700">Desktop Support</span>
              <span className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs text-slate-700">Accounts & ERP</span>
              <span className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs text-slate-700">Warehouse Lead</span>
              <span className="px-2.5 py-1 bg-white border border-teal-200 rounded-lg text-xs text-slate-700">Customer Support</span>
            </div>
          </div>

          <Link
            to="/manpower/jobs/all"
            className="w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Application Fee Callout */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 text-white shadow-md shadow-emerald-900/15 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2 text-lime-100 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Rs.10 One-Time Portal Registration</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Register once. Apply without repeated fees.</h3>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
            First-time candidates complete portal registration once. After that, job applications reuse the active candidate profile.
          </p>
        </div>

        <Link
          to="/manpower/jobs/av"
          className="px-6 py-3 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md shrink-0 transition-transform hover:scale-105"
        >
          Browse Open Jobs
        </Link>
      </section>
    </div>
  );
};


