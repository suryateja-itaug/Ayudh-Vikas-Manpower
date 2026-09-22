import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Search,
  CheckCircle2,
  Download,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationStatus, ManpowerApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CandidateDossierModal } from './CandidateDossierModal';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const AllApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications('all', {
        status: statusFilter || undefined,
      });
      setApplications(res.applications);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to load corporate applications:', err);
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load applications.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleUpdateStatus = async (appId: string, newStatus: any) => {
    try {
      setUpdatingId(appId);
      await api.updateApplicationStatus(appId, newStatus, `Updated in corporate job manager to ${newStatus}`);
      await fetchApplications();
      setBannerMessage({
        type: 'success',
        text: `Application status successfully updated to ${newStatus}.`,
      });
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };
  const applicationsPager = usePaginatedRows(applications, 10);
  const pageIds = applicationsPager.paginatedItems.map(app => app.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const togglePageSelection = () => {
    setSelectedIds(prev => {
      if (allPageSelected) return prev.filter(id => !pageIds.includes(id));
      return Array.from(new Set([...prev, ...pageIds]));
    });
  };

  const handleBulkStatus = async () => {
    if (selectedIds.length === 0) {
      setBannerMessage({ type: 'error', text: 'Select at least one partner application first.' });
      return;
    }
    try {
      setBulkBusy(true);
      const res = await api.bulkUpdateApplicationStatus(selectedIds, bulkStatus, `Bulk partner-job update to ${bulkStatus}`);
      setBannerMessage({ type: 'success', text: res.message });
      await fetchApplications();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Bulk update failed.' });
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = applications.map(app => ({
      candidate: app.candidate?.fullName || '',
      mobile: app.candidate?.mobile || '',
      email: app.candidate?.email || '',
      role: app.job?.title || '',
      partner: app.job?.companyName || '',
      qualification: app.candidate?.qualification || '',
      status: app.applicationStatus,
      appliedDate: app.appliedDate,
    }));
    const headers = Object.keys(rows[0] || { candidate: '', mobile: '', email: '', role: '', partner: '', qualification: '', status: '', appliedDate: '' });
    const csv = [headers.join(','), ...rows.map(row => headers.map(header => `"${String((row as any)[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-job-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Corporate Partner Job Applications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking candidates submitted to external institutional, logistics, and technology partners.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs"
          >
            <option value="">All Partner Submissions ({applications.length})</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Banner */}
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/80 text-xs">
          <div className="font-semibold text-slate-600">
            {selectedIds.length} selected from {applications.length} partner applications
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value as ApplicationStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700"
            >
              <option value="UNDER_REVIEW">Move to Under Review</option>
              <option value="SHORTLISTED">Shortlist</option>
              <option value="INTERVIEW">Mark Interview</option>
              <option value="SELECTED">Select</option>
              <option value="REJECTED">Reject</option>
            </select>
            <button
              disabled={bulkBusy || selectedIds.length === 0}
              onClick={handleBulkStatus}
              className="rounded-xl bg-blue-600 px-3 py-2 font-black text-white disabled:opacity-50"
            >
              Apply Bulk Status
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 font-black text-slate-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePageSelection}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                </th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Role & Partner</th>
                <th className="py-3.5 px-4">Qualification</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Hiring Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading corporate job applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No applications found for this filter.
                  </td>
                </tr>
              ) : (
                applicationsPager.paginatedItems.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelection(app.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{app.candidate?.fullName || 'Candidate'}</div>
                      <div className="font-mono text-slate-400 text-[10px]">
                        {app.candidate?.mobile} - {app.candidate?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.job?.title}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{app.job?.companyName || 'Corporate Partner'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{app.candidate?.qualification}</span>
                      {app.candidate?.graduation && (
                        <span className="block text-[10px] text-slate-400">{app.candidate?.graduation}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        disabled={updatingId === app.id}
                        value={app.applicationStatus}
                        onChange={e => handleUpdateStatus(app.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase border ${
                          app.applicationStatus === 'SELECTED'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : app.applicationStatus === 'REJECTED'
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : app.applicationStatus === 'SHORTLISTED'
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="SELECTED">Selected</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {app.applicationStatus !== 'SELECTED' && (
                          <button
                            disabled={updatingId === app.id}
                            onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                            title="Select / Approve Candidate"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                          >
                            Select
                          </button>
                        )}
                        {app.applicationStatus !== 'REJECTED' && (
                          <button
                            disabled={updatingId === app.id}
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            title="Reject Application"
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCandidateId(app.candidateId)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          Dossier
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
          page={applicationsPager.page}
          totalPages={applicationsPager.totalPages}
          totalItems={applications.length}
          pageSize={applicationsPager.pageSize}
          onPageChange={applicationsPager.setPage}
        />
      </div>

      {selectedCandidateId && (
        <CandidateDossierModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  );
};
