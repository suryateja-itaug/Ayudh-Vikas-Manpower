import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink, X, Briefcase, FileText, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { ManpowerNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<ManpowerNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Recruitment & duty updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-medium text-slate-700 text-sm">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                You will receive alerts here regarding application reviews, reopened vacancies, duty assignments, and approvals.
              </p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.isRead
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-amber-50/50 border-amber-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {item.type === 'PREVIOUS_APPLICANT_RECALL' || item.type === 'JOB_REOPENED' ? (
                      <span className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center text-xs">
                        <Briefcase className="w-3.5 h-3.5" />
                      </span>
                    ) : item.type === 'OFFICIALLY_CONFIRMED' ? (
                      <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="font-semibold text-xs text-slate-900">{item.title}</span>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-xs text-amber-700 hover:text-amber-800 flex items-center space-x-0.5 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded-md"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.message}</p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  {item.linkUrl && (
                    <Link
                      to={item.linkUrl}
                      onClick={onClose}
                      className="text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
