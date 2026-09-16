import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  ExternalLink,
  Shield,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { ManpowerApplication } from '../types';
import { useAuth } from '../context/AuthContext';

export const CandidateApplicationsPage: React.FC = () => {
  const { user, isRegisteredCandidate } = useAuth();
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getCandidateApplications();
      setApplications(res.applications);
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>SELECTED (In 3-Level Approval)</span>
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>INTERVIEW SCHEDULED</span>
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>SHORTLISTED</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>APPLICATION REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-7 h-7 text-amber-500" />
            <span>My Job Applications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track application review milestones, interview alerts, and final 3-tier job confirmations.
          </p>
        </div>

        <Link
          to="/manpower/jobs/av"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 self-start"
        >
          <span>Explore More Vacancies</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Verification Banner */}
      {!isRegisteredCandidate ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Apply from a Job Card</h4>
              <p className="text-xs text-slate-600">
                Choose a vacancy first. The candidate form and Rs.10 payment are completed from that job application flow.
              </p>
            </div>
          </div>
          <Link
            to="/manpower/jobs/av"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shrink-0"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Candidate profile active. New Rs.10 payment is collected per job application.</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded text-emerald-900 font-semibold">
            Status: ACTIVE
          </span>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-10 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog of Ayudh Vikas institutional openings and corporate partner opportunities.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <Link
              to="/manpower/jobs/av"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl"
            >
              Browse AV Jobs
            </Link>
            <Link
              to="/manpower/jobs/all"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {app.jobCategory === 'AV_JOB' ? 'AV Job' : 'Partner Job'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {app.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {app.job?.title || 'Job Opening'}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.job?.companyName || 'Ayudh Vikas Foundation'}</span>
                    <span>•</span>
                    <span>{app.job?.location || 'Hyderabad'}</span>
                  </p>
                </div>

                <div className="self-start sm:self-center">
                  {getStatusBadge(app.applicationStatus)}
                </div>
              </div>

              {/* Application Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Date Applied</span>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Department</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {app.job?.department || 'Operations'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Salary Range</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {app.job ? `₹${app.job.salaryMin.toLocaleString()} - ₹${app.job.salaryMax.toLocaleString()}` : 'Standard'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400">Application Status</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {app.applicationStatus}
                  </div>
                </div>
              </div>

              {/* Admin remarks if any */}
              {app.adminRemarks && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900">Official Status Note:</span>
                  <p className="text-slate-700">{app.adminRemarks}</p>
                </div>
              )}

              {/* Rejection reason if any */}
              {app.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                  <span className="font-bold text-rose-900">Reason for Non-Selection:</span>
                  <p className="text-slate-700">{app.rejectionReason}</p>
                </div>
              )}

              {/* Link back to job description */}
              {app.job && (
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/manpower/jobs/${app.job.id}`}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                  >
                    <span>View Vacancy Specifications</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


