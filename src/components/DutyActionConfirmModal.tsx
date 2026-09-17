import React from 'react';
import { AlertTriangle, Clock, Play, Square, X } from 'lucide-react';
import { formatDurationSeconds } from '../utils/attendanceTime';

type ConfirmableDutyAction = 'CLOCK_IN' | 'CLOCK_OUT';

interface DutyActionConfirmModalProps {
  action: ConfirmableDutyAction | null;
  workSeconds: number;
  actionLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DutyActionConfirmModal: React.FC<DutyActionConfirmModalProps> = ({
  action,
  workSeconds,
  actionLoading = false,
  onCancel,
  onConfirm,
}) => {
  if (!action) return null;

  const isClockOut = action === 'CLOCK_OUT';
  const title = isClockOut ? 'Confirm Clock Out' : 'Confirm Clock In';
  const description = isClockOut
    ? 'This will finalize today\'s shift. You can clock in again on the next working day only.'
    : 'This will start your duty timer for today.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className={`${isClockOut ? 'bg-rose-600' : 'bg-emerald-600'} px-5 py-4 text-white flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {isClockOut ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <h3 className="font-extrabold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={actionLoading}
            className="p-1 rounded-lg hover:bg-white/15 disabled:opacity-50"
            aria-label="Close confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">{description}</p>

          {isClockOut && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Worked Time So Far</span>
              <div className="mt-1 font-mono text-2xl font-extrabold text-rose-700">
                {formatDurationSeconds(workSeconds)}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={actionLoading}
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center space-x-2 disabled:opacity-60 ${
                isClockOut ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isClockOut ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{actionLoading ? 'Processing...' : isClockOut ? 'Confirm Clock Out' : 'Confirm Clock In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
