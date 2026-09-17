import { EmployeeAttendance, AttendanceSession } from '../types';

const timeOnlyPattern = /^\d{2}:\d{2}(:\d{2})?$/;

export const parseAttendanceDateTime = (value?: string, date?: string): Date | null => {
  if (!value) return null;

  const normalized = timeOnlyPattern.test(value) && date ? `${date}T${value}` : value;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatAttendanceTime = (value?: string, date?: string, fallback = '--:--', includeSeconds = false) => {
  const parsed = parseAttendanceDateTime(value, date);

  if (!parsed) return fallback;

  return parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' as const } : {}),
  });
};

export const minutesBetween = (start?: string, end?: string, date?: string) => {
  const startTime = parseAttendanceDateTime(start, date);
  const endTime = parseAttendanceDateTime(end, date);

  if (!startTime || !endTime) return 0;

  return Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 60000));
};

export const secondsBetween = (start?: string, end?: string, date?: string) => {
  const startTime = parseAttendanceDateTime(start, date);
  const endTime = parseAttendanceDateTime(end, date);

  if (!startTime || !endTime) return 0;

  return Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));
};

export const getSessionElapsedMinutes = (session: AttendanceSession, now = new Date()) => {
  if (session.endTime) return session.durationMinutes;

  const startTime = parseAttendanceDateTime(session.startTime);
  if (!startTime) return session.durationMinutes;

  return Math.max(session.durationMinutes, Math.floor((now.getTime() - startTime.getTime()) / 60000));
};

export const getSessionElapsedSeconds = (session: AttendanceSession, now = new Date()) => {
  const savedSeconds = (session.durationMinutes || 0) * 60;

  if (session.endTime) {
    return Math.max(savedSeconds, secondsBetween(session.startTime, session.endTime));
  }

  const startTime = parseAttendanceDateTime(session.startTime);
  if (!startTime) return savedSeconds;

  return Math.max(savedSeconds, Math.floor((now.getTime() - startTime.getTime()) / 1000));
};

export const getLiveAttendanceTotals = (attendance?: EmployeeAttendance | null, now = new Date()) => {
  if (!attendance) {
    return {
      workMinutes: 0,
      breakMinutes: 0,
      lunchMinutes: 0,
      totalRestMinutes: 0,
      workSeconds: 0,
      breakSeconds: 0,
      lunchSeconds: 0,
      totalRestSeconds: 0,
    };
  }

  const hasSessions = Boolean(attendance.sessions?.length);
  const totals = {
    workSeconds: hasSessions ? 0 : (attendance.totalWorkMinutes || 0) * 60,
    breakSeconds: hasSessions ? 0 : (attendance.totalBreakMinutes || 0) * 60,
    lunchSeconds: hasSessions ? 0 : (attendance.totalLunchMinutes || 0) * 60,
  };

  if (hasSessions) {
    attendance.sessions.forEach(session => {
      const seconds = getSessionElapsedSeconds(session, now);
      if (session.type === 'WORK') totals.workSeconds += seconds;
      if (session.type === 'BREAK') totals.breakSeconds += seconds;
      if (session.type === 'LUNCH') totals.lunchSeconds += seconds;
    });
  }

  return {
    ...totals,
    workMinutes: Math.floor(totals.workSeconds / 60),
    breakMinutes: Math.floor(totals.breakSeconds / 60),
    lunchMinutes: Math.floor(totals.lunchSeconds / 60),
    totalRestMinutes: Math.floor((totals.breakSeconds + totals.lunchSeconds) / 60),
    totalRestSeconds: totals.breakSeconds + totals.lunchSeconds,
  };
};

export const formatDuration = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  return `${hours}h ${mins}m`;
};

export const formatDurationSeconds = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return `${hours}h ${mins}m ${secs}s`;
};
