import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Eye, FileText, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ManpowerApplication } from '../../types';

export const StaffPortalPage: React.FC = () => {
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ManpowerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await api.getStaffAvApplications();
      setApplications(res.applications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const review = async (id: string, action: 'APPROVE' | 'REJECT') => {
    await api.reviewStaffAvApplication(id, { action });
    setSelectedApplication(null);
    loadApplications();
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            Staff Portal
          </h1>
          <p className="text-sm text-slate-500">Review AV applications and register walk-in candidates with cash payment marking.</p>
        </div>
        <Link to="/manpower/staff/walk-in" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Walk-in Registration
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Job</th>
              <th className="text-left p-3">Staff Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : applications.map((app: any) => (
              <tr key={app.id}>
                <td className="p-3 font-bold text-slate-900">{app.candidate?.fullName || app.candidateId}</td>
                <td className="p-3 text-slate-600">{app.job?.title || app.jobId}</td>
                <td className="p-3">{app.staffReviewStatus || 'PENDING'}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSelectedApplication(app)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </button>
                    {app.staffReviewStatus === 'STAFF_APPROVED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold px-2"><CheckCircle2 className="w-4 h-4" /> Approved</span>
                    ) : (
                      <button onClick={() => review(app.id, 'APPROVE')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Approve & Process</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={() => review(selectedApplication.id, 'APPROVE')}
        />
      )}
    </div>
  );
};

const ReviewModal = ({ application, onClose, onApprove }: { application: ManpowerApplication; onClose: () => void; onApprove: () => void }) => {
  const app = application as any;
  const candidate = app.candidate || {};
  const job = app.job || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Full AV Application Review
            </div>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{candidate.fullName || app.candidateId}</h2>
            <p className="text-xs text-slate-500">{job.title || app.jobId} - {job.companyName || 'Ayudh Vikas'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Candidate Registration</h3>
            <Detail label="Full Name" value={candidate.fullName} />
            <Detail label="Mobile / Username" value={candidate.mobile} />
            <Detail label="Email" value={candidate.email} />
            <Detail label="Date of Birth" value={candidate.dob} />
            <Detail label="Qualification" value={candidate.qualification} />
            <Detail label="Graduation / Course" value={candidate.graduation} />
            <Detail label="Skills" value={Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills} />
            <Detail label="Experience Years" value={candidate.experienceYears} />
            <Detail label="Preferred Job" value={candidate.preferredJob} />
            <Detail label="Preferred Location" value={candidate.preferredLocation} />
            <Detail label="Address" value={candidate.address} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">AV Eligibility & Documents</h3>
            <Detail label="Detailed Experience" value={candidate.detailedExperience} />
            <Detail label="ESIC Number" value={candidate.esicNumber || 'N/A'} />
            <Detail label="PF Account Number" value={candidate.pfAccountNumber || 'N/A'} />
            <Detail label="Government Document" value={candidate.governmentDocumentType} />
            <Detail label="Document Number" value={candidate.governmentDocumentNumber} />
            <Detail label="Document Upload / Reference" value={candidate.governmentDocumentUrl} />
            <Detail label="Resume" value={candidate.resumeUrl} />
            <Detail label="Registration Scope" value={candidate.registrationScope} />
            <Detail label="AV Completed At" value={candidate.avRegistrationCompletedAt} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Application</h3>
            <Detail label="Application ID" value={app.id} />
            <Detail label="Applied Date" value={app.appliedDate} />
            <Detail label="Application Status" value={app.applicationStatus} />
            <Detail label="Staff Review Status" value={app.staffReviewStatus || 'PENDING'} />
            <Detail label="Payment Mode" value={app.paymentMode || 'ONLINE'} />
            <Detail label="Notes" value={app.notes} />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Job</h3>
            <Detail label="Title" value={job.title || app.jobId} />
            <Detail label="Department" value={job.department} />
            <Detail label="Location" value={job.location} />
            <Detail label="Salary Range" value={job.salaryMin && job.salaryMax ? `Rs.${job.salaryMin} - Rs.${job.salaryMax}` : ''} />
            <Detail label="Openings" value={job.openings} />
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex flex-col sm:flex-row justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold">Close</button>
          {app.staffReviewStatus === 'STAFF_APPROVED' ? (
            <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Already Approved
            </span>
          ) : (
            <button onClick={onApprove} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Approve & Process</button>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</div>
    <div className="mt-1 text-slate-900 font-semibold break-words">{value || '-'}</div>
  </div>
);
