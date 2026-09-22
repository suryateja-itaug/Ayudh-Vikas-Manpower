import React, { useEffect, useState } from 'react';
import {
  Clock,
  Play,
  Coffee,
  Square,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Timer,
} from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeAttendance } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DutyActionConfirmModal } from '../../components/DutyActionConfirmModal';
import {
  formatAttendanceTime,
  formatDurationSeconds,
  getLiveAttendanceTotals,
  getSessionElapsedSeconds,
} from '../../utils/attendanceTime';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

type DutyAction = 'CLOCK_IN' | 'BREAK' | 'LUNCH' | 'RESUME' | 'CLOCK_OUT';
type ConfirmableDutyAction = Extract<DutyAction, 'CLOCK_IN' | 'CLOCK_OUT'>;

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<EmployeeAttendance | null>(null);
  const [history, setHistory] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ConfirmableDutyAction | null>(null);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        api.getEmployeeMe(),
        api.getAttendanceHistory(),
      ]);
      setTodayAttendance(todayRes.todayAttendance);
      setHistory(historyRes.history);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const liveTotals = getLiveAttendanceTotals(todayAttendance, currentTime);
  const historyPager = usePaginatedRows(history, 10);

  const completedToday = Boolean(
    todayAttendance?.clockInTime &&
    todayAttendance?.clockOutTime &&
    todayAttendance.currentActivity === 'OFF_DUTY'
  );

  const handleDutyAction = async (action: DutyAction) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await api.recordAttendanceAction(action);
      setTodayAttendance(res.attendance);
      setFeedback(res.message);
      // reload history
      const hist = await api.getAttendanceHistory();
      setHistory(hist.history);
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const requestDutyAction = (action: DutyAction) => {
    if (action === 'CLOCK_IN' || action === 'CLOCK_OUT') {
      setPendingAction(action);
      return;
    }

    handleDutyAction(action);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-7 h-7 text-emerald-600" />
            <span>Duty & Attendance Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time biometric attendance engine, shift tracking, and duty break monitoring.
          </p>
        </div>

        {/* Live Digital Clock */}
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-md flex items-center space-x-3 self-start sm:self-center font-mono">
          <Timer className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-xl font-bold tracking-widest text-emerald-400">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main Punch Clock Action Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Shift Date: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900">Current Duty State:</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  todayAttendance?.currentActivity === 'WORKING'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : todayAttendance?.currentActivity === 'BREAK'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : todayAttendance?.currentActivity === 'LUNCH'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {todayAttendance?.currentActivity || 'OFF_DUTY'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Shift Total Work Hours</span>
            <div className="text-2xl font-extrabold text-emerald-600">
              {formatDurationSeconds(liveTotals.workSeconds)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clock In</span>
            <div className="mt-1 font-mono text-sm font-bold text-slate-900">
              {formatAttendanceTime(todayAttendance?.clockInTime, todayAttendance?.date, '--:--:--', true)}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clock Out</span>
            <div className="mt-1 font-mono text-sm font-bold text-slate-900">
              {formatAttendanceTime(todayAttendance?.clockOutTime, todayAttendance?.date, '--:--:--', true)}
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Net Work</span>
            <div className="mt-1 font-mono text-sm font-bold text-emerald-700">
              {formatDurationSeconds(liveTotals.workSeconds)}
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Break + Lunch</span>
            <div className="mt-1 font-mono text-sm font-bold text-amber-700">
              {formatDurationSeconds(liveTotals.totalRestSeconds)}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Button: Clock In */}
          <button
            disabled={actionLoading || todayAttendance?.currentActivity !== 'OFF_DUTY' || completedToday}
            onClick={() => requestDutyAction('CLOCK_IN')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-xs transition-all ${
              todayAttendance?.currentActivity === 'OFF_DUTY' && !completedToday
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {completedToday ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Play className="w-5 h-5" />}
            <span>{completedToday ? 'SHIFT COMPLETED' : 'CLOCK IN'}</span>
            <span className="text-[10px] font-normal opacity-80">
              {completedToday ? 'Available next day only' : 'Start Duty Shift'}
            </span>
          </button>

          {/* Button: Take Break */}
          <button
            disabled={actionLoading || todayAttendance?.currentActivity !== 'WORKING'}
            onClick={() => requestDutyAction('BREAK')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-xs transition-all ${
              todayAttendance?.currentActivity === 'WORKING'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span>TAKE BREAK</span>
            <span className="text-[10px] font-normal opacity-80">15-min tea/rest</span>
          </button>

          {/* Button: Lunch */}
          <button
            disabled={actionLoading || todayAttendance?.currentActivity !== 'WORKING'}
            onClick={() => requestDutyAction('LUNCH')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-xs transition-all ${
              todayAttendance?.currentActivity === 'WORKING'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Coffee className="w-5 h-5" />
            <span>LUNCH BREAK</span>
            <span className="text-[10px] font-normal opacity-80">30-min midday recess</span>
          </button>

          {/* Button: Resume */}
          <button
            disabled={actionLoading || (todayAttendance?.currentActivity !== 'BREAK' && todayAttendance?.currentActivity !== 'LUNCH')}
            onClick={() => requestDutyAction('RESUME')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-xs transition-all ${
              todayAttendance?.currentActivity === 'BREAK' || todayAttendance?.currentActivity === 'LUNCH'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] animate-pulse'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Play className="w-5 h-5" />
            <span>RESUME DUTY</span>
            <span className="text-[10px] font-normal opacity-80">End break & return</span>
          </button>
        </div>

        {/* Clock out full width button */}
        {todayAttendance?.currentActivity === 'WORKING' && (
          <button
            disabled={actionLoading}
            onClick={() => requestDutyAction('CLOCK_OUT')}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Square className="w-4 h-4" />
            <span>CLOCK OUT & FINALIZE TODAY'S SHIFT</span>
          </button>
        )}

        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      <DutyActionConfirmModal
        action={pendingAction}
        workSeconds={liveTotals.workSeconds}
        actionLoading={actionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => pendingAction && handleDutyAction(pendingAction)}
      />

      {/* Today's Duty Sessions Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Today's Duty Sessions Breakdown</span>
        </h3>

        {(!todayAttendance?.sessions || todayAttendance.sessions.length === 0) ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No duty sessions recorded yet for today. Click "Clock In" to begin.
          </p>
        ) : (
          <div className="space-y-3 pt-2">
            {todayAttendance.sessions.map((sess, idx) => (
              <div
                key={sess.id || idx}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                      sess.type === 'WORK' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  >
                    {sess.type === 'WORK' ? <Play className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{sess.type} SESSION</span>
                    <p className="text-[11px] text-slate-400">
                      Started: {formatAttendanceTime(sess.startTime, undefined, '--:--:--', true)}
                      {sess.endTime ? ` - Ended: ${formatAttendanceTime(sess.endTime, undefined, '--:--:--', true)}` : ' - In Progress'}
                    </p>
                  </div>
                </div>

                <div className="font-mono font-bold text-slate-700">
                  {sess.endTime ? formatDurationSeconds(sess.durationMinutes * 60) : formatDurationSeconds(getSessionElapsedSeconds(sess, currentTime))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Attendance Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Attendance History Log</span>
          </h3>
          <span className="text-xs text-slate-400">Past 30 Days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Work Duration</th>
                <th className="py-3 px-4">Breaks</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historyPager.paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.date}</td>
                  <td className="py-3 px-4">
                    {formatAttendanceTime(item.clockInTime, item.date, '--:--:--', true)}
                  </td>
                  <td className="py-3 px-4">
                    {formatAttendanceTime(item.clockOutTime, item.date, '--:--:--', true)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                    {formatDurationSeconds(getLiveAttendanceTotals(item, currentTime).workSeconds)}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-600">
                    {formatDurationSeconds(getLiveAttendanceTotals(item, currentTime).totalRestSeconds)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {item.dutyStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={historyPager.page}
          totalPages={historyPager.totalPages}
          totalItems={history.length}
          pageSize={historyPager.pageSize}
          onPageChange={historyPager.setPage}
        />
      </div>
    </div>
  );
};
