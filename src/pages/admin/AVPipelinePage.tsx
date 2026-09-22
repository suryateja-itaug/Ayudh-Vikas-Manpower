import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Briefcase, CheckCircle2, FileCheck2, Search } from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationStatus, ManpowerApplication } from '../../types';
import { CandidateDossierModal } from './CandidateDossierModal';

const columns: Array<{ status: ApplicationStatus; title: string; tone: string }> = [
  { status: 'APPLIED', title: 'Applied', tone: 'border-slate-200 bg-slate-50' },
  { status: 'UNDER_REVIEW', title: 'Under Review', tone: 'border-amber-200 bg-amber-50' },
  { status: 'SHORTLISTED', title: 'Shortlisted', tone: 'border-purple-200 bg-purple-50' },
  { status: 'INTERVIEW', title: 'Interview', tone: 'border-blue-200 bg-blue-50' },
  { status: 'SELECTED', title: 'Selected', tone: 'border-emerald-200 bg-emerald-50' },
  { status: 'REJECTED', title: 'Rejected', tone: 'border-rose-200 bg-rose-50' },
];

const nextStatus: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  APPLIED: 'UNDER_REVIEW',
  UNDER_REVIEW: 'SHORTLISTED',
  SHORTLISTED: 'INTERVIEW',
  INTERVIEW: 'SELECTED',
};

export const AVPipelinePage: React.FC = () => {
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminApplications('av');
      setApplications(res.applications || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load AV pipeline.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return applications;
    return applications.filter(app => {
      const candidate = app.candidate;
      return `${candidate?.fullName || ''} ${candidate?.mobile || ''} ${candidate?.skills?.join(' ') || ''} ${candidate?.preferredLocation || ''}`.toLowerCase().includes(search);
    });
  }, [applications, searchTerm]);

  const totals = useMemo(() => ({
    pendingDocs: applications.filter(app => (app.candidate?.documentVerificationStatus || 'PENDING') !== 'VERIFIED').length,
    readyForInterview: applications.filter(app => app.applicationStatus === 'SHORTLISTED' || app.applicationStatus === 'INTERVIEW').length,
    selected: applications.filter(app => app.applicationStatus === 'SELECTED').length,
  }), [applications]);

  const moveApplication = async (app: ManpowerApplication, status: ApplicationStatus) => {
    try {
      const res = await api.updateApplicationStatus(app.id, status, `Pipeline moved to ${status}`);
      setMessage({ type: 'success', text: res.message });
      await fetchApplications();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to move candidate.' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
            <Briefcase className="h-4 w-4" />
            AV Recruitment Pipeline
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Candidate Pipeline Board</h1>
          <p className="mt-1 text-sm text-slate-500">Move internal Foundation candidates through review stages while keeping documents and dossiers one click away.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <Metric label="Applications" value={applications.length} />
          <Metric label="Docs Pending" value={totals.pendingDocs} />
          <Metric label="Selected" value={totals.selected} />
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search candidate, mobile, skill, location..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold" />
        </div>
        <div className="text-xs font-bold text-slate-500">{totals.readyForInterview} candidates ready for interview follow-up</div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">Loading pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {columns.map(column => {
            const items = filteredApplications.filter(app => app.applicationStatus === column.status);
            return (
              <section key={column.status} className={`min-h-[260px] rounded-3xl border ${column.tone} p-3`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-black text-slate-900">{column.title}</h2>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600 shadow-sm">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map(app => {
                    const docStatus = app.candidate?.documentVerificationStatus || 'PENDING';
                    return (
                      <article key={app.id} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                        <button onClick={() => setSelectedCandidateId(app.candidateId)} className="block w-full text-left">
                          <div className="font-black text-slate-950">{app.candidate?.fullName || 'Candidate'}</div>
                          <div className="mt-1 text-[11px] font-semibold text-slate-500">{app.candidate?.mobile} | {app.candidate?.preferredLocation || 'Location not set'}</div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {(app.candidate?.skills || []).slice(0, 3).map(skill => (
                              <span key={skill} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{skill}</span>
                            ))}
                          </div>
                        </button>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black uppercase ${docStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            <FileCheck2 className="w-3 h-3" />
                            {docStatus.replace('_', ' ')}
                          </span>
                          {nextStatus[app.applicationStatus] && (
                            <button onClick={() => moveApplication(app, nextStatus[app.applicationStatus]!)} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-white">
                              Move
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs font-semibold text-slate-400">No candidates here</div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

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

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
    <div className="text-xl font-black text-slate-950">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
  </div>
);
