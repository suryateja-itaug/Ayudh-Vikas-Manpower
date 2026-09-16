import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  GraduationCap,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Shield,
  Send,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ManpowerJob } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSampleJobById } from '../data/sampleJobs';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRegisteredCandidate } = useAuth();

  const [job, setJob] = useState<ManpowerJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [applying, setApplying] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getJobById(id)
      .then(res => setJob(res.job))
      .catch(err => {
        const sampleJob = getSampleJobById(id);
        if (sampleJob) {
          setJob(sampleJob);
          setError(null);
        } else {
          setError(err.message || 'Failed to load job vacancy details');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    if (!isRegisteredCandidate) {
      setApplyError('Active ₹10 candidate registration required before applying.');
      return;
    }

    try {
      setApplying(true);
      setApplyError(null);
      const res = await api.applyForJob(job.id, notes);
      setApplySuccess(`Application submitted! Ref ID: ${res.application.id}`);
      setTimeout(() => {
        setShowApplyModal(false);
        navigate('/manpower/applications');
      }, 1800);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const startPaidApplication = () => {
    if (!job) return;
    navigate(`/manpower/register?jobId=${encodeURIComponent(job.id)}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-40 bg-slate-100 rounded-3xl"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Job vacancy not found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested vacancy listing may have been moved or archived.'}</p>
        <Link
          to="/manpower/jobs/av"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vacancies Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        to={job.jobCategory === 'AV_JOB' ? '/manpower/jobs/av' : '/manpower/jobs/all'}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {job.jobCategory === 'AV_JOB' ? 'AV Jobs' : 'All Jobs'}</span>
      </Link>

      {/* Main Job Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {job.department}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  job.status === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {job.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-amber-500" />
              <span>{job.companyName}</span>
            </p>
          </div>

          {/* Action button */}
          <div className="shrink-0 self-start sm:self-center">
            {job.status === 'OPEN' ? (
              <button
                onClick={startPaidApplication}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <span>Apply & Pay Rs.10</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                Application Closed
              </div>
            )}
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Monthly Salary</span>
            <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center">
              <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-amber-500" />
              <span>₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Total Openings</span>
            <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-blue-500" />
              <span>{job.openings} Openings</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Location</span>
            <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Application Deadline</span>
            <div className="text-slate-900 font-bold text-sm mt-0.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="font-bold flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Application requires this full form and a Rs.10 payment for this specific job.</span>
            </div>
            <span className="font-semibold text-emerald-800">
              {job.totalApplicantsCount || 0} applicant{(job.totalApplicantsCount || 0) === 1 ? '' : 's'} recorded
            </span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Review the complete job information below before applying. The candidate form will be shown again for this role so the latest profile details, documents, and payment receipt are linked to this application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Job Identity</span>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Job ID</span><span className="font-bold text-slate-900 text-right">{job.id}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Category</span><span className="font-bold text-slate-900 text-right">{job.jobCategory.replace('_', ' ')}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Classification</span><span className="font-bold text-slate-900 text-right">{job.classification}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Department</span><span className="font-bold text-slate-900 text-right">{job.department}</span></div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Hiring Status</span>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Openings</span><span className="font-bold text-slate-900 text-right">{job.openings}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Status</span><span className="font-bold text-slate-900 text-right">{job.status}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Reopened</span><span className="font-bold text-slate-900 text-right">{job.wasReopened ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Last Updated</span><span className="font-bold text-slate-900 text-right">{new Date(job.updatedAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 pt-2 text-xs sm:text-sm">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Job Description</h3>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Key Duties & Responsibilities</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility & Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span>Eligibility Requirements</span>
              </h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Minimum Qualification:</span> {job.qualification}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Graduation Required:</span> {job.graduationRequired ? 'Yes, Degree mandatory' : 'No (Non-graduates eligible)'}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Experience Needed:</span> {job.experienceRequirement}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Employment Format:</span> {job.jobType.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Required Documentation</span>
              </h3>
              <ul className="space-y-1 text-xs text-slate-600">
                {job.requiredDocuments?.map((doc, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Required */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

