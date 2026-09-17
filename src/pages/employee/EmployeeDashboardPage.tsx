import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Clock,
  Calendar,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Play,
  Square,
  Award,
  CreditCard,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { ManpowerEmployee, EmployeeAttendance } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DutyActionConfirmModal } from '../../components/DutyActionConfirmModal';
import {
  formatAttendanceTime,
  formatDurationSeconds,
  getLiveAttendanceTotals,
} from '../../utils/attendanceTime';

type DutyAction = 'CLOCK_IN' | 'BREAK' | 'LUNCH' | 'RESUME' | 'CLOCK_OUT';
type ConfirmableDutyAction = Extract<DutyAction, 'CLOCK_IN' | 'CLOCK_OUT'>;

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<ManpowerEmployee | null>(null);
  const [attendance, setAttendance] = useState<EmployeeAttendance | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<{ casual: number; sick: number; earned: number }>({
    casual: 8,
    sick: 6,
    earned: 12,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingAction, setPendingAction] = useState<ConfirmableDutyAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeMe();
      setEmployee(res.employee);
      setAttendance(res.todayAttendance);
      setLeaveBalance(res.leaveBalance);
    } catch (err) {
      console.error('Failed to load employee dashboard info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleQuickDutyAction = async (action: DutyAction) => {
    try {
      setActionLoading(true);
      const res = await api.recordAttendanceAction(action);
      setAttendance(res.attendance);
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const requestQuickDutyAction = (action: DutyAction) => {
    if (action === 'CLOCK_IN' || action === 'CLOCK_OUT') {
      setPendingAction(action);
      return;
    }

    handleQuickDutyAction(action);
  };

  const getActivityBadge = (activity?: string) => {
    switch (activity) {
      case 'WORKING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>ACTIVE DUTY (ON THE CLOCK)</span>
          </span>
        );
      case 'BREAK':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Coffee className="w-3.5 h-3.5" />
            <span>ON SHORT BREAK</span>
          </span>
        );
      case 'LUNCH':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Coffee className="w-3.5 h-3.5" />
            <span>ON LUNCH RECESS</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>OFF DUTY</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-8 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Employee Record Not Linked</h2>
        <p className="text-xs text-slate-500">
          Your active account does not currently have a confirmed employee profile. Switch to the Confirmed Employee persona ("Vikram Singh") using the top persona selector.
        </p>
      </div>
    );
  }

  const liveTotals = getLiveAttendanceTotals(attendance, currentTime);
  const completedToday = Boolean(
    attendance?.clockInTime &&
    attendance?.clockOutTime &&
    attendance.currentActivity === 'OFF_DUTY'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Employee Profile Header Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/20 border border-emerald-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=faces"
              alt={employee.fullName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-lime-300/60 shadow-md"
            />
            <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lime-300 font-mono text-xs font-bold tracking-wider">
                {employee.employeeId}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 text-xs font-semibold">{employee.department}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{employee.fullName}</h1>
            <p className="text-xs text-emerald-50/70">
              {employee.designation} • Joined on {new Date(employee.joiningDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Documents Badges */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/manpower/employee/documents"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium text-emerald-50 border border-white/15 flex items-center space-x-1.5 transition-colors"
          >
            <Award className="w-4 h-4 text-lime-300" />
            <span>Official ID Card</span>
          </Link>
          <Link
            to="/manpower/employee/documents"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium text-emerald-50 border border-white/15 flex items-center space-x-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-teal-200" />
            <span>Appointment Letter</span>
          </Link>
        </div>
      </div>

      {/* Duty & Attendance State Machine Widget */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Today's Duty Status & Time Tracker</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="self-start sm:self-center flex flex-col sm:items-end gap-2">
            <div className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {getActivityBadge(attendance?.currentActivity)}
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-950 text-white p-4 border border-emerald-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Working Hours Today</span>
          <div className="mt-1 font-mono text-2xl sm:text-3xl font-extrabold tracking-wide text-lime-300">
            {formatDurationSeconds(liveTotals.workSeconds)}
          </div>
          <p className="mt-1 text-[11px] text-emerald-100/70">
            Live net duty time, excluding break and lunch sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {attendance?.currentActivity === 'OFF_DUTY' ? (
            completedToday ? (
              <div className="col-span-2 sm:col-span-5 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm border border-slate-200 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SHIFT COMPLETED - CLOCK IN AVAILABLE NEXT DAY</span>
              </div>
            ) : (
              <button
                onClick={() => requestQuickDutyAction('CLOCK_IN')}
                disabled={actionLoading}
                className="col-span-2 sm:col-span-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <Play className="w-4 h-4" />
                <span>CLOCK IN FOR TODAY'S DUTY</span>
              </button>
            )
          ) : (
            <>
              {attendance?.currentActivity === 'WORKING' && (
                <>
                  <button
                    onClick={() => requestQuickDutyAction('BREAK')}
                    className="py-3 bg-lime-600 hover:bg-lime-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Take Break</span>
                  </button>

                  <button
                    onClick={() => requestQuickDutyAction('LUNCH')}
                    className="py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Lunch Recess</span>
                  </button>

                  <button
                    onClick={() => requestQuickDutyAction('CLOCK_OUT')}
                    className="col-span-2 sm:col-span-3 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>CLOCK OUT (END SHIFT)</span>
                  </button>
                </>
              )}

              {(attendance?.currentActivity === 'BREAK' || attendance?.currentActivity === 'LUNCH') && (
                <button
                  onClick={() => requestQuickDutyAction('RESUME')}
                  className="col-span-2 sm:col-span-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>RESUME ACTIVE WORK (END {attendance.currentActivity})</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Duty stats readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-[11px] text-slate-400">Duty Status</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {attendance?.dutyStatus || 'NOT STARTED'}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Clock In Time</span>
            <div className="font-bold text-slate-900 mt-0.5">
              {formatAttendanceTime(attendance?.clockInTime, attendance?.date, '--:--:--', true)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Net Work Hours</span>
            <div className="font-bold text-emerald-600 mt-0.5">
              {formatDurationSeconds(liveTotals.workSeconds)}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Break & Lunch Time</span>
            <div className="font-bold text-lime-700 mt-0.5">
              {formatDurationSeconds(liveTotals.totalRestSeconds)}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to="/manpower/employee/attendance"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Open Comprehensive Attendance & Duty Timeline</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <DutyActionConfirmModal
        action={pendingAction}
        workSeconds={liveTotals.workSeconds}
        actionLoading={actionLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => pendingAction && handleQuickDutyAction(pendingAction)}
      />

      {/* Grid: Leave Balances & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balance Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Leave Entitlements</span>
            </h3>
            <Link to="/manpower/employee/leave" className="text-xs font-semibold text-emerald-600 hover:underline">
              Apply
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600">Casual Leave (CL)</span>
              <span className="font-bold text-slate-900">{leaveBalance.casual} Remaining</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600">Sick / Medical Leave</span>
              <span className="font-bold text-slate-900">{leaveBalance.sick} Remaining</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600">Earned Annual Leave</span>
              <span className="font-bold text-slate-900">{leaveBalance.earned} Remaining</span>
            </div>
          </div>
        </div>

        {/* Salary & Payslips Quick Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Salary & Payroll</span>
            </h3>
            <Link to="/manpower/employee/salary" className="text-xs font-semibold text-emerald-600 hover:underline">
              Slips
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <span className="text-slate-400">Monthly Basic Salary</span>
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{employee.basicSalary.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">
              Statutory PF, ESI, and HRA processed automatically at each monthly payroll run.
            </p>
          </div>

          <Link
            to="/manpower/employee/salary"
            className="block w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center rounded-xl text-xs font-semibold border border-slate-200"
          >
            View Payslip Statements
          </Link>
        </div>

        {/* Support & Notes Quick Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              <span>Channels & Support</span>
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              to="/manpower/employee/complaints"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              <span>Submit Grievance / Complaint</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/manpower/employee/notes"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              <span>Personal Notes & Scratchpad</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/manpower/employee/communication"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors"
            >
              <span>Operations Communication</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
