import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, X, Shield, Check } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeLeave } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<EmployeeLeave | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAllLeaves();
      setLeaves(res.leaves);
    } catch (err: any) {
      console.error('Failed to load employee leaves:', err);
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load employee leaves' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const openReviewModal = (leave: EmployeeLeave, action: 'APPROVE' | 'REJECT') => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewRemarks(
      action === 'APPROVE'
        ? `Leave sanctioned by HR & Operations. Shift reliever assigned for ${leave.totalDays} day(s).`
        : `Leave application rejected due to urgent operational and roster requirements.`
    );
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      const res = await api.reviewLeave(selectedLeave.id, {
        action: reviewAction,
        remarks: reviewRemarks.trim(),
      });

      setBannerMessage({
        type: 'success',
        text: `Leave request for ${selectedLeave.employeeName} has been ${reviewAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'} successfully.`,
      });
      setReviewModalOpen(false);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to process leave review.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-amber-500" />
            <span>Workforce Leave Management & Approvals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review employee leave requests, check staffing coverage, and record formal approvals or rejections.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            {leaves.filter(l => l.status === 'PENDING').length} Pending Requests
          </span>
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Date Span</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status & Reviewer</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.employeeName || 'Employee'}</div>
                      <div className="font-mono text-slate-400 text-[10px]">{item.employeeId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{item.leaveType} LEAVE</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.startDate} to {item.endDate}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.totalDays} Day{item.totalDays > 1 ? 's' : ''}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      <p className="line-clamp-2">{item.reason}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.reviewedBy && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          By: {item.reviewedBy}
                        </div>
                      )}
                      {item.reviewRemarks && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[200px] truncate">
                          "{item.reviewRemarks}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openReviewModal(item, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openReviewModal(item, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition-colors flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewModal(item, item.status === 'APPROVED' ? 'REJECT' : 'APPROVE')}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 underline"
                        >
                          Change Decision
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Dialog */}
      {reviewModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    reviewAction === 'APPROVE' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {reviewAction === 'APPROVE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {reviewAction === 'APPROVE' ? 'Approve Employee Leave' : 'Reject Employee Leave'}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Leave Details Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{selectedLeave.employeeName} ({selectedLeave.employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Type & Span:</span>
                <span className="font-bold text-slate-800">{selectedLeave.leaveType} ({selectedLeave.totalDays} Day{selectedLeave.totalDays > 1 ? 's' : ''})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-mono text-slate-700">{selectedLeave.startDate} to {selectedLeave.endDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block mb-0.5">Application Reason:</span>
                <p className="text-slate-800 italic">"{selectedLeave.reason}"</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {reviewAction === 'APPROVE' ? 'Approval Confirmation Remarks' : 'Reason for Rejection'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-emerald-500"
                  placeholder="Provide explicit operational remarks..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition-all ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      {reviewAction === 'APPROVE' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      <span>Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
