import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ManpowerJob } from '../types';

export const CandidateRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isRegisteredCandidate, refreshUserData } = useAuth();
  const jobId = searchParams.get('jobId') || '';
  const isJobApplicationFlow = Boolean(jobId);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '9876543210',
    email: user?.email || '',
    dob: '1998-05-14',
    qualification: 'Graduate',
    graduation: 'Bachelor of Commerce (B.Com)',
    skills: 'MS Office, Data Entry, English Typing, Accounting',
    experienceYears: 1,
    preferredJob: 'Office Assistant',
    preferredLocation: 'Hyderabad',
    address: 'H.No 4-12, Green Park, Ameerpet, Hyderabad, Telangana - 500016',
    resumeUrl: 'https://ayudhvikas.org/resumes/candidate_doc.pdf',
  });

  // Flow State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetJob, setTargetJob] = useState<ManpowerJob | null>(null);
  const [jobLoading, setJobLoading] = useState(false);

  // Payment Gateway Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  useEffect(() => {
    if (!jobId) {
      setTargetJob(null);
      return;
    }

    setJobLoading(true);
    api.getJobById(jobId)
      .then(res => {
        setTargetJob(res.job);
        setFormData(prev => ({
          ...prev,
          preferredJob: res.job.title || prev.preferredJob,
          preferredLocation: res.job.location || prev.preferredLocation,
        }));
      })
      .catch(err => setErrorMessage(err.message || 'Unable to load the selected job for application.'))
      .finally(() => setJobLoading(false));
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? Number(value) : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName || !formData.mobile || !formData.email) {
      setErrorMessage('Full Name, Mobile Number, and Email are required.');
      return;
    }

    try {
      setSubmitting(true);
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await api.registerCandidate({
        ...formData,
        skills: skillsArray,
        jobId: jobId || undefined,
      });

      setPaymentOrder(res.paymentOrder);
      setPaymentModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration initialization failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentOrder) return;
    try {
      setPaymentProcessing(true);
      // Simulate transaction ID
      const txId = `tx_av_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      const verifyRes = await api.verifyPayment(paymentOrder.orderId, txId);

      setPaymentSuccessData(verifyRes);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      await refreshUserData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-amber-100 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Ayudh Vikas Foundation • Official Manpower Recruitment</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {isJobApplicationFlow ? 'Candidate Application Form' : 'Candidate Registration Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-xl leading-relaxed">
          {isJobApplicationFlow
            ? 'Fill the candidate form for this job application. A nominal Rs.10 payment is collected for every job you apply to.'
            : 'Enroll your profile into the centralized candidate talent pool. You will still complete a fresh Rs.10 payment for each job application.'}
        </p>

        {targetJob && (
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 bg-white/15 border border-lime-200/40 px-3 py-2 rounded-xl text-white text-xs font-semibold mt-2">
            <span className="text-lime-100 uppercase tracking-wider text-[10px]">Applying For</span>
            <span>{targetJob.title} at {targetJob.companyName}</span>
            <span className="text-emerald-50/80">{targetJob.location}</span>
          </div>
        )}

        {jobLoading && (
          <div className="inline-flex items-center space-x-2 bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl text-white text-xs font-semibold mt-2">
            <span>Loading selected job details...</span>
          </div>
        )}

        {isRegisteredCandidate && !isJobApplicationFlow && (
          <div className="inline-flex items-center space-x-2 bg-emerald-900/40 border border-emerald-300/40 px-3 py-1.5 rounded-xl text-white text-xs font-semibold mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Your candidate profile is active. Each job application still requires its own Rs.10 payment.</span>
          </div>
        )}
      </div>

      {/* Registration Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Personal & Academic Dossier</h2>
            <p className="text-xs text-slate-500">{isJobApplicationFlow ? 'These details will be attached to this job application and used for employer verification.' : 'Provide accurate details for employer background verification.'}</p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Fee: Rs.10.00 {isJobApplicationFlow ? 'per application' : 'profile setup'}
          </span>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Row 1: Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Full Name (as per Aadhaar) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Email & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Qualification & Graduation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Highest Qualification Level *
              </label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="10th">10th / SSC</option>
                <option value="12th">12th / Intermediate</option>
                <option value="Diploma">Diploma (Technical/Polytechnic)</option>
                <option value="Graduate">Graduate (B.A, B.Com, B.Sc, B.Tech)</option>
                <option value="Post-Graduate">Post-Graduate (M.A, M.Com, M.Sc, MCA)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Graduation Degree / Major Course
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="graduation"
                  value={formData.graduation}
                  onChange={handleInputChange}
                  placeholder="e.g. B.Com Computers, B.Sc Electronics"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Skills & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Skills (comma-separated) *
              </label>
              <input
                type="text"
                name="skills"
                required
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g. MS Excel, Security, Driving, Typing, Tally"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Total Work Experience (Years)
              </label>
              <select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value={0}>0 Years (Fresher)</option>
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={5}>5+ Years</option>
              </select>
            </div>
          </div>

          {/* Row 5: Preferred Job & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Preferred Job Role / Category *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="preferredJob"
                  required
                  value={formData.preferredJob}
                  onChange={handleInputChange}
                  placeholder="e.g. Office Assistant, Security, Driver, IT Support"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Preferred Job Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="preferredLocation"
                  required
                  value={formData.preferredLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Hyderabad, Secunderabad, Warangal"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Permanent Address (with Pin Code) *
            </label>
            <textarea
              name="address"
              rows={2}
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Door No, Street, Landmark, City, State, PIN"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Resume Link & Documents */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Resume Document Link or Reference
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="resumeUrl"
                value={formData.resumeUrl}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/... or resume URL"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Registration Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Ayudh Vikas Foundation Ethical Hiring Undertaking</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              By submitting, you confirm the veracity of your qualifications and certificates. Ayudh Vikas Foundation never charges recruitment commission or placement bribes. The Rs.10 payment covers this candidate profile/application verification.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {submitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>{isJobApplicationFlow ? 'Proceed to Rs.10 Job Application Payment' : 'Proceed to Rs.10 Profile Setup Payment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Gateway Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {paymentSuccessData ? (
              /* Success State View */
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {isJobApplicationFlow ? 'Application Submitted!' : 'Registration Complete!'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isJobApplicationFlow
                      ? `Your paid application${targetJob ? ` for ${targetJob.title}` : ''} has been submitted.`
                      : 'Your candidate profile is now active in Ayudh Vikas Manpower Solutions.'}
                  </p>
                </div>

                {/* Receipt Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-slate-900">{paymentSuccessData.registration?.paymentOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-900">{paymentSuccessData.registration?.paymentTransactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">₹10.00 (Verified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidate Name:</span>
                    <span className="font-bold text-slate-800">{formData.fullName}</span>
                  </div>
                  {paymentSuccessData.application && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Application ID:</span>
                      <span className="font-mono font-bold text-slate-900">{paymentSuccessData.application.id}</span>
                    </div>
                  )}
                  {targetJob && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applied Job:</span>
                      <span className="font-bold text-slate-800 text-right">{targetJob.title}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                  {isJobApplicationFlow ? (
                    <Link
                      to="/manpower/applications"
                      onClick={() => setPaymentModalOpen(false)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md text-center transition-colors"
                    >
                      View My Submitted Applications
                    </Link>
                  ) : (
                    <Link
                      to="/manpower/jobs/av"
                      onClick={() => setPaymentModalOpen(false)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md text-center transition-colors"
                    >
                      Browse & Apply for AV Jobs Now
                    </Link>
                  )}

                  <Link
                    to="/manpower/jobs/av"
                    onClick={() => setPaymentModalOpen(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center transition-colors"
                  >
                    Back to Jobs Catalog
                  </Link>
                </div>
              </div>
            ) : (
              /* Payment Processing UI */
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Secure Payment Gateway</h3>
                      <p className="text-[11px] text-slate-500">Ayudh Vikas Foundation Official</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Due</span>
                    <div className="text-lg font-extrabold text-slate-900">₹10.00</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Order Ref:</span>
                    <span className="font-mono text-slate-700">{paymentOrder?.orderId}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Candidate:</span>
                    <span className="font-semibold text-slate-800">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Purpose:</span>
                    <span className="text-slate-800">
                      {isJobApplicationFlow ? `Job Application Fee${targetJob ? `: ${targetJob.title}` : ''}` : 'Candidate Profile Setup'}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>UPI Apps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition-all ${
                        paymentMethod === 'qr'
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-amber-500" />
                      <span>Scan QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center space-y-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      <span>Debit Card</span>
                    </button>
                  </div>
                </div>

                {/* Mock Payment Details Display */}
                {paymentMethod === 'upi' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <p className="text-slate-600">Simulate UPI intent through:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-800">
                        Google Pay
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-800">
                        PhonePe
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-800">
                        Paytm
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'qr' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-800" />
                    </div>
                    <span className="text-[11px] text-slate-500">Scan using any UPI App • Pay ₹10</span>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242  |  MM/YY  |  CVV"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-500"
                    />
                    <p className="text-[11px] text-slate-400">Sandbox test card automatically configured.</p>
                  </div>
                )}

                {/* Trigger Action */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={paymentProcessing}
                    onClick={handleProcessPayment}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-colors"
                  >
                    {paymentProcessing ? (
                      <span>Verifying with Server...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹10.00 & Activate Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


