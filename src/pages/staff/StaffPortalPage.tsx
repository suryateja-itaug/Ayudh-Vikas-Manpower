import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileText,
  ShieldCheck,
  UserCircle2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ManpowerApplication } from '../../types';

const PAGE_SIZE = 8;

export const StaffPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ManpowerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ManpowerApplication | null>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const metrics = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(app => app.staffReviewStatus === 'STAFF_APPROVED').length;
    const rejected = applications.filter(app => app.staffReviewStatus === 'STAFF_REJECTED').length;
    const pending = total - approved - rejected;
    const cash = applications.filter(app => app.paymentMode === 'CASH').length;
    return { total, approved, rejected, pending, cash };
  }, [applications]);

  const qualificationData = useMemo(() => {
    const counts = applications.reduce<Record<string, number>>((acc, app: any) => {
      const key = app.candidate?.qualification || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const statusData = [
    { name: 'Pending', value: metrics.pending, color: '#f59e0b' },
    { name: 'Approved', value: metrics.approved, color: '#059669' },
    { name: 'Rejected', value: metrics.rejected, color: '#e11d48' },
  ];

  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const paginatedApplications = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-7 pb-16">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-slate-200 pb-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
            <ClipboardCheck className="w-4 h-4" />
            Staff workspace
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">AV Application Review</h1>
          <p className="text-sm text-slate-500">Review candidate dossiers, mark staff-side processing, and register walk-in candidates.</p>
        </div>
        <Link to="/manpower/staff/walk-in" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />
          Walk-in Registration
        </Link>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.4fr] gap-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <UserCircle2 className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Profile</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 truncate">{user?.name || 'Staff User'}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'staff@ayudhvikas.org'}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <ProfileFact label="Role" value={user?.role?.replace('_', ' ') || 'staff'} />
            <ProfileFact label="Mobile" value={user?.mobile || '-'} />
            <ProfileFact label="Reviewed" value={metrics.approved} />
            <ProfileFact label="Pending" value={metrics.pending} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Total AV forms" value={metrics.total} icon={<Users />} delay={0.05} />
          <Metric label="Pending review" value={metrics.pending} icon={<BarChart3 />} delay={0.1} tone="amber" />
          <Metric label="Approved" value={metrics.approved} icon={<ShieldCheck />} delay={0.15} />
          <Metric label="Walk-in cash" value={metrics.cash} icon={<UserPlus />} delay={0.2} tone="slate" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-950">Review Mix By Qualification</h2>
            <p className="text-xs text-slate-500">Candidate education levels from the current AV application queue.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualificationData.length ? qualificationData : [{ name: 'No data', value: 0 }]} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-950">Staff Decision Status</h2>
            <p className="text-xs text-slate-500">Approved, rejected, and waiting items.</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={44} outerRadius={72} paddingAngle={4}>
                  {statusData.map(item => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {statusData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-950">Paginated AV Applications</h2>
            <p className="text-xs text-slate-500">Showing {paginatedApplications.length} of {applications.length} applications.</p>
          </div>
          <div className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="text-left p-3">Candidate</th>
                <th className="text-left p-3">Mobile</th>
                <th className="text-left p-3">Qualification</th>
                <th className="text-left p-3">Payment</th>
                <th className="text-left p-3">Staff Status</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading applications...</td></tr>
              ) : paginatedApplications.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No AV applications found.</td></tr>
              ) : paginatedApplications.map((app: any) => (
                <React.Fragment key={app.id}>
                  <tr className="hover:bg-emerald-50/60 cursor-pointer transition-colors" onClick={() => setExpandedApplicationId(prev => prev === app.id ? null : app.id)}>
                    <td className="p-3 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        {expandedApplicationId === app.id ? <ChevronDown className="w-4 h-4 text-emerald-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        {app.candidate?.fullName || app.candidateId}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{app.candidate?.mobile || '-'}</td>
                    <td className="p-3 text-slate-600">{app.candidate?.qualification || '-'}</td>
                    <td className="p-3 text-slate-600">{app.paymentMode || 'ONLINE'}</td>
                    <td className="p-3"><StatusBadge status={app.staffReviewStatus || 'PENDING'} /></td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedApplication(app)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                        {app.staffReviewStatus === 'STAFF_APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold px-2"><CheckCircle2 className="w-4 h-4" /> Approved</span>
                        ) : (
                          <button onClick={() => review(app.id, 'APPROVE')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedApplicationId === app.id && (
                    <tr>
                      <td colSpan={6} className="p-4 bg-slate-50">
                        <InlineCandidateDetails application={app} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-100">
          <button disabled={page === 1} onClick={() => setPage(prev => Math.max(1, prev - 1))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-xs text-slate-500">{applications.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, applications.length)} of {applications.length}</span>
          <button disabled={page === totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 inline-flex items-center gap-1">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

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

const Metric = ({ label, value, icon, delay, tone = 'emerald' }: { label: string; value: number; icon: React.ReactNode; delay: number; tone?: 'emerald' | 'amber' | 'slate' }) => {
  const toneClass = tone === 'amber' ? 'text-amber-600 bg-amber-50' : tone === 'slate' ? 'text-slate-700 bg-slate-100' : 'text-emerald-700 bg-emerald-50';
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${toneClass} [&>svg]:w-4 [&>svg]:h-4`}>{icon}</div>
      <div className="mt-4 text-2xl font-black text-slate-950">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
    </motion.div>
  );
};

const ProfileFact = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-black capitalize text-slate-900 truncate">{value || '-'}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const classes = status === 'STAFF_APPROVED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'STAFF_REJECTED'
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';
  return <span className={`inline-flex px-2 py-1 rounded-full border text-[10px] font-black uppercase ${classes}`}>{status.replace('STAFF_', '')}</span>;
};

const ReviewModal = ({ application, onClose, onApprove }: { application: ManpowerApplication; onClose: () => void; onApprove: () => void }) => {
  const app = application as any;
  const candidate = app.candidate || {};
  const job = app.job || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl">
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
            <Detail label="Uploaded Document" value={candidate.governmentDocumentUrl} />
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
      </motion.div>
    </div>
  );
};

const InlineCandidateDetails = ({ application }: { application: ManpowerApplication }) => {
  const app = application as any;
  const candidate = app.candidate || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 text-xs">
      <Detail label="Full Name" value={candidate.fullName} />
      <Detail label="Mobile / Username" value={candidate.mobile} />
      <Detail label="Email" value={candidate.email} />
      <Detail label="Date of Birth" value={candidate.dob} />
      <Detail label="Qualification" value={candidate.qualification} />
      <Detail label="Graduation / Course" value={candidate.graduation} />
      <Detail label="Skills" value={Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills} />
      <Detail label="Experience Years" value={candidate.experienceYears} />
      <Detail label="Detailed Experience" value={candidate.detailedExperience} />
      <Detail label="Preferred Job" value={candidate.preferredJob} />
      <Detail label="Preferred Location" value={candidate.preferredLocation} />
      <Detail label="Address" value={candidate.address} />
      <Detail label="ESIC Number" value={candidate.esicNumber || 'N/A'} />
      <Detail label="PF Account Number" value={candidate.pfAccountNumber || 'N/A'} />
      <Detail label="Government Document" value={candidate.governmentDocumentType} />
      <Detail label="Document Number" value={candidate.governmentDocumentNumber} />
      <Detail label="Uploaded Document" value={candidate.governmentDocumentUrl} />
      <Detail label="Resume" value={candidate.resumeUrl} />
      <Detail label="Payment Mode" value={app.paymentMode || 'ONLINE'} />
      <Detail label="Staff Review Status" value={app.staffReviewStatus || 'PENDING'} />
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</div>
    <div className="mt-1 text-slate-900 font-semibold break-words">{value || '-'}</div>
  </div>
);
