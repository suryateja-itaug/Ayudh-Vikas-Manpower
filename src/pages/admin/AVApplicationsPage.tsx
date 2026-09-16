import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { ManpowerApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CandidateDossierModal } from './CandidateDossierModal';

export const AVApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications('av', {
        status: statusFilter || undefined,
      });
      setApplications(res.applications);
    } catch (err: any) {
      console.error('Failed to load AV applications:', err);
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
      await api.updateApplicationStatus(appId, newStatus, `Updated via AV Applications manager to ${newStatus}`);
      await fetchApplications();
      if (newStatus === 'SELECTED') {
        setBannerMessage({
          type: 'success',
          text: 'Candidate marked as SELECTED! Application has been advanced to the 3-Level Governance Confirmation Queue.',
        });
      } else if (newStatus === 'REJECTED') {
        setBannerMessage({
          type: 'success',
          text: 'Candidate application marked as REJECTED.',
        });
      } else {
        setBannerMessage({
          type: 'success',
          text: `Application status successfully changed to ${newStatus}.`,
        });
      }
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AV Job Applications Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submissions for Ayudh Vikas Foundation internal openings. Selecting a candidate initiates the 3-level confirmation process.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs"
          >
            <option value="">All Statuses ({applications.length})</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW">Interview</option>
            <option value="SELECTED">Selected (In 3-Level Queue)</option>
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
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Applied Vacancy</th>
                <th className="py-3.5 px-4">Qualification</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Hiring Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No applications matched the filter.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {app.candidate?.fullName || 'Candidate'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.candidate?.mobile} • {app.candidate?.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.job?.title}</div>
                      <div className="text-[11px] text-slate-400">{app.job?.department}</div>
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

                    {/* Status Dropdown */}
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
                        <option value="SELECTED">★ SELECTED (Promote to 3-Level)</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {app.applicationStatus !== 'SELECTED' && (
                          <button
                            disabled={updatingId === app.id}
                            onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                            title="Approve / Select for 3-Level Governance"
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
