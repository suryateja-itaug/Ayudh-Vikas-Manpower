import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle2, CreditCard, FileText, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ManpowerJob } from '../types';

const applicationImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=82';

const emptyCandidateForm = {
  fullName: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  dob: '',
  qualification: '',
  graduation: '',
  skills: '',
  experienceYears: 0,
  preferredJob: '',
  preferredLocation: '',
  address: '',
  resumeUrl: '',
  detailedExperience: '',
  esicNumber: '',
  pfAccountNumber: '',
  governmentDocumentType: 'AADHAAR',
  governmentDocumentNumber: '',
  governmentDocumentUrl: '',
};

interface CandidateRegisterPageProps {
  registrationScopeOverride?: 'ALL_JOBS' | 'AV_JOBS';
  staffCashMode?: boolean;
}

export const CandidateRegisterPage: React.FC<CandidateRegisterPageProps> = ({ registrationScopeOverride, staffCashMode = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, candidateProfile, isRegisteredCandidate, refreshUserData } = useAuth();
  const jobId = searchParams.get('jobId') || '';
  const [targetJob, setTargetJob] = useState<ManpowerJob | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registrationScope = useMemo<'ALL_JOBS' | 'AV_JOBS'>(() => {
    if (registrationScopeOverride) return registrationScopeOverride;
    if (targetJob?.jobCategory === 'AV_JOB') return 'AV_JOBS';
    return 'ALL_JOBS';
  }, [registrationScopeOverride, targetJob]);

  const isAvScope = registrationScope === 'AV_JOBS';
  const isAvUpgrade = !staffCashMode && isAvScope && candidateProfile?.registrationScope === 'ALL_JOBS';
  const isAvComplete = !staffCashMode && isAvScope && candidateProfile?.registrationScope === 'AV_JOBS';
  const showOnlyAvFields = Boolean(isAvUpgrade);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState(() => ({
    ...emptyCandidateForm,
    ...(staffCashMode ? {} : {
      fullName: candidateProfile?.fullName || user?.name || '',
      mobile: candidateProfile?.mobile || user?.mobile || '',
      email: candidateProfile?.email || user?.email || '',
      dob: candidateProfile?.dob || '1998-05-14',
      qualification: candidateProfile?.qualification || 'Graduate',
      skills: candidateProfile?.skills?.join(', ') || '',
      experienceYears: candidateProfile?.experienceYears || 0,
      preferredLocation: candidateProfile?.preferredLocation || 'Hyderabad',
      graduation: candidateProfile?.graduation || '',
      preferredJob: candidateProfile?.preferredJob || '',
      address: candidateProfile?.address || '',
      resumeUrl: candidateProfile?.resumeUrl || '',
      detailedExperience: candidateProfile?.detailedExperience || '',
      esicNumber: candidateProfile?.esicNumber || '',
      pfAccountNumber: candidateProfile?.pfAccountNumber || '',
      governmentDocumentType: candidateProfile?.governmentDocumentType || 'AADHAAR',
      governmentDocumentNumber: candidateProfile?.governmentDocumentNumber || '',
      governmentDocumentUrl: candidateProfile?.governmentDocumentUrl || '',
    }),
  }));

  useEffect(() => {
    if (!jobId) return;
    api.getJobById(jobId)
      .then(res => {
        setTargetJob(res.job);
        setFormData(prev => ({
          ...prev,
          preferredJob: prev.preferredJob || res.job.title,
          preferredLocation: prev.preferredLocation || res.job.location,
        }));
      })
      .catch(err => setErrorMessage(err.message || 'Unable to load selected job.'));
  }, [jobId]);

  const passwordError = useMemo(() => {
    if (candidateProfile && !staffCashMode) return '';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(formData.password)) return 'Password must include one uppercase letter.';
    if (!/[0-9]/.test(formData.password)) return 'Password must include one number.';
    if (formData.password !== formData.confirmPassword) return 'Passwords must match.';
    return '';
  }, [candidateProfile, staffCashMode, formData.password, formData.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const file = e.target.files?.[0];
      setFormData(prev => ({ ...prev, [name]: file ? file.name : '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: name === 'experienceYears' ? Number(value) : value }));
  };

  const submitRegistration = async () => {
    setErrorMessage(null);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }
    if (isAvScope && (!formData.esicNumber || !formData.pfAccountNumber || !formData.governmentDocumentNumber || !formData.governmentDocumentUrl)) {
      setErrorMessage('ESIC, PF, and government document upload are required for AV Jobs registration. Use N/A for ESIC or PF if not available.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.registerCandidate({
        ...formData,
        registrationScope,
        jobId: jobId || undefined,
        paymentMode: staffCashMode ? 'CASH' : 'ONLINE',
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      } as any);

      if (res.paymentOrder) {
        setPaymentOrder(res.paymentOrder);
        setPaymentModalOpen(true);
      } else {
        await refreshUserData();
        if (staffCashMode) {
          navigate('/manpower/staff');
        } else if (isAvScope) {
          setCompletionMessage('Thank you. We will notify you with updates based on your profile.');
        } else {
          navigate(res.application ? '/manpower/applications' : '/manpower/jobs/all');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentOrder) return;
    try {
      setPaymentProcessing(true);
      const txId = `tx_portal_${Date.now()}`;
      const res = await api.verifyPayment(paymentOrder.orderId, txId);
      setPaymentSuccess(res);
      await refreshUserData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {(completionMessage || (isAvComplete && isRegisteredCandidate)) && !staffCashMode && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-extrabold text-slate-900">AV Jobs Profile Active</h1>
          <p className="text-sm text-slate-600">{completionMessage || 'We will reach you based on your profile.'}</p>
          <Link to="/manpower/jobs/all" className="inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
            Browse All Jobs
          </Link>
        </div>
      )}
      {!(((isAvComplete && isRegisteredCandidate) || completionMessage) && !staffCashMode) && (
      <>
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white min-h-[300px]">
        <img src={applicationImage} alt="Candidates preparing job applications" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-emerald-950/85 to-slate-950/20" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-200">
                <ShieldCheck className="w-4 h-4" />
                {staffCashMode ? 'Walk-in support desk' : isAvScope ? 'Foundation profile' : 'Partner job profile'}
              </div>
              <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">
                {staffCashMode ? 'Register a walk-in candidate with confidence.' : isAvUpgrade ? 'Complete your Foundation-ready profile.' : isAvScope ? 'Start your AV Jobs profile.' : 'Create your job-ready profile.'}
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-7 text-emerald-50/88">
                {staffCashMode
                  ? 'Capture the candidate details, collect Rs.10 in cash, and move the profile into staff review.'
                  : isAvScope
                  ? isAvUpgrade
                    ? 'Add the remaining details once so the team can consider you for Foundation opportunities.'
                    : 'Share your identity, experience, and statutory details once so staff can review and contact you when a suitable role opens.'
                  : 'Register once, apply to external jobs, and keep your applications visible without paying for every role.'}
              </p>
            </div>
          {!user && (
            <Link to="/manpower/login" className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-black text-center shadow-sm">
              Login
            </Link>
          )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <strong className="block text-white">One profile</strong>
              <span className="text-emerald-50/75">Your details stay ready for review.</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <strong className="block text-white">Clear updates</strong>
              <span className="text-emerald-50/75">Submitted jobs remain trackable.</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <strong className="block text-white">Rs.10 once</strong>
              <span className="text-emerald-50/75">No repeated fee per application.</span>
            </div>
          </div>

          {targetJob && (
            <div className="mt-5 rounded-xl bg-lime-300/95 border border-lime-100 p-3 text-xs text-emerald-950">
              Applying for <strong>{targetJob.title}</strong> at {targetJob.companyName}
            </div>
          )}
        </motion.div>
      </section>

      <form
        onSubmit={e => {
          e.preventDefault();
          submitRegistration();
        }}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
      >
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!showOnlyAvFields && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={<User />} label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              <Field icon={<Phone />} label="Mobile Number / Username" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
              <Field icon={<Mail />} label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" />
              <Field label="Date of Birth" name="dob" value={formData.dob} onChange={handleInputChange} type="date" required />
              {!candidateProfile && (
                <>
                  <Field icon={<Lock />} label="Choose Password" name="password" value={formData.password} onChange={handleInputChange} type="password" required />
                  <Field icon={<Lock />} label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" required />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <Select label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} options={['10th', '12th', 'Diploma', 'Graduate', 'Post-Graduate']} placeholder="Select qualification" />
              <Field label="Graduation / Course" name="graduation" value={formData.graduation} onChange={handleInputChange} />
              <Field label="Skills" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="MS Office, Driving, Security" />
              <Select label="Experience" name="experienceYears" value={String(formData.experienceYears)} onChange={handleInputChange} options={['0', '1', '2', '3', '5']} />
              <Field label="Preferred Job" name="preferredJob" value={formData.preferredJob} onChange={handleInputChange} />
              <Field label="Preferred Location" name="preferredLocation" value={formData.preferredLocation} onChange={handleInputChange} />
            </div>

            <Textarea label="Address" name="address" value={formData.address} onChange={handleInputChange} required />
            <Field icon={<FileText />} label="Resume Link / Reference" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange} />
          </>
        )}

        {isAvScope && (
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900">AV Jobs Profile Details</h2>
            <Textarea label="Detailed Experience" name="detailedExperience" value={formData.detailedExperience} onChange={handleInputChange} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleInputChange} placeholder="Enter number or N/A" required />
              <Field label="PF Account Number" name="pfAccountNumber" value={formData.pfAccountNumber} onChange={handleInputChange} placeholder="Enter number or N/A" required />
              <Select label="Government Document" name="governmentDocumentType" value={formData.governmentDocumentType} onChange={handleInputChange} options={['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'VOTER_ID', 'PASSPORT']} />
              <Field label="Document Number" name="governmentDocumentNumber" value={formData.governmentDocumentNumber} onChange={handleInputChange} required />
              <FileField label="Upload Selected Document" name="governmentDocumentUrl" value={formData.governmentDocumentUrl} onChange={handleInputChange} required />
            </div>
            <p className="text-[11px] text-slate-500">ESIC/PF can be entered as N/A if not available. One selected government document upload is mandatory.</p>
          </div>
        )}

        <div className={`rounded-xl border p-3 text-xs ${staffCashMode ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          {staffCashMode
            ? 'Cash payment mode: collect Rs.10 from the walk-in candidate before submitting.'
            : isAvUpgrade
            ? 'No additional fee is needed. Submit these profile details to receive AV job updates.'
            : 'One-time portal registration fee: Rs.10. You will not pay Rs.10 for every job application.'}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span>{submitting ? 'Submitting...' : staffCashMode ? 'Mark Cash Paid & Submit' : 'Submit Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      </>
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            {paymentSuccess ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-slate-900">Registration Active</h3>
                <p className="text-xs text-slate-500">Your one-time Rs.10 portal registration is verified.</p>
                <button onClick={() => navigate('/manpower/applications')} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                  Continue
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Portal Registration Payment</h3>
                  </div>
                  <span className="font-extrabold">Rs.10</span>
                </div>
                <p className="text-xs text-slate-500">This is a one-time candidate portal registration fee.</p>
                <button
                  type="button"
                  disabled={paymentProcessing}
                  onClick={handleProcessPayment}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60"
                >
                  {paymentProcessing ? 'Verifying...' : 'Pay Rs.10 & Activate'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, icon, ...props }: any) => (
  <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
    <span>{label}</span>
    <div className="relative">
      {icon && <span className="absolute left-3 top-2.5 text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      <input
        {...props}
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
      />
    </div>
  </label>
);

const FileField = ({ label, value, ...props }: any) => (
  <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
    <span>{label}</span>
    <input
      {...props}
      type="file"
      accept=".pdf,.jpg,.jpeg,.png,.webp"
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 file:mr-3 file:border-0 file:rounded-lg file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
    />
    {value && <span className="block text-[11px] text-emerald-700 font-semibold">Selected: {value}</span>}
  </label>
);

const Select = ({ label, options, placeholder, ...props }: any) => (
  <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
    <span>{label}</span>
    <select {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option: string) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const Textarea = ({ label, ...props }: any) => (
  <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
    <span>{label}</span>
    <textarea {...props} rows={3} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
  </label>
);
