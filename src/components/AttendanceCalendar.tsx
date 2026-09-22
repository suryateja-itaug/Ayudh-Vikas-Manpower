import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmployeeAttendance } from '../types';
import { formatDurationSeconds, getLiveAttendanceTotals } from '../utils/attendanceTime';

type CalendarStatus = 'FULL_DAY' | 'HALF_DAY' | 'NO_CLOCK' | 'FUTURE';

interface AttendanceCalendarProps {
  records: EmployeeAttendance[];
  todayAttendance?: EmployeeAttendance | null;
  now?: Date;
  compact?: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fullDayMinutes = 420;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const classifyAttendance = (record: EmployeeAttendance | undefined, dateKey: string, todayKey: string, now: Date): CalendarStatus => {
  if (dateKey > todayKey) return 'FUTURE';
  if (!record?.clockInTime) return 'NO_CLOCK';

  const totals = getLiveAttendanceTotals(record, now);
  const isIncompleteShift = !record.clockOutTime || record.currentActivity !== 'OFF_DUTY';
  const isHalfDay = record.dutyStatus === 'HALF_DAY' || isIncompleteShift || totals.workMinutes < fullDayMinutes;

  return isHalfDay ? 'HALF_DAY' : 'FULL_DAY';
};

const statusStyles: Record<CalendarStatus, string> = {
  FULL_DAY: 'bg-emerald-500 ring-emerald-100',
  HALF_DAY: 'bg-amber-400 ring-amber-100',
  NO_CLOCK: 'bg-slate-300 ring-slate-100',
  FUTURE: 'bg-transparent ring-transparent',
};

const statusLabels: Record<CalendarStatus, string> = {
  FULL_DAY: 'Full day',
  HALF_DAY: 'Half day / irregular logout',
  NO_CLOCK: 'No clock-in',
  FUTURE: 'Upcoming',
};

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  records,
  todayAttendance,
  now = new Date(),
  compact = false,
}) => {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const todayKey = toDateKey(now);
  const recordMap = useMemo(() => {
    const map = new Map<string, EmployeeAttendance>();
    records.forEach(record => map.set(record.date, record));
    if (todayAttendance?.date) map.set(todayAttendance.date, todayAttendance);
    return map;
  }, [records, todayAttendance]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const leadingBlankCount = firstDay.getDay();

    return [
      ...Array.from({ length: leadingBlankCount }, () => null),
      ...Array.from({ length: lastDate }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const visibleMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`;
  const visibleRecords = Array.from(recordMap.values()).filter(record => record.date.startsWith(visibleMonthKey));
  const fullDays = visibleRecords.filter(record => classifyAttendance(record, record.date, todayKey, now) === 'FULL_DAY').length;
  const halfDays = visibleRecords.filter(record => classifyAttendance(record, record.date, todayKey, now) === 'HALF_DAY').length;

  const moveMonth = (direction: number) => {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  return (
    <section className={`${
      compact
        ? 'sticky top-28 rounded-[1.35rem] border border-amber-200 bg-amber-50/95 p-4 shadow-xl shadow-amber-900/10'
        : 'rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs'
    }`}>
      <div className={`flex flex-col gap-3 border-b pb-3 ${
        compact ? 'border-amber-200' : 'sm:flex-row sm:items-center justify-between border-slate-100 pb-4'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-slate-950`}>
              {compact ? 'Month Snapshot' : 'Attendance Calendar'}
            </h3>
          </div>
          {!compact && <p className="mt-1 text-xs text-slate-500">Month view of duty completion and missing clock-ins.</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => moveMonth(-1)} className={`${compact ? 'border-amber-200 bg-white/60' : 'border-slate-200'} rounded-xl border p-2 text-slate-600 hover:bg-white`} title="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className={`${compact ? 'min-w-[128px] bg-white/70' : 'min-w-[150px] bg-slate-50'} rounded-xl px-3 py-2 text-center text-xs font-black text-slate-800`}>
            {monthLabel}
          </div>
          <button onClick={() => moveMonth(1)} className={`${compact ? 'border-amber-200 bg-white/60' : 'border-slate-200'} rounded-xl border p-2 text-slate-600 hover:bg-white`} title="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-2 gap-2 ${compact ? '' : 'sm:grid-cols-4'}`}>
        <CalendarMetric label="Full Days" value={fullDays} color="text-emerald-600" />
        <CalendarMetric label="Half / Irregular" value={halfDays} color="text-amber-600" />
      </div>

      <div className={`${compact ? 'mt-4 gap-1' : 'mt-5 gap-1.5'} grid grid-cols-7 text-center`}>
        {dayNames.map(day => (
          <div key={day} className={`${compact ? 'text-[9px]' : 'text-[10px]'} py-1 font-black uppercase tracking-wider text-slate-400`}>
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} className="aspect-square" />;

          const dateKey = toDateKey(day);
          const record = recordMap.get(dateKey);
          const status = classifyAttendance(record, dateKey, todayKey, now);
          const totals = record ? getLiveAttendanceTotals(record, now) : null;
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              title={`${dateKey} - ${statusLabels[status]}${totals ? ` - ${formatDurationSeconds(totals.workSeconds)}` : ''}`}
              className={`group relative flex aspect-square ${compact ? 'min-h-8 rounded-xl text-[11px]' : 'min-h-10 rounded-2xl text-xs'} items-center justify-center border font-black transition-all ${
                isToday
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                  : 'border-slate-100 bg-slate-50/70 text-slate-700 hover:border-slate-200 hover:bg-white'
              }`}
            >
              <span>{day.getDate()}</span>
              {status !== 'FUTURE' && (
                <span className={`absolute ${compact ? 'bottom-1 h-1.5 w-1.5 ring-2' : 'bottom-1.5 h-2 w-2 ring-4'} left-1/2 -translate-x-1/2 rounded-full ${statusStyles[status]}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className={`${compact ? 'mt-4 gap-2 border-amber-200 pt-3 text-[10px]' : 'mt-5 gap-3 border-slate-100 pt-4 text-[11px]'} flex flex-wrap items-center border-t font-bold text-slate-600`}>
        <LegendDot className="bg-emerald-500" label="Full day" />
        <LegendDot className="bg-amber-400" label={compact ? 'Half / irregular' : 'Half day / irregular logout'} />
        <LegendDot className="bg-slate-300" label="No clock-in" />
      </div>
    </section>
  );
};

const CalendarMetric = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
    <div className={`text-lg font-black ${color}`}>{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
  </div>
);

const LegendDot = ({ className, label }: { className: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
    <span>{label}</span>
  </span>
);
