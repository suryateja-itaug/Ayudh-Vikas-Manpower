import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Search,
  Filter,
  MapPin,
  Calendar,
  IndianRupee,
  GraduationCap,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ManpowerJob } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSampleJobs } from '../data/sampleJobs';

interface JobsListPageProps {
  categoryOverride?: 'AV_JOB' | 'ALL_JOB';
}

export const JobsListPage: React.FC<JobsListPageProps> = ({ categoryOverride }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isRegisteredCandidate } = useAuth();

  // Derive category: 'AV_JOB' or 'ALL_JOB'
  const isAllJobs = categoryOverride === 'ALL_JOB' || location.pathname.includes('/jobs/all');
  const targetCategory: 'AV_JOB' | 'ALL_JOB' = isAllJobs ? 'ALL_JOB' : 'AV_JOB';

  const [jobs, setJobs] = useState<ManpowerJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedQualification, setSelectedQualification] = useState<string>('');
  const [graduationFilter, setGraduationFilter] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<string>('');

  // Quick Apply Modal state
  const [applyingJob, setApplyingJob] = useState<ManpowerJob | null>(null);
  const [applyNotes, setApplyNotes] = useState<string>('');
  const [applySubmitting, setApplySubmitting] = useState<boolean>(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs({
        category: targetCategory,
        search: searchTerm || undefined,
        qualification: selectedQualification || undefined,
        graduationRequired: graduationFilter !== '' ? graduationFilter : undefined,
        location: selectedLocation || undefined,
        jobType: selectedJobType || undefined,
        classification: selectedClassification || undefined,
        page,
        limit: 9,
      });
      const fallbackJobs = getSampleJobs(targetCategory);
      const resolvedJobs = res.jobs.length > 0 ? res.jobs : fallbackJobs;
      setJobs(resolvedJobs);
      setTotal(res.jobs.length > 0 ? res.pagination.total : fallbackJobs.length);
      setTotalPages(res.jobs.length > 0 ? res.pagination.totalPages : 1);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      const fallbackJobs = getSampleJobs(targetCategory);
      setJobs(fallbackJobs);
      setTotal(fallbackJobs.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [targetCategory, page, selectedQualification, graduationFilter, selectedLocation, selectedJobType, selectedClassification]);

  useEffect(() => {
    if (!isRegisteredCandidate) return;
    api.getCandidateApplications()
      .then(res => {
        setAppliedJobIds(new Set((res.applications || []).map(app => app.jobId)));
      })
      .catch(() => {
        // keep page usable even if history cannot load
      });
  }, [isRegisteredCandidate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedQualification('');
    setGraduationFilter('');
    setSelectedLocation('');
    setSelectedJobType('');
    setSelectedClassification('');
    setPage(1);
  };

  const handleOpenApplyModal = async (job: ManpowerJob) => {
    if (!isRegisteredCandidate) {
      navigate(`/manpower/register?jobId=${encodeURIComponent(job.id)}`);
      return;
    }

    try {
      setApplySubmitting(true);
      setApplyErrorMessage(null);
      const res = await api.applyForJob(job.id);
      setAppliedJobIds(prev => new Set(prev).add(job.id));
      setApplySuccessMessage(`Thank you. You have applied for "${res.jobTitle || job.title}". We will notify you with updates regarding this job.`);
    } catch (err: any) {
      if (String(err.message || '').toLowerCase().includes('already applied')) {
        setAppliedJobIds(prev => new Set(prev).add(job.id));
        setApplySuccessMessage(`You have already applied for "${job.title}". We will notify you with updates regarding this job.`);
      } else {
        setApplyErrorMessage(err.message || 'Failed to submit job application.');
      }
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleConfirmApplication = async () => {
    if (!applyingJob) return;

    if (!isRegisteredCandidate) {
      setApplyErrorMessage('Active Rs.10 candidate registration required before applying. Please complete registration first.');
      return;
    }

    try {
      setApplySubmitting(true);
      setApplyErrorMessage(null);
      const res = await api.applyForJob(applyingJob.id, applyNotes);
      setApplySuccessMessage(`Application submitted! Application ID: ${res.application.id}`);
      setTimeout(() => {
        setApplyingJob(null);
        navigate('/manpower/applications');
      }, 1800);
    } catch (err: any) {
      setApplyErrorMessage(err.message || 'Failed to submit job application.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {(applySuccessMessage || applyErrorMessage) && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs font-semibold ${
          applySuccessMessage
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {applySuccessMessage ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{applySuccessMessage || applyErrorMessage}</span>
          </div>
          <button onClick={() => { setApplySuccessMessage(null); setApplyErrorMessage(null); }} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Category Header Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              {targetCategory === 'AV_JOB' ? <Briefcase className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {targetCategory === 'AV_JOB' ? 'AV Jobs (Ayudh Vikas Vacancies)' : 'ALL JOBS (Partner Placements)'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {targetCategory === 'AV_JOB'
              ? 'Institutional employment opportunities across Ayudh Vikas Foundation divisions, premises, and community centers.'
              : 'Direct employment vacancies with corporate partners, technology firms, and logistics enterprises.'}
          </p>
        </div>

        {/* Category Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
          <Link
            to="/manpower/jobs/av"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              targetCategory === 'AV_JOB'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AV Jobs
          </Link>
          <Link
            to="/manpower/jobs/all"
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              targetCategory === 'ALL_JOB'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALL JOBS
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, skill, department, keywords..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Qualification</label>
            <select
              value={selectedQualification}
              onChange={e => { setSelectedQualification(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Qualifications</option>
              <option value="10th">10th / SSC Pass</option>
              <option value="12th">12th / Intermediate</option>
              <option value="Graduate">Graduate (Any Stream)</option>
              <option value="Diploma">Diploma / Technical</option>
              <option value="B.Tech">B.Tech / MCA</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Graduation Required</label>
            <select
              value={graduationFilter}
              onChange={e => { setGraduationFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">Any Graduation</option>
              <option value="true">Graduation Required</option>
              <option value="false">Non-Graduate Eligible</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Job Type</label>
            <select
              value={selectedJobType}
              onChange={e => { setSelectedJobType(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="SHIFT_BASED">Shift Based</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Locations</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Secunderabad">Secunderabad</option>
              <option value="Warangal">Warangal</option>
              <option value="Gachibowli">Gachibowli / HITEC City</option>
              <option value="Medchal">Medchal</option>
              <option value="Khammam">Khammam</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Classification</label>
            <select
              value={selectedClassification}
              onChange={e => { setSelectedClassification(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="">All Sectors</option>
              <option value="OFFICE">Office Administration</option>
              <option value="SECURITY">Security & Premises</option>
              <option value="HEALTHCARE">Healthcare & Clinic</option>
              <option value="FACILITY">Facility & Sanitation</option>
              <option value="LOGISTICS">Logistics & Driver</option>
              <option value="IT">IT / Software</option>
              <option value="NON_IT">Corporate Non-IT</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedQualification || graduationFilter !== '' || selectedLocation || selectedJobType || selectedClassification) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Filtered results ({total} vacancies match)</span>
            <button
              onClick={handleClearFilters}
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No vacancies match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try broadening your search term, clearing qualification requirements, or selecting a different location.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => {
            const alreadyApplied = appliedJobIds.has(job.id);
            return (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/manpower/jobs/${job.id}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/manpower/jobs/${job.id}`);
                }
              }}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between p-6 space-y-5 group"
            >
              <div className="space-y-3">
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {job.department}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      job.status === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'CLOSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Title and Company */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{job.companyName}</span>
                  </p>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Key metadata chips */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-900 text-[11px]">
                      ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{job.location}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{job.qualification}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">{job.jobType.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Skills pills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/manpower/jobs/${job.id}`}
                  onClick={e => e.stopPropagation()}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  View Details
                </Link>

                {alreadyApplied ? (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </button>
                ) : job.status === 'OPEN' ? (
                  <button
                    disabled={applySubmitting}
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenApplyModal(job);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">
                    Vacancy Closed
                  </span>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

