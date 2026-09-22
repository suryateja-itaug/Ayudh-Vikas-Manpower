import React, { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  MapPin,
  FileText,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { CandidateProfile, ManpowerApplication, ManpowerNotification } from '../../types';

interface CandidateDossierModalProps {
  candidateId: string;
  onClose: () => void;
}

export const CandidateDossierModal: React.FC<CandidateDossierModalProps> = ({ candidateId, onClose }) => {
  const [data, setData] = useState<{
    profile: CandidateProfile;
    user?: any;
    applications: ManpowerApplication[];
    notifications: ManpowerNotification[];
    employeeRecord?: any;
    approvals: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentStatus, setDocumentStatus] = useState<CandidateProfile['documentVerificationStatus']>('PENDING');
  const [documentRemarks, setDocumentRemarks] = useState('');
  const [documentSaving, setDocumentSaving] = useState(false);
  const [documentMessage, setDocumentMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getCandidateHistory(candidateId)
      .then(res => {
        setData(res);
        setDocumentStatus(res.profile.documentVerificationStatus || 'PENDING');
        setDocumentRemarks(res.profile.documentVerificationRemarks || '');
      })
      .catch(err => console.error('Failed to load candidate dossier:', err))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleDocumentVerification = async () => {
    if (!data?.profile || !documentStatus) return;
    try {
      setDocumentSaving(true);
      setDocumentMessage(null);
      const res = await api.updateDocumentVerification(data.profile.id, documentStatus, documentRemarks);
      setData(prev => prev ? { ...prev, profile: res.profile } : prev);
      setDocumentMessage(res.message);
    } catch (err: any) {
      setDocumentMessage(err.message || 'Failed to update document status.');
    } finally {
      setDocumentSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Official Candidate Dossier
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {data?.profile.fullName || 'Candidate Details'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">ID: {candidateId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-6 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
        ) : !data ? (
          <p className="text-xs text-slate-500 py-8 text-center">Candidate record not found.</p>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Verification Status Pill */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">₹10 Registration Active & Verified</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                VALID ENROLLMENT
              </span>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400">Mobile Phone</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{data.profile.mobile}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Email Address</span>
                <div className="font-semibold text-slate-800 mt-0.5 truncate flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{data.profile.email}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Date of Birth</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(data.profile.dob).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Experience</span>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {data.profile.experienceYears} Year{data.profile.experienceYears > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Education & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  <span>Education & Degree</span>
                </span>
                <p className="text-slate-700 font-semibold">{data.profile.qualification}</p>
                {data.profile.graduation && (
                  <p className="text-slate-500 text-[11px]">{data.profile.graduation}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span>Job Preferences</span>
                </span>
                <p className="text-slate-700">Role: <span className="font-semibold">{data.profile.preferredJob}</span></p>
                <p className="text-slate-700">Location: <span className="font-semibold">{data.profile.preferredLocation}</span></p>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-900">Documented Skills</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.profile.skills?.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Permanent Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[11px] font-medium">Permanent Residential Address:</span>
              <p className="text-slate-800 mt-0.5">{data.profile.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.profile.resumeUrl && (
                <div className="p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Resume</span>
                  </span>
                  <a href={data.profile.resumeUrl} target="_blank" rel="noreferrer" className="font-semibold text-amber-600 hover:underline break-words">
                    {data.profile.resumeUrl}
                  </a>
                </div>
              )}

              <div className="p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Uploaded Government Document</span>
                </span>
                <p className="text-slate-700">Type: <span className="font-semibold">{data.profile.governmentDocumentType || '-'}</span></p>
                <p className="text-slate-700">Number: <span className="font-semibold">{data.profile.governmentDocumentNumber || '-'}</span></p>
                {data.profile.governmentDocumentUrl ? (
                  <a href={data.profile.governmentDocumentUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline break-words">
                    {data.profile.governmentDocumentUrl}
                  </a>
                ) : (
                  <p className="text-rose-600 font-semibold">No uploaded document found.</p>
                )}
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">Verification Status</span>
                      <select
                        value={documentStatus || 'PENDING'}
                        onChange={e => setDocumentStatus(e.target.value as CandidateProfile['documentVerificationStatus'])}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="NEEDS_CORRECTION">Needs Correction</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </label>
                    <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                      <span className="block font-bold text-slate-700">Last Review</span>
                      {data.profile.documentVerifiedAt
                        ? `${data.profile.documentVerifiedBy || 'Admin'} - ${new Date(data.profile.documentVerifiedAt).toLocaleString()}`
                        : 'Not reviewed yet'}
                    </div>
                  </div>
                  <textarea
                    value={documentRemarks}
                    onChange={e => setDocumentRemarks(e.target.value)}
                    placeholder="Verification remarks for candidate notification..."
                    className="w-full min-h-[72px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  />
                  <button
                    onClick={handleDocumentVerification}
                    disabled={documentSaving}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-60"
                  >
                    {documentSaving ? 'Saving...' : 'Save Document Verification'}
                  </button>
                  {documentMessage && <p className="text-[11px] font-semibold text-emerald-700">{documentMessage}</p>}
                </div>
              </div>
            </div>
            {/* Past Applications Timeline */}
            <div className="space-y-3 pt-2">
              <span className="font-bold text-slate-900 text-sm">Application History ({data.applications.length})</span>
              <div className="space-y-2">
                {data.applications.map(app => (
                  <div key={app.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{app.job?.title || 'Job Opening'}</span>
                      <p className="text-slate-500 text-[11px]">{app.job?.companyName} • Applied {new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-200 text-slate-800">
                      {app.applicationStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmed Employee Record if available */}
            {data.employeeRecord && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-900">Confirmed Employee Record</span>
                <p className="text-emerald-800">
                  Assigned Employee ID: <strong className="font-mono">{data.employeeRecord.employeeId}</strong> • {data.employeeRecord.designation} ({data.employeeRecord.department})
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

