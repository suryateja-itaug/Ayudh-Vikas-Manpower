import React, { useEffect, useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Briefcase,
  AlertCircle,
  FileText,
  Award,
  ChevronRight,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { JobConfirmationApproval } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CandidateDossierModal } from './CandidateDossierModal';

export const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<JobConfirmationApproval[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected candidate for dossier view
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeApproval, setActiveApproval] = useState<JobConfirmationApproval | null>(null);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals();
      setApprovals(res.approvals);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [user]);

  const handleOpenDecisionModal = (
    approval: JobConfirmationApproval,
    level: number,
    action: 'APPROVE' | 'REJECT'
  ) => {
    setActiveApproval(approval);
    setActiveLevel(level);
    setDecisionType(action);
    setDecisionRemarks(
      action === 'APPROVE'
        ? `Verification completed successfully. Candidate meets all statutory & technical requisites for ${approval.jobTitle}.`
        : `Candidate does not meet operational or verification criteria.`
    );
    setDecisionModalOpen(true);
  };

  const handleConfirmDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval) return;

    try {
      setProcessing(true);
      const res = await api.processApprovalStep(activeApproval.id, {
        level: activeLevel,
        action: decisionType,
        remarks: decisionRemarks,
      });

      setDecisionModalOpen(false);
      setSuccessBanner(res.message);

      if (res.isFullyApproved) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }

      await fetchApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to process approval step.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3-Level Governance Confirmation Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Statutory 3-tier hiring protocol: Level 1 (HR Verification) → Level 2 (Operations Lead) → Level 3 (Managing Director Final).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold">
            {approvals.filter(a => a.overallStatus === 'PENDING').length} Pending in Queue
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            {approvals.filter(a => a.overallStatus === 'APPROVED').length} Fully Approved
          </span>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Approvals Workflow List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-44 bg-slate-100 rounded-3xl animate-pulse"></div>
            <div className="h-44 bg-slate-100 rounded-3xl animate-pulse"></div>
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <Shield className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Applications in 3-Level Queue</h3>
            <p className="text-xs text-slate-400">
              When a candidate's application is marked "SELECTED" in the application manager, it will automatically enter this 3-level verification pipeline.
            </p>
          </div>
        ) : (
          approvals.map(appr => {
            const l1 = appr.levels[0];
            const l2 = appr.levels[1];
            const l3 = appr.levels[2];

            return (
              <div
                key={appr.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-xs space-y-6 transition-all ${
                  appr.overallStatus === 'APPROVED'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : appr.overallStatus === 'REJECTED'
                    ? 'border-rose-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Top: Candidate info and Overall Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {appr.candidateName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-base text-slate-900">{appr.candidateName}</h3>
                        <button
                          onClick={() => setSelectedCandidateId(appr.candidateId)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                        >
                          View Full Dossier
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">{appr.jobTitle}</span>
                        <span>•</span>
                        <span>{appr.department}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-semibold">₹{appr.salaryOffered.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Status Badge */}
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-xs uppercase tracking-wider ${
                        appr.overallStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : appr.overallStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {appr.overallStatus === 'APPROVED' ? '★ FULLY CONFIRMED' : appr.overallStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Current Stage: Level {appr.currentLevel} of 3
                    </span>
                  </div>
                </div>

                {/* 3-Tier Stepper Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LEVEL 1: HR RECRUITMENT */}
                  <div
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 text-xs ${
                      l1.status === 'APPROVED'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : l1.status === 'REJECTED'
                        ? 'bg-rose-50/50 border-rose-200'
                        : appr.currentLevel === 1
                        ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                            1
                          </span>
                          <span>Level 1: HR Recruitment</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l1.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l1.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l1.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {l1.status === 'APPROVED' ? `Signed off by ${l1.approverName}` : 'Awaiting HR Background & Document Verification'}
                      </p>
                    </div>

                    {l1.comments && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-700">
                        "{l1.comments}"
                      </div>
                    )}

                    {/* Level 1 Action Buttons */}
                    {appr.currentLevel === 1 && appr.overallStatus === 'PENDING' && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 1, 'APPROVE')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve L1</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 1, 'REJECT')}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LEVEL 2: OPERATIONS LEAD */}
                  <div
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 text-xs ${
                      l2.status === 'APPROVED'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : l2.status === 'REJECTED'
                        ? 'bg-rose-50/50 border-rose-200'
                        : appr.currentLevel === 2
                        ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                            2
                          </span>
                          <span>Level 2: Operations Lead</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l2.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l2.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l2.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {l2.status === 'APPROVED' ? `Signed off by ${l2.approverName}` : 'Operational Technical & Skill Assessment'}
                      </p>
                    </div>

                    {l2.comments && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-700">
                        "{l2.comments}"
                      </div>
                    )}

                    {/* Level 2 Action Buttons */}
                    {appr.currentLevel === 2 && appr.overallStatus === 'PENDING' && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 2, 'APPROVE')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve L2</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 2, 'REJECT')}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LEVEL 3: MANAGING DIRECTOR FINAL */}
                  <div
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 text-xs ${
                      l3.status === 'APPROVED'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : l3.status === 'REJECTED'
                        ? 'bg-rose-50/50 border-rose-200'
                        : appr.currentLevel === 3
                        ? 'bg-purple-50/40 border-purple-300 ring-2 ring-purple-400/30'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                            3
                          </span>
                          <span>Level 3: Managing Director</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            l3.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l3.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l3.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {l3.status === 'APPROVED'
                          ? `Final Authorization by ${l3.approverName}`
                          : 'Final Executive Board Hiring Authorization'}
                      </p>
                    </div>

                    {l3.comments && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-700">
                        "{l3.comments}"
                      </div>
                    )}

                    {/* Level 3 Action Buttons */}
                    {appr.currentLevel === 3 && appr.overallStatus === 'PENDING' && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 3, 'APPROVE')}
                          className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all hover:scale-105"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Final MD Sign-Off</span>
                        </button>
                        <button
                          onClick={() => handleOpenDecisionModal(appr, 3, 'REJECT')}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Promotion Status Banner if fully approved */}
                {appr.overallStatus === 'APPROVED' && (
                  <div className="p-4 rounded-2xl bg-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center space-x-3">
                      <Award className="w-6 h-6 text-amber-300 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm">Hiring Completed & Employee Record Provisioned</h4>
                        <p className="text-xs text-emerald-100">
                          Assigned Employee ID: <strong className="font-mono text-white">{appr.generatedEmployeeId || 'AV-EMP-2026-0043'}</strong> • Biometric ID Card and Formal Appointment Letter dispatched to candidate portal.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCandidateId(appr.candidateId)}
                      className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shrink-0 shadow-xs"
                    >
                      Inspect Profile
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DECISION ACTION MODAL */}
      {decisionModalOpen && activeApproval && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Governance Authorization
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {decisionType === 'APPROVE' ? 'Sign Off & Approve' : 'Reject Application'} (Level {activeLevel})
                </h3>
              </div>
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{activeApproval.candidateName}</div>
              <p className="text-slate-500">
                Position: <span className="font-semibold text-slate-800">{activeApproval.jobTitle}</span> ({activeApproval.department})
              </p>
              <p className="text-slate-500">
                Offered Remuneration: <span className="font-mono font-bold text-emerald-700">₹{activeApproval.salaryOffered.toLocaleString()}/month</span>
              </p>
            </div>

            {activeLevel === 3 && decisionType === 'APPROVE' && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Final Executive Authorization</span>
                </div>
                <p className="leading-relaxed">
                  Approving this final stage will immediately generate an official Employee ID, convert the candidate into a confirmed Employee, and generate their signed Appointment Letter and Biometric ID card.
                </p>
              </div>
            )}

            <form onSubmit={handleConfirmDecision} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Official Decision Remarks *</label>
                <textarea
                  rows={4}
                  required
                  value={decisionRemarks}
                  onChange={e => setDecisionRemarks(e.target.value)}
                  placeholder="Enter audit remarks or criteria validation..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center space-x-1.5 ${
                    decisionType === 'APPROVE'
                      ? activeLevel === 3
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {processing
                      ? 'Executing Decision...'
                      : decisionType === 'APPROVE'
                      ? `Confirm Approval (Level ${activeLevel})`
                      : `Confirm Rejection (Level ${activeLevel})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Dossier Inspection Modal */}
      {selectedCandidateId && (
        <CandidateDossierModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
        />
      )}
    </div>
  );
};
