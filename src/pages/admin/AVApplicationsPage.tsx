import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, Search } from 'lucide-react';
import { api } from '../../services/api';
import { ManpowerApplication } from '../../types';
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

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications('av', {
        status: statusFilter || undefined,
      });
      setApplications(res.applications);
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

      return (!search || text.includes(search))
        && (!qualificationFilter || candidate?.qualification === qualificationFilter)
        && (!documentFilter || (documentFilter === 'COMPLETE' ? hasDocument : !hasDocument));
    });
  }, [applications, searchTerm, qualificationFilter, documentFilter]);
  const applicationsPager = usePaginatedRows(filteredApplications, 10);

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
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Qualification</th>
                <th className="py-3.5 px-4">Document</th>
                <th className="py-3.5 px-4">Hiring Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-400">Loading applications...</td></tr>
              ) : filteredApplications.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-400">No applications matched the filters.</td></tr>
              ) : applicationsPager.paginatedItems.map(app => {
                const hasDocument = Boolean(app.candidate?.governmentDocumentType && app.candidate?.governmentDocumentNumber && app.candidate?.governmentDocumentUrl);
                return (
                  <tr key={app.id} onClick={() => setSelectedCandidateId(app.candidateId)} className="hover:bg-emerald-50/70 transition-colors cursor-pointer">
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
        <CandidateDossierModal candidateId={selectedCandidateId} onClose={() => setSelectedCandidateId(null)} />
      )}
    </div>
  );
};
