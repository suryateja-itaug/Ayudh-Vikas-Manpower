import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, Download, Search } from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationStatus, ManpowerApplication } from '../../types';
import { CandidateDossierModal } from './CandidateDossierModal';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const AVApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications('av', {
        status: statusFilter || undefined,
      });
      setApplications(res.applications);
      setSelectedIds([]);
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load applications.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return applications.filter(app => {
      const candidate = app.candidate;
      const hasDocument = Boolean(candidate?.governmentDocumentType && candidate?.governmentDocumentNumber && candidate?.governmentDocumentUrl);
      const text = [
        candidate?.fullName,
        candidate?.mobile,
        candidate?.email,
        candidate?.qualification,
        candidate?.graduation,
        candidate?.preferredJob,
        candidate?.preferredLocation,
        candidate?.skills?.join(' '),
      ].filter(Boolean).join(' ').toLowerCase();

      const matchDocument = !documentFilter
        || (documentFilter === 'COMPLETE' && hasDocument)
        || (documentFilter === 'MISSING' && !hasDocument)
        || candidate?.documentVerificationStatus === documentFilter;

      return (!search || text.includes(search))
        && (!qualificationFilter || candidate?.qualification === qualificationFilter)
        && matchDocument;
    });
  }, [applications, searchTerm, qualificationFilter, documentFilter]);
  const applicationsPager = usePaginatedRows(filteredApplications, 10);
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
      setBannerMessage({ type: 'error', text: 'Select at least one AV application first.' });
      return;
    }
    try {
      setBulkBusy(true);
      const res = await api.bulkUpdateApplicationStatus(selectedIds, bulkStatus, `Bulk update to ${bulkStatus}`);
      setBannerMessage({ type: 'success', text: res.message });
      await fetchApplications();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Bulk update failed.' });
    } finally {
      setBulkBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = filteredApplications.map(app => ({
      candidate: app.candidate?.fullName || '',
      mobile: app.candidate?.mobile || '',
      email: app.candidate?.email || '',
      qualification: app.candidate?.qualification || '',
      documentType: app.candidate?.governmentDocumentType || '',
      documentStatus: app.candidate?.documentVerificationStatus || 'PENDING',
      hiringStatus: app.applicationStatus,
      appliedDate: app.appliedDate,
    }));
    const headers = Object.keys(rows[0] || { candidate: '', mobile: '', email: '', qualification: '', documentType: '', documentStatus: '', hiringStatus: '', appliedDate: '' });
    const csv = [headers.join(','), ...rows.map(row => headers.map(header => `"${String((row as any)[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `av-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AV Candidate Applications Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Candidates submit their AV profile once. Admin and staff can review the profile and decide offline which Foundation role can be provided.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidate, mobile, skill..."
              className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs">
            <option value="">All Statuses ({applications.length})</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={qualificationFilter} onChange={e => setQualificationFilter(e.target.value)} className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs">
            <option value="">All Qualifications</option>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="Diploma">Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post-Graduate">Post-Graduate</option>
          </select>
          <select value={documentFilter} onChange={e => setDocumentFilter(e.target.value)} className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs">
            <option value="">All Documents</option>
            <option value="COMPLETE">Document Uploaded</option>
            <option value="MISSING">Document Missing</option>
            <option value="PENDING">Verification Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
            <option value="REJECTED">Doc Rejected</option>
          </select>
        </div>
      </div>

      {bannerMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          bannerMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {bannerMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-slate-400 hover:text-slate-700 p-1">x</button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/80 text-xs">
          <div className="font-semibold text-slate-600">
            {selectedIds.length} selected from {filteredApplications.length} filtered AV applications
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
              className="rounded-xl bg-emerald-600 px-3 py-2 font-black text-white disabled:opacity-50"
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
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                </th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Qualification</th>
                <th className="py-3.5 px-4">Document</th>
                <th className="py-3.5 px-4">Hiring Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Loading applications...</td></tr>
              ) : filteredApplications.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No applications matched the filters.</td></tr>
              ) : applicationsPager.paginatedItems.map(app => {
                const hasDocument = Boolean(app.candidate?.governmentDocumentType && app.candidate?.governmentDocumentNumber && app.candidate?.governmentDocumentUrl);
                const docStatus = app.candidate?.documentVerificationStatus || 'PENDING';
                return (
                  <tr key={app.id} onClick={() => setSelectedCandidateId(app.candidateId)} className="hover:bg-emerald-50/70 transition-colors cursor-pointer">
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelection(app.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{app.candidate?.fullName || 'Candidate'}</div>
                      <div className="text-[11px] text-slate-400">{app.candidate?.mobile} - {app.candidate?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{app.candidate?.qualification}</span>
                      {app.candidate?.graduation && <span className="block text-[10px] text-slate-400">{app.candidate.graduation}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${hasDocument ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {hasDocument ? app.candidate?.governmentDocumentType : 'Missing'}
                      </span>
                      <span className="block mt-1 text-[10px] font-bold text-slate-500">{docStatus.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg font-bold text-[10px] uppercase border ${
                        app.applicationStatus === 'SELECTED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : app.applicationStatus === 'REJECTED'
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : app.applicationStatus === 'SHORTLISTED'
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                      }`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={applicationsPager.page}
          totalPages={applicationsPager.totalPages}
          totalItems={filteredApplications.length}
          pageSize={applicationsPager.pageSize}
          onPageChange={applicationsPager.setPage}
        />
      </div>

      {selectedCandidateId && (
        <CandidateDossierModal
          candidateId={selectedCandidateId}
          onClose={() => {
            setSelectedCandidateId(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};
