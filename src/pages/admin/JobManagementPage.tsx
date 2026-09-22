import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  Plus,
  RefreshCw,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  Power,
  Users,
  Search,
  Filter,
  X,
  Send,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { ManpowerJob } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const JobManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ManpowerJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Core & Detailed Filters
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClassification, setFilterClassification] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterJobType, setFilterJobType] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterGraduation, setFilterGraduation] = useState<string>('');
  const [filterQualification, setFilterQualification] = useState<string>('');
  const [filterMinSalary, setFilterMinSalary] = useState<string>('');
  const [filterMaxSalary, setFilterMaxSalary] = useState<string>('');
  const [filterReopenedOnly, setFilterReopenedOnly] = useState<boolean>(false);
  const [showDetailedFilters, setShowDetailedFilters] = useState<boolean>(false);

  // Banner feedback
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recall Drawer / Modal State
  const [recallJob, setRecallJob] = useState<ManpowerJob | null>(null);
  const [recallLoading, setRecallLoading] = useState(false);
  const [recallData, setRecallData] = useState<any>(null);
  const [notifySuccessMessage, setNotifySuccessMessage] = useState<string | null>(null);

  // Create / Edit Modal State
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobFormData, setJobFormData] = useState<Partial<ManpowerJob>>({
    title: '',
    department: 'Operations',
    jobCategory: 'AV_JOB',
    classification: 'OFFICE',
    companyName: 'Ayudh Vikas Foundation',
    description: '',
    qualification: 'Graduate',
    graduationRequired: false,
    skills: ['Communication', 'MS Office'],
    experienceRequirement: '1+ years',
    jobType: 'FULL_TIME',
    location: 'Hyderabad',
    salaryMin: 18000,
    salaryMax: 26000,
    salaryPeriod: 'MONTHLY',
    openings: 5,
    responsibilities: ['Assist institutional operations and daily documentation'],
    requiredDocuments: ['Aadhaar Card', 'Resume', '10th Marksheet'],
    applicationDeadline: '2026-11-30',
    status: 'OPEN',
  });
  const [submittingJob, setSubmittingJob] = useState(false);

  const activeFiltersCount = [
    filterCategory,
    filterStatus,
    filterClassification,
    filterDepartment,
    filterJobType,
    filterLocation,
    filterGraduation,
    filterQualification,
    filterMinSalary,
    filterMaxSalary,
    filterReopenedOnly ? 'reopened' : '',
  ].filter(Boolean).length;

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs({
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        classification: filterClassification || undefined,
        department: filterDepartment || undefined,
        jobType: filterJobType || undefined,
        location: filterLocation || undefined,
        graduationRequired: filterGraduation !== '' ? filterGraduation : undefined,
        qualification: filterQualification || undefined,
        minSalary: filterMinSalary || undefined,
        maxSalary: filterMaxSalary || undefined,
        wasReopened: filterReopenedOnly ? 'true' : undefined,
        search: searchTerm || undefined,
        limit: 100,
      });
      setJobs(res.jobs);
    } catch (err: any) {
      console.error('Failed to load jobs list:', err);
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load jobs list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    filterCategory,
    filterStatus,
    filterClassification,
    filterJobType,
    filterGraduation,
    filterReopenedOnly,
  ]);
  const jobsPager = usePaginatedRows(jobs, 10);

  const handleResetFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setSearchTerm('');
    setFilterClassification('');
    setFilterDepartment('');
    setFilterJobType('');
    setFilterLocation('');
    setFilterGraduation('');
    setFilterQualification('');
    setFilterMinSalary('');
    setFilterMaxSalary('');
    setFilterReopenedOnly(false);
    setTimeout(() => fetchJobs(), 0);
  };

  const handleToggleJobStatus = async (job: ManpowerJob) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';

    try {
      await api.updateJobStatus(job.id, newStatus);
      await fetchJobs();
      setBannerMessage({
        type: 'success',
        text: `Job "${job.title}" has been ${newStatus === 'OPEN' ? 'REOPENED' : 'CLOSED'} successfully.`,
      });
      if (newStatus === 'OPEN') {
        // Prompt recall drawer
        handleOpenRecallModal(job);
      }
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to update job status.' });
    }
  };

  const handleOpenRecallModal = async (job: ManpowerJob) => {
    setRecallJob(job);
    setNotifySuccessMessage(null);
    try {
      setRecallLoading(true);
      const res = await api.getPreviousApplicants(job.id);
      setRecallData(res);
    } catch (err: any) {
      console.error('Failed to load previous applicants:', err);
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load previous applicants.' });
    } finally {
      setRecallLoading(false);
    }
  };

  const handleNotifyApplicants = async () => {
    if (!recallJob) return;
    try {
      setRecallLoading(true);
      const res = await api.notifyPreviousApplicants(recallJob.id);
      setNotifySuccessMessage(res.message);
      confetti({ particleCount: 50, spread: 60 });
      await fetchJobs();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to dispatch recall notifications.' });
    } finally {
      setRecallLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setJobFormData({
      title: '',
      department: 'Operations',
      jobCategory: 'AV_JOB',
      classification: 'OFFICE',
      companyName: 'Ayudh Vikas Foundation',
      description: '',
      qualification: 'Graduate',
      graduationRequired: false,
      skills: ['Documentation', 'Computer Basics'],
      experienceRequirement: '0 - 2 years',
      jobType: 'FULL_TIME',
      location: 'Hyderabad',
      salaryMin: 20000,
      salaryMax: 28000,
      salaryPeriod: 'MONTHLY',
      openings: 10,
      responsibilities: ['Assist daily operations and maintain records'],
      requiredDocuments: ['Aadhaar Card', 'Resume'],
      applicationDeadline: '2026-11-30',
      status: 'OPEN',
    });
    setJobModalOpen(true);
  };

  const handleOpenEditModal = (job: ManpowerJob) => {
    setEditingJobId(job.id);
    setJobFormData({ ...job });
    setJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingJob(true);
      if (editingJobId) {
        await api.updateJob(editingJobId, jobFormData);
      } else {
        await api.createJob(jobFormData);
        setBannerMessage({
          type: 'success',
          text: `New vacancy "${res.job.title}" created and published successfully.`,
        });
      }
      setJobModalOpen(false);
      await fetchJobs();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to save job vacancy.' });
    } finally {
      setSubmittingJob(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Briefcase className="w-7 h-7 text-amber-500" />
            <span>Job Vacancy Lifecycle & Applicant Recall</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish AV and corporate partner openings, manage close/reopen states, and broadcast recall alerts to previous applicants.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Vacancy</span>
        </button>
      </div>

      {/* Banner Message */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Detailed Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
        {/* Top Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job title, skills, description, company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchJobs()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-amber-500"
              />
            </div>
            <button
              onClick={fetchJobs}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="AV_JOB">AV Internal Jobs</option>
              <option value="ALL_JOB">Partner Corporate Jobs</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open (Accepting Applications)</option>
              <option value="CLOSED">Closed (Archived/Frozen)</option>
            </select>

            <button
              onClick={() => setShowDetailedFilters(!showDetailedFilters)}
              className={`px-3.5 py-2.5 rounded-xl font-bold border transition-colors flex items-center space-x-1.5 ${
                showDetailedFilters || activeFiltersCount > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Detailed Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-rose-600 hover:text-rose-700 font-semibold text-xs underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Detailed Filters Panel */}
        {showDetailedFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Operations, IT, Security"
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Classification */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Role Classification
              </label>
              <select
                value={filterClassification}
                onChange={e => setFilterClassification(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Classifications</option>
                <option value="OFFICE">Office / Administration</option>
                <option value="SECURITY">Security & Vigilance</option>
                <option value="DRIVER">Driver / Chauffeur</option>
                <option value="TEACHER">Instructor / Teacher</option>
                <option value="CLEANING">Cleaning / Facility</option>
                <option value="HOSPITALITY">Hospitality / Food</option>
                <option value="TECHNICAL">Technical / IT</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={filterJobType}
                onChange={e => setFilterJobType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract Basis</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Duty Location / Hub
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad, Warangal"
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Min Qualification
              </label>
              <input
                type="text"
                placeholder="e.g. 10th Pass, B.Tech, MBA"
                value={filterQualification}
                onChange={e => setFilterQualification(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Graduation Requirement */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Graduation Requisite
              </label>
              <select
                value={filterGraduation}
                onChange={e => setFilterGraduation(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">Any Requisite</option>
                <option value="true">Mandatory Graduation</option>
                <option value="false">Non-Graduates Eligible</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Min Monthly Pay (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={filterMinSalary}
                onChange={e => setFilterMinSalary(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Max Salary */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Max Monthly Pay (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 35000"
                value={filterMaxSalary}
                onChange={e => setFilterMaxSalary(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Reopened Vacancy Checkbox & Apply button */}
            <div className="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterReopenedOnly}
                  onChange={e => setFilterReopenedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Show only Reopened Vacancies (with Applicant Recall available)
                </span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Clear Fields
                </button>
                <button
                  type="button"
                  onClick={fetchJobs}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Showing <strong className="text-slate-800 font-bold">{jobs.length}</strong> vacancy positions</span>
          {activeFiltersCount > 0 && (
            <span className="text-amber-700 font-semibold">
              Filtered by {activeFiltersCount} active criteria
            </span>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Job Title & Category</th>
                <th className="py-3.5 px-4">Department & Org</th>
                <th className="py-3.5 px-4">Salary Range</th>
                <th className="py-3.5 px-4">Openings</th>
                <th className="py-3.5 px-4">Previous Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading job listings...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No job listings found.
                  </td>
                </tr>
              ) : (
                jobsPager.paginatedItems.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            job.jobCategory === 'AV_JOB'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {job.jobCategory === 'AV_JOB' ? 'AV Job' : 'Partner'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {job.id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{job.department}</div>
                      <div className="text-[11px] text-slate-400">{job.companyName}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      Rs.{job.salaryMin.toLocaleString()} - Rs.{job.salaryMax.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{job.openings}</span> positions
                    </td>

                    {/* Previous Applicants Recall Column */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-900">
                            {job.previousApplicantsCount || job.totalApplicantsCount || 0} Applicants
                          </span>
                        </div>

                        {/* Recall Action Button */}
                        {(job.previousApplicantsCount || 0) > 0 && (
                          <button
                            onClick={() => handleOpenRecallModal(job)}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded"
                          >
                            <BellRing className="w-3 h-3" />
                            <span>Recall & Notify ({job.previousApplicantsCount})</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          job.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {job.status}
                      </span>
                      {job.wasReopened && (
                        <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                          REOPENED
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Open / Close */}
                        <button
                          onClick={() => handleToggleJobStatus(job)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                            job.status === 'OPEN'
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                          title={job.status === 'OPEN' ? 'Close Vacancy' : 'Reopen Vacancy'}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{job.status === 'OPEN' ? 'Close' : 'Reopen'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                          title="Edit Job"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={jobsPager.page}
          totalPages={jobsPager.totalPages}
          totalItems={jobs.length}
          pageSize={jobsPager.pageSize}
          onPageChange={jobsPager.setPage}
        />
      </div>

      {/* RECALL PREVIOUS APPLICANTS MODAL / DRAWER */}
      {recallJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Applicant Recall Engine
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{recallJob.title}</h3>
                  <p className="text-xs text-slate-500">
                    {recallJob.companyName} • Status: {recallJob.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRecallJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recall Engine Overview Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <Users className="w-4 h-4 text-amber-600" />
                <span>
                  {recallData?.count ?? recallJob.previousApplicantsCount ?? 127} Historical Candidates on Record
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                When a vacancy is reopened or updated, Ayudh Vikas Manpower Solutions allows administrators to recall and alert all previous applicants who applied before the vacancy was closed.
              </p>
            </div>

            {notifySuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{notifySuccessMessage}</span>
              </div>
            )}

            {/* List of sample previous applicants */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900">
                Sample Historical Applicants for this Vacancy:
              </span>

              {recallLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {recallData?.applicants && recallData.applicants.length > 0 ? (
                    recallData.applicants.map((cand: any, idx: number) => (
                      <div
                        key={cand.id || idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{cand.fullName}</span>
                          <span className="text-slate-400 text-[11px] block">{cand.mobile} • {cand.qualification}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {cand.status || 'APPLIED'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">Rahul Sharma</span>
                        <span className="text-slate-400 text-[11px] block">9876543210 • Graduate</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        AWAITING NOTIFICATION
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Dispatches In-App, SMS & Email alerts.
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setRecallJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>

                <button
                  disabled={recallLoading}
                  onClick={handleNotifyApplicants}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {recallLoading ? 'Dispatching Broadcast...' : 'Broadcast Recall Notification to All'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT JOB MODAL */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingJobId ? 'Edit Vacancy Listing' : 'Publish New Employment Vacancy'}
              </h3>
              <button
                onClick={() => setJobModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.title}
                    onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })}
                    placeholder="e.g. Security Supervisor"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={jobFormData.jobCategory}
                    onChange={e => setJobFormData({ ...jobFormData, jobCategory: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="AV_JOB">AV Job (Ayudh Vikas Internal Vacancy)</option>
                    <option value="ALL_JOB">Partner Job (External Corporate)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Department & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Department *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.department}
                    onChange={e => setJobFormData({ ...jobFormData, department: e.target.value })}
                    placeholder="e.g. Premises & Security"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.companyName}
                    onChange={e => setJobFormData({ ...jobFormData, companyName: e.target.value })}
                    placeholder="e.g. Ayudh Vikas Foundation"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Row 3: Qualification & Graduation Required */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Required Qualification *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.qualification}
                    onChange={e => setJobFormData({ ...jobFormData, qualification: e.target.value })}
                    placeholder="e.g. 10th / 12th Pass or Graduate"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Graduation Required?</label>
                  <select
                    value={String(jobFormData.graduationRequired)}
                    onChange={e => setJobFormData({ ...jobFormData, graduationRequired: e.target.value === 'true' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="false">No (Non-graduates eligible)</option>
                    <option value="true">Yes (Degree mandatory)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Salary Min & Max */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Min Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={jobFormData.salaryMin}
                    onChange={e => setJobFormData({ ...jobFormData, salaryMin: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Max Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={jobFormData.salaryMax}
                    onChange={e => setJobFormData({ ...jobFormData, salaryMax: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Openings Count *</label>
                  <input
                    type="number"
                    required
                    value={jobFormData.openings}
                    onChange={e => setJobFormData({ ...jobFormData, openings: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Location & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Work Location *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.location}
                    onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })}
                    placeholder="e.g. Hyderabad, Secunderabad"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Application Deadline *</label>
                  <input
                    type="date"
                    required
                    value={jobFormData.applicationDeadline?.substring(0, 10)}
                    onChange={e => setJobFormData({ ...jobFormData, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  value={jobFormData.description}
                  onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })}
                  placeholder="Outline key duty parameters..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJob}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs"
                >
                  {submittingJob ? 'Saving...' : 'Save Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
