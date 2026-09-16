import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeLeave } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const LeavePage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'CASUAL' as 'CASUAL' | 'SICK' | 'EARNED',
    startDate: '2026-09-20',
    endDate: '2026-09-21',
    totalDays: 2,
    reason: 'Family domestic function in hometown',
    attachmentUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeLeaves();
      setLeaves(res.leaves);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await api.submitLeave(formData);
      setModalOpen(false);
      await fetchLeaves();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-amber-500" />
            <span>Leave Requests & Entitlements</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit formal leave applications for HR approval and review historical decisions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Leave Balances Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Casual Leave (CL)</span>
          <div className="text-2xl font-bold text-slate-900">8 Days</div>
          <p className="text-[11px] text-slate-500">For personal errands & family occasions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Sick / Medical Leave</span>
          <div className="text-2xl font-bold text-slate-900">6 Days</div>
          <p className="text-[11px] text-slate-500">Requires medical prescription if &gt;2 days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Earned Annual Leave</span>
          <div className="text-2xl font-bold text-slate-900">12 Days</div>
          <p className="text-[11px] text-slate-500">Carried forward into annual cycle</p>
        </div>
      </div>

      {/* Leaves History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Submitted Leave Requests</h3>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        ) : leaves.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-8 text-center">
            No leave requests on file.
          </p>
        ) : (
          <div className="space-y-3">
            {leaves.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{item.leaveType} LEAVE</span>
                    <span className="text-slate-400 font-mono">({item.totalDays} Day{item.totalDays > 1 ? 's' : ''})</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div>
                    <span className="text-slate-400">Date Duration: </span>
                    <span className="font-semibold text-slate-800">{item.startDate} to {item.endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reason: </span>
                    <span>{item.reason}</span>
                  </div>
                </div>

                {item.reviewRemarks && (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] mt-2">
                    <span className="font-semibold text-slate-900">HR Decision Remarks: </span>
                    <span>{item.reviewRemarks}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Leave Application</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={e => setFormData({ ...formData, leaveType: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick / Medical Leave</option>
                  <option value="EARNED">Earned Annual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Total Days *</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={formData.totalDays}
                  onChange={e => setFormData({ ...formData, totalDays: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain the necessity of absence..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
