import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Search, Users, Coffee, Play, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeeAttendance } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatAttendanceTime, formatDuration, getLiveAttendanceTotals } from '../../utils/attendanceTime';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const AdminAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().substring(0, 10));

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAllAttendance(dateFilter);
      setAttendances(res.attendances);
    } catch (err) {
      console.error('Failed to load admin attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);
  const attendancePager = usePaginatedRows(attendances, 10);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workforce Duty & Biometric Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time shift activity monitoring, daily clock-in/out records, and break monitoring across departments.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="font-semibold text-slate-600">Select Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 shadow-xs"
          />
        </div>
      </div>

      {/* Attendance Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Logged Shifts</span>
          <div className="text-2xl font-bold text-slate-900">{attendances.length}</div>
          <p className="text-[11px] text-slate-500">Personnel recorded on {dateFilter}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Currently On Duty</span>
          <div className="text-2xl font-bold text-emerald-600">
            {attendances.filter(a => a.currentActivity === 'WORKING').length}
          </div>
          <p className="text-[11px] text-slate-500">Active on duty floor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">On Break / Lunch</span>
          <div className="text-2xl font-bold text-amber-600">
            {attendances.filter(a => a.currentActivity === 'BREAK' || a.currentActivity === 'LUNCH').length}
          </div>
          <p className="text-[11px] text-slate-500">Recess intermission</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Completed Shifts</span>
          <div className="text-2xl font-bold text-slate-700">
            {attendances.filter(a => Boolean(a.clockOutTime)).length}
          </div>
          <p className="text-[11px] text-slate-500">Clocked out shifts</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Clock In</th>
                <th className="py-3.5 px-4">Clock Out</th>
                <th className="py-3.5 px-4">Work Duration</th>
                <th className="py-3.5 px-4">Breaks Duration</th>
                <th className="py-3.5 px-4">Current Activity</th>
                <th className="py-3.5 px-4">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No attendance records for selected date ({dateFilter}).
                  </td>
                </tr>
              ) : (
                attendancePager.paginatedItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.employeeName || 'Staff Member'}</div>
                      <div className="font-mono text-slate-400 text-[10px]">{item.employeeId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {formatAttendanceTime(item.clockInTime, item.date)}
                    </td>

                    <td className="py-3.5 px-4">
                      {formatAttendanceTime(item.clockOutTime, item.date)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {formatDuration(getLiveAttendanceTotals(item).workMinutes)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-amber-600">
                      {formatDuration(getLiveAttendanceTotals(item).totalRestMinutes)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.currentActivity === 'WORKING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.currentActivity === 'BREAK'
                            ? 'bg-amber-100 text-amber-800'
                            : item.currentActivity === 'LUNCH'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.currentActivity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{item.dutyStatus}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={attendancePager.page}
          totalPages={attendancePager.totalPages}
          totalItems={attendances.length}
          pageSize={attendancePager.pageSize}
          onPageChange={attendancePager.setPage}
        />
      </div>
    </div>
  );
};
