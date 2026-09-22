import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
  const headers = Object.keys(rows[0] || { message: 'No records found' });
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<{
    stats?: any;
    avApplications: any[];
    allApplications: any[];
    employees: any[];
    attendance: any[];
    leaves: any[];
  }>({
    avApplications: [],
    allApplications: [],
    employees: [],
    attendance: [],
    leaves: [],
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const [stats, av, all, employees, attendance, leaves] = await Promise.all([
        api.getAdminStats(),
        api.getAdminApplications('av'),
        api.getAdminApplications('all'),
        api.getAdminEmployees(),
        api.getAdminAllAttendance(),
        api.getAdminAllLeaves(),
      ]);
      setData({
        stats,
        avApplications: av.applications || [],
        allApplications: all.applications || [],
        employees: employees.employees || [],
        attendance: attendance.attendances || [],
        leaves: leaves.leaves || [],
      });
    } catch (err: any) {
      setMessage(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const reportCards = useMemo(() => ([
    {
      title: 'AV Applications',
      count: data.avApplications.length,
      description: 'Candidate profiles submitted for Foundation internal roles.',
      action: () => downloadCsv('av-applications-report.csv', data.avApplications.map(app => ({
        candidate: app.candidate?.fullName,
        mobile: app.candidate?.mobile,
        email: app.candidate?.email,
        qualification: app.candidate?.qualification,
        documentStatus: app.candidate?.documentVerificationStatus || 'PENDING',
        hiringStatus: app.applicationStatus,
        appliedDate: app.appliedDate,
      }))),
    },
    {
      title: 'Partner Applications',
      count: data.allApplications.length,
      description: 'External organization job submissions and status updates.',
      action: () => downloadCsv('partner-applications-report.csv', data.allApplications.map(app => ({
        candidate: app.candidate?.fullName,
        mobile: app.candidate?.mobile,
        job: app.job?.title,
        partner: app.job?.companyName,
        status: app.applicationStatus,
        appliedDate: app.appliedDate,
      }))),
    },
    {
      title: 'Employee Roster',
      count: data.employees.length,
      description: 'Active employee and staff directory with departments.',
      action: () => downloadCsv('employee-roster-report.csv', data.employees.map(emp => ({
        employeeId: emp.employeeId,
        name: emp.fullName,
        email: emp.email,
        mobile: emp.mobile,
        department: emp.department,
        designation: emp.designation,
        status: emp.status,
        joiningDate: emp.joiningDate,
      }))),
    },
    {
      title: 'Attendance',
      count: data.attendance.length,
      description: 'Duty status, working hours, and clock activity logs.',
      action: () => downloadCsv('attendance-report.csv', data.attendance.map(att => ({
        employeeId: att.employeeId,
        employeeName: att.employeeName,
        date: att.date,
        dutyStatus: att.dutyStatus,
        currentActivity: att.currentActivity,
        clockInTime: att.clockInTime,
        clockOutTime: att.clockOutTime,
        totalWorkMinutes: att.totalWorkMinutes,
      }))),
    },
    {
      title: 'Leave Requests',
      count: data.leaves.length,
      description: 'Leave request status, reasons, and approval remarks.',
      action: () => downloadCsv('leave-report.csv', data.leaves.map(leave => ({
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        status: leave.status,
        reason: leave.reason,
      }))),
    },
  ]), [data]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
            <BarChart3 className="w-4 h-4" />
            Data Exports
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Reports & Downloads</h1>
          <p className="mt-1 text-sm text-slate-500">Download clean CSV reports for application review, workforce, attendance, and leave operations.</p>
        </div>
        <button onClick={loadReports} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Total Candidates" value={data.stats?.kpis?.totalCandidates || 0} />
        <Metric label="AV Applications" value={data.stats?.kpis?.avApplications || data.avApplications.length} />
        <Metric label="Partner Applications" value={data.stats?.kpis?.allJobApplications || data.allApplications.length} />
        <Metric label="On Duty Now" value={data.stats?.kpis?.currentlyOnDuty || 0} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCards.map(card => (
          <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-950">{card.count}</span>
            </div>
            <h2 className="mt-4 text-base font-black text-slate-950">{card.title}</h2>
            <p className="mt-1 min-h-[40px] text-xs leading-relaxed text-slate-500">{card.description}</p>
            <button onClick={card.action} disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-900/5">
    <div className="text-2xl font-black text-slate-950">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
  </div>
);
