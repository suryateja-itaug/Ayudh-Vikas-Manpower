import {
  User,
  CandidateProfile,
  ManpowerRegistration,
  ManpowerJob,
  ManpowerApplication,
  ApprovalPipeline,
  ApprovalStep,
  JobConfirmationApproval,
  ManpowerEmployee,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeComplaint,
  EmployeePersonalNote,
  EmployeeCommunication,
  EmployeeSalary,
  EmployeeIdCard,
  AppointmentLetter,
  ManpowerNotification,
} from '../types';
import { mockApiRequest } from '../data/mockApi';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;
  private readonly tokenKey = 'av_manpower_token';

  public setToken(token: string | null) {
    this.token = token;
    localStorage.removeItem(this.tokenKey);
    if (token) {
      sessionStorage.setItem(this.tokenKey, token);
    } else {
      sessionStorage.removeItem(this.tokenKey);
    }
  }

  public getToken(): string | null {
    if (!this.token) {
      localStorage.removeItem(this.tokenKey);
      this.token = sessionStorage.getItem(this.tokenKey);
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const text = await response.text();
      const looksLikeHtml = text.trim().startsWith('<');
      if (looksLikeHtml) {
        const fallback = mockApiRequest<T>(endpoint, options, token);
        if (fallback !== undefined) return fallback;
        throw new Error('API returned HTML instead of JSON.');
      }

      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        const fallback = mockApiRequest<T>(endpoint, options, token);
        if (fallback !== undefined) return fallback;
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err) {
      const fallback = mockApiRequest<T>(endpoint, options, token);
      if (fallback !== undefined) return fallback;
      throw err;
    }
  }

  // Auth
  public async getAvailableUsers() {
    return this.request<{ users: any[] }>('/auth/available-users');
  }

  public async login(emailOrRole: { email?: string; mobile?: string; username?: string; password?: string; role?: string }) {
    return this.request<{
      token: string;
      user: User;
      candidateProfile?: CandidateProfile;
      employeeRecord?: ManpowerEmployee;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(emailOrRole),
    });
  }

  public async getMe() {
    return this.request<{
      user: User;
      candidateProfile?: CandidateProfile;
      employeeRecord?: ManpowerEmployee;
      isRegisteredCandidate: boolean;
      registration?: ManpowerRegistration;
    }>('/auth/me');
  }

  // Candidate Registration & Payment
  public async registerCandidate(data: Partial<CandidateProfile> & { jobId?: string; password?: string; registrationScope?: 'ALL_JOBS' | 'AV_JOBS'; paymentMode?: 'ONLINE' | 'CASH' }) {
    return this.request<{
      message: string;
      profile: CandidateProfile;
      application?: ManpowerApplication;
      paymentOrder: {
        orderId: string;
        amount: number;
        currency: string;
        candidateName: string;
        mobile: string;
        jobId?: string;
        jobTitle?: string;
      } | null;
    }>('/candidate/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async verifyPayment(orderId: string, transactionId?: string) {
    return this.request<{
      success: boolean;
      message: string;
      registration: ManpowerRegistration;
      profile: CandidateProfile;
      application?: ManpowerApplication;
    }>('/candidate/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, transactionId }),
    });
  }

  // Jobs
  public async getJobs(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<{
      jobs: ManpowerJob[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/jobs?${query.toString()}`);
  }

  public async getJobById(id: string) {
    return this.request<{ job: ManpowerJob }>(`/jobs/${id}`);
  }

  public async createJob(jobData: Partial<ManpowerJob>) {
    return this.request<{ message: string; job: ManpowerJob }>('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  public async updateJob(id: string, jobData: Partial<ManpowerJob>) {
    return this.request<{ message: string; job: ManpowerJob }>(`/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  public async updateJobStatus(id: string, status: string) {
    return this.request<{ message: string; job: ManpowerJob }>(`/admin/jobs/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  public async archiveJob(id: string) {
    return this.request<{ message: string; job: ManpowerJob }>(`/admin/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Previous Applicant Recall
  public async getPreviousApplicants(jobId: string) {
    return this.request<{
      jobId: string;
      jobTitle: string;
      count: number;
      applicants: any[];
    }>(`/admin/jobs/${jobId}/previous-applicants`);
  }

  public async notifyPreviousApplicants(jobId: string) {
    return this.request<{
      success: boolean;
      message: string;
      notifiedCount: number;
      totalApplicantsFound: number;
      jobTitle: string;
    }>(`/admin/jobs/${jobId}/notify-applicants`, {
      method: 'POST',
    });
  }

  // Applications
  public async applyForJob(jobId: string, notes?: string) {
    return this.request<{
      message: string;
      application: ManpowerApplication;
      jobTitle: string;
    }>('/applications/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, notes }),
    });
  }

  public async getCandidateApplications() {
    return this.request<{ applications: ManpowerApplication[] }>('/candidate/applications');
  }

  public async getStaffAvApplications() {
    return this.request<{ applications: ManpowerApplication[] }>('/staff/av-applications');
  }

  public async reviewStaffAvApplication(id: string, data: { action: 'APPROVE' | 'REJECT'; remarks?: string }) {
    return this.request<{ message: string; application: ManpowerApplication }>(`/staff/av-applications/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getAdminApplications(category: 'av' | 'all', params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<{
      applications: ManpowerApplication[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/applications/${category}?${query.toString()}`);
  }

  public async searchHistoricalApplications(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<{
      totalMatched: number;
      results: ManpowerApplication[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/applications/search?${query.toString()}`);
  }

  public async updateApplicationStatus(id: string, status: string, remarks?: string, rejectionReason?: string) {
    return this.request<{ message: string; application: ManpowerApplication }>(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks, rejectionReason }),
    });
  }

  public async getCandidateHistory(candidateId: string) {
    return this.request<{
      profile: CandidateProfile;
      user?: User;
      applications: ManpowerApplication[];
      notifications: ManpowerNotification[];
      employeeRecord?: ManpowerEmployee;
      approvals: any[];
    }>(`/admin/candidate/${candidateId}/history`);
  }

  // 3-Level Approvals
  public async getApprovals() {
    const res = await this.request<{ approvalPipelines: ApprovalPipeline[] }>('/admin/approvals');
    const transformed: JobConfirmationApproval[] = (res.approvalPipelines || []).map(p => {
      const l1 = p.levels?.find(l => l.level === 1);
      const l2 = p.levels?.find(l => l.level === 2);
      const l3 = p.levels?.find(l => l.level === 3);

      let currentLevel = 1;
      if (l1?.status === 'APPROVED' && l2?.status !== 'APPROVED') currentLevel = 2;
      else if (l1?.status === 'APPROVED' && l2?.status === 'APPROVED' && l3?.status !== 'APPROVED') currentLevel = 3;

      return {
        id: p.applicationId,
        applicationId: p.applicationId,
        candidateId: p.candidate?.id || '',
        candidateName: p.candidate?.fullName || 'Candidate',
        candidateEmail: p.candidate?.email,
        candidateMobile: p.candidate?.mobile,
        jobId: p.job?.id || '',
        jobTitle: p.job?.title || 'Position',
        department: p.job?.department || 'Operations',
        salaryOffered: p.job?.salaryMin || 22000,
        currentLevel,
        overallStatus: p.overallStatus === 'CONFIRMED' ? 'APPROVED' : (p.overallStatus as any),
        levels: [
          {
            level: 1,
            roleTitle: 'HR Recruitment Executive',
            approverName: l1?.approverName,
            approverRole: l1?.approverRole,
            status: l1?.status || 'PENDING',
            remarks: l1?.remarks,
            decidedAt: l1?.decidedAt,
          },
          {
            level: 2,
            roleTitle: 'Operations & Regional Lead',
            approverName: l2?.approverName,
            approverRole: l2?.approverRole,
            status: l2?.status || 'PENDING',
            remarks: l2?.remarks,
            decidedAt: l2?.decidedAt,
          },
          {
            level: 3,
            roleTitle: 'Managing Director & Final Executive',
            approverName: l3?.approverName,
            approverRole: l3?.approverRole,
            status: l3?.status || 'PENDING',
            remarks: l3?.remarks,
            decidedAt: l3?.decidedAt,
          },
        ],
        approvalRecordIds: {
          1: l1?.id || '',
          2: l2?.id || '',
          3: l3?.id || '',
        },
      };
    });

    return {
      approvalPipelines: res.approvalPipelines,
      approvals: transformed,
    };
  }

  public async decideApproval(approvalId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    return this.request<{
      message: string;
      approval: any;
      allApproved: boolean;
      newEmployee?: ManpowerEmployee;
    }>(`/admin/approvals/${approvalId}/decide`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    });
  }

  public async processApprovalStep(
    approvalIdOrAppId: string,
    data: { level?: number; action: 'APPROVE' | 'REJECT'; remarks?: string }
  ) {
    let targetStepId = approvalIdOrAppId;
    const approvalsRes = await this.getApprovals();
    const item = approvalsRes.approvals.find(a => a.id === approvalIdOrAppId || a.applicationId === approvalIdOrAppId);
    if (item && data.level && item.approvalRecordIds[data.level]) {
      targetStepId = item.approvalRecordIds[data.level];
    }
    const decidedStatus: 'APPROVED' | 'REJECTED' = data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const res = await this.decideApproval(targetStepId, decidedStatus, data.remarks);
    return {
      ...res,
      isFullyApproved: res.allApproved,
      message: res.message,
    };
  }

  public async searchCandidates(params: {
    query?: string;
    qualification?: string;
    graduationRequired?: boolean;
    status?: string;
    location?: string;
  } = {}) {
    const historical = await this.searchHistoricalApplications({
      query: params.query,
      qualification: params.qualification,
      status: params.status,
      location: params.location,
    });
    // Extract unique candidate profiles
    const map = new Map<string, CandidateProfile>();
    historical.results.forEach(app => {
      if (app.candidate && !map.has(app.candidate.id)) {
        if (params.graduationRequired !== undefined) {
          const isGrad = app.candidate.qualification?.toLowerCase().includes('grad') ||
            app.candidate.graduation?.toLowerCase().includes('grad') ||
            app.candidate.qualification?.toLowerCase().includes('b.tech') ||
            app.candidate.qualification?.toLowerCase().includes('post');
          if (params.graduationRequired && !isGrad) return;
          if (!params.graduationRequired && isGrad) return;
        }
        map.set(app.candidate.id, app.candidate);
      }
    });
    const candidates = Array.from(map.values());
    return {
      candidates,
      totalMatches: candidates.length,
    };
  }

  // Employee Portal
  public async getEmployeeMe() {
    return this.request<{
      employee: ManpowerEmployee;
      todayAttendance: EmployeeAttendance;
      leaveBalance: { casual: number; sick: number; earned: number };
    }>('/employee/me');
  }

  public async recordAttendanceAction(action: 'CLOCK_IN' | 'BREAK' | 'LUNCH' | 'RESUME' | 'CLOCK_OUT') {
    return this.request<{
      message: string;
      attendance: EmployeeAttendance;
    }>('/employee/attendance/action', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  public async getAttendanceHistory() {
    return this.request<{ history: EmployeeAttendance[] }>('/employee/attendance/history');
  }

  public async getEmployeeLeaves() {
    return this.request<{ leaves: EmployeeLeave[] }>('/employee/leaves');
  }

  public async submitLeave(data: Partial<EmployeeLeave>) {
    return this.request<{ message: string; leave: EmployeeLeave }>('/employee/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getAdminLeaves() {
    return this.request<{ leaves: EmployeeLeave[] }>('/admin/leaves');
  }

  public async getAdminAllLeaves() {
    return this.getAdminLeaves();
  }

  public async updateLeaveStatus(id: string, status: string, remarks?: string) {
    return this.request<{ message: string; leave: EmployeeLeave }>(`/admin/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    });
  }

  public async reviewLeave(id: string, data: { action: 'APPROVE' | 'REJECT'; remarks?: string }) {
    return this.updateLeaveStatus(id, data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED', data.remarks);
  }

  // Complaints
  public async getEmployeeComplaints() {
    return this.request<{ complaints: EmployeeComplaint[] }>('/employee/complaints');
  }

  public async submitComplaint(data: Partial<EmployeeComplaint>) {
    return this.request<{ message: string; complaint: EmployeeComplaint }>('/employee/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getAdminComplaints() {
    return this.request<{ complaints: EmployeeComplaint[] }>('/admin/complaints');
  }

  public async getAdminAllComplaints() {
    return this.getAdminComplaints();
  }

  public async updateComplaint(id: string, status: string, adminResponse?: string) {
    return this.request<{ message: string; complaint: EmployeeComplaint }>(`/admin/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminResponse }),
    });
  }

  public async resolveComplaint(id: string, response: string) {
    return this.updateComplaint(id, 'RESOLVED', response);
  }

  // Admin Attendance
  public async getAdminAllAttendance(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<{ attendances: EmployeeAttendance[] }>(`/admin/attendance${query}`);
  }

  // Personal Notes
  public async getPersonalNotes() {
    return this.request<{ notes: EmployeePersonalNote[] }>('/employee/notes');
  }

  public async createPersonalNote(note: Partial<EmployeePersonalNote>) {
    return this.request<{ note: EmployeePersonalNote }>('/employee/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  public async deletePersonalNote(id: string) {
    return this.request<{ success: boolean }>(`/employee/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Communication Notes
  public async getEmployeeCommunications() {
    return this.request<{ communications: EmployeeCommunication[] }>('/employee/communication');
  }

  public async sendCommunication(comm: Partial<EmployeeCommunication>) {
    return this.request<{ message: string; communication: EmployeeCommunication }>('/employee/communication', {
      method: 'POST',
      body: JSON.stringify(comm),
    });
  }

  public async getAdminCommunications() {
    return this.request<{ communications: EmployeeCommunication[] }>('/admin/communication');
  }

  public async replyToCommunication(id: string, reply: string) {
    return this.request<{ message: string; communication: EmployeeCommunication }>(`/admin/communication/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  }

  // Salary
  public async getSalaries() {
    return this.request<{ salaries: EmployeeSalary[] }>('/employee/salary');
  }

  // Documents
  public async getIdCard() {
    return this.request<{ idCard: EmployeeIdCard; employee: ManpowerEmployee }>('/employee/id-card');
  }

  public async getAppointmentLetter() {
    return this.request<{ appointmentLetter: AppointmentLetter; employee: ManpowerEmployee }>('/employee/appointment-letter');
  }

  // Admin Employees Directory
  public async getAdminEmployees() {
    return this.request<{ employees: ManpowerEmployee[] }>('/admin/employees');
  }

  // Stats
  public async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  // Notifications
  public async getNotifications() {
    return this.request<{ notifications: ManpowerNotification[]; unreadCount: number }>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
