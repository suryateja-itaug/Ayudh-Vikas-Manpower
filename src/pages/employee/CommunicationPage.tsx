import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, CheckCircle2, User, Clock, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeCommunication } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const CommunicationPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EmployeeCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'DUTY_UPDATE' | 'PERSONAL_SITUATION' | 'OPERATIONAL' | 'CLARIFICATION'>('DUTY_UPDATE');
  const [submitting, setSubmitting] = useState(false);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeCommunications();
      setMessages(res.communications);
    } catch (err) {
      console.error('Failed to load communications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.sendCommunication({ subject, message, category });
      setMessages(prev => [res.communication, ...prev]);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch communication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <MessageSquare className="w-7 h-7 text-emerald-600" />
          <span>Operational Communication Channel</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct messaging link between on-duty personnel and Operations / HR management.
        </p>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Send Communication Note to Management</h3>
        <form onSubmit={handleSend} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Duty Handover Report for 16-Sep Evening Shift"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="DUTY_UPDATE">Duty Update</option>
                <option value="OPERATIONAL">Operational Request</option>
                <option value="PERSONAL_SITUATION">Personal Situation</option>
                <option value="CLARIFICATION">Administrative Clarification</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Message Content *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="State your operational observations, handover details, or requests..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Dispatch Message'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Message History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Communication History</h3>

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-8 text-center bg-white rounded-3xl border border-slate-200">
            No communication records found.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{item.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.message}</p>

                {item.reply ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 mt-3">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Management Reply ({item.repliedBy || 'Operations Lead'})</span>
                    </div>
                    <p className="leading-relaxed">{item.reply}</p>
                    {item.repliedAt && (
                      <span className="text-[10px] text-emerald-700 block pt-1">
                        Replied: {new Date(item.repliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic block">
                    Awaiting response from Operations Desk.
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
