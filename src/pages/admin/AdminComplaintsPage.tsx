import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, X, MessageSquare, AlertCircle, Check, Send } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeComplaint } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<EmployeeComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Redressal Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<EmployeeComplaint | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('RESOLVED');
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAllComplaints();
      setComplaints(res.complaints);
    } catch (err: any) {
      console.error('Failed to load admin complaints:', err);
      setBannerMessage({ type: 'error', text: err.message || 'Failed to load complaints' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const openRedressalModal = (complaint: EmployeeComplaint) => {
    setSelectedComplaint(complaint);
    setTargetStatus('RESOLVED');
    setResponseText(
      complaint.adminResponse ||
        'Grievance reviewed by Administration. Operational corrective action has been implemented.'
    );
    setModalOpen(true);
  };

  const handleConfirmRedressal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);
      await api.updateComplaint(selectedComplaint.id, targetStatus, responseText.trim());
      setBannerMessage({
        type: 'success',
        text: `Grievance #${selectedComplaint.id} has been updated to "${targetStatus}" with official redressal remarks.`,
      });
      setModalOpen(false);
      setSelectedComplaint(null);
      await fetchComplaints();
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to update grievance.' });
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
            <AlertTriangle className="w-7 h-7 text-rose-500" />
            <span>Workplace Grievance & Complaint Redressal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review lodged employee grievances across duty schedules, equipment, remuneration, and workplace safety.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
            {complaints.filter(c => c.status !== 'RESOLVED').length} Active Grievances
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

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-28 bg-slate-100 rounded-3xl animate-pulse"></div>
            <div className="h-28 bg-slate-100 rounded-3xl animate-pulse"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-slate-800 text-sm">All Grievances Cleared</div>
            <p className="text-xs text-slate-400">No active complaints pending redressal.</p>
          </div>
        ) : (
          complaints.map(comp => (
            <div
              key={comp.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      comp.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : comp.status === 'IN_REVIEW'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comp.status.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {comp.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      comp.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Priority: {comp.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Lodged on {new Date(comp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{comp.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{comp.description}</p>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                  <span className="font-semibold text-slate-800">Lodged by:</span>
                  <span>{comp.employeeName} ({comp.employeeId})</span>
                </div>

                {comp.adminResponse && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Official Administrative Redressal / Action:</span>
                    </div>
                    <p className="leading-relaxed">{comp.adminResponse}</p>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <button
                  onClick={() => openRedressalModal(comp)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{comp.status === 'RESOLVED' ? 'Update Redressal' : 'Redress & Resolve'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Redressal Modal Dialog */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Administrative Redressal Form
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grievance Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="font-bold text-slate-900 text-sm">{selectedComplaint.title}</div>
              <p className="text-slate-600 leading-relaxed italic">"{selectedComplaint.description}"</p>
              <div className="pt-2 border-t border-slate-200/60 flex justify-between text-slate-500 text-[11px]">
                <span>Employee: {selectedComplaint.employeeName} ({selectedComplaint.employeeId})</span>
                <span>Category: {selectedComplaint.category}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmRedressal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Grievance Status
                </label>
                <select
                  value={targetStatus}
                  onChange={e => setTargetStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="RESOLVED">Resolved (Official Redressal Provided)</option>
                  <option value="IN_REVIEW">In Review (Under Investigation)</option>
                  <option value="OPEN">Open (Pending Additional Documentation)</option>
                  <option value="CLOSED">Closed (Dismissed / Irrelevant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Administrative Resolution / Corrective Action Notes
                </label>
                <textarea
                  required
                  rows={4}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-emerald-500"
                  placeholder="Detail the exact corrective action, vendor escalation, or policy decision made..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Official Redressal</span>
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
