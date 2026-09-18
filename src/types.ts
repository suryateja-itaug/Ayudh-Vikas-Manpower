export type UserRole =
  | 'candidate'
  | 'employee'
  | 'staff'
  | 'hr_admin'
  | 'ops_admin'
  | 'director_admin'
  | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  qualification: string;
  graduation: string;
  skills: string[];
  experienceYears: number;
  preferredJob: string;
  preferredLocation: string;
  address: string;
  resumeUrl?: string;
  documentUrls?: string[];
  registrationStatus: 'PENDING_PAYMENT' | 'ACTIVE';
  registrationScope?: 'ALL_JOBS' | 'AV_JOBS';
  passwordHash?: string;
  detailedExperience?: string;
  esicNumber?: string;
  pfAccountNumber?: string;
  governmentDocumentType?: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE' | 'VOTER_ID' | 'PASSPORT';
  governmentDocumentNumber?: string;
  governmentDocumentUrl?: string;
  avRegistrationCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManpowerRegistration {
  id: string;
  candidateId: string;
  userId: string;
  amount: number; // 10
  paymentOrderId: string;
  paymentTransactionId: string;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  registrationDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  jobId?: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  purpose: 'CANDIDATE_REGISTRATION' | 'JOB_APPLICATION';
  amount: number;
  currency: 'INR';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  jobId?: string;
  jobTitle?: string;
  transactionId?: string;
  verifiedAt?: string;
  createdAt: string;
}

export type JobCategory = 'AV_JOB' | 'ALL_JOB';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT' | 'ARCHIVED';

export interface ManpowerJob {
  id: string;
  title: string;
  department: string;
  jobCategory: JobCategory;
  classification: 'IT' | 'NON_IT' | 'HEALTHCARE' | 'FACILITY' | 'OFFICE' | 'SECURITY' | 'LOGISTICS' | 'OTHER';
  companyName: string;
  description: string;
  qualification: string;
  graduationRequired: boolean;
  skills: string[];
  experienceRequirement: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'SHIFT_BASED';
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: 'MONTHLY' | 'ANNUAL';
  openings: number;
  responsibilities: string[];
  requiredDocuments: string[];
  applicationDeadline: string;
  status: JobStatus;
  wasReopened: boolean;
  reopenedAt?: string;
  notifiedApplicantsCount?: number;
  totalApplicantsCount?: number;
  previousApplicantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

export interface ManpowerApplication {
  id: string;
  candidateId: string;
  userId: string;
  jobId: string;
  jobCategory: JobCategory;
  appliedDate: string;
  resumeUrl?: string;
  applicationStatus: ApplicationStatus;
  notes?: string;
  adminRemarks?: string;
  rejectionReason?: string;
  staffReviewStatus?: 'PENDING' | 'STAFF_APPROVED' | 'STAFF_REJECTED';
  staffReviewedBy?: string;
  staffReviewedAt?: string;
  paymentMode?: 'ONLINE' | 'CASH';
  paymentMarkedBy?: string;
  candidate?: CandidateProfile;
  job?: ManpowerJob;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalLevel = 1 | 2 | 3;
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface JobApproval {
  id: string;
  applicationId: string;
  candidateId: string;
  userId: string;
  jobId: string;
  level: ApprovalLevel;
  levelName: 'LEVEL_1_HR' | 'LEVEL_2_OPERATIONS' | 'LEVEL_3_DIRECTOR';
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  status: ApprovalStatus;
  remarks?: string;
  decidedAt?: string;
}

export interface ApprovalStep {
  level: number;
  roleTitle: string;
  approverName?: string;
  approverRole?: string;
  status: ApprovalStatus;
  remarks?: string;
  decidedAt?: string;
}

export interface JobConfirmationApproval {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  candidateMobile?: string;
  jobId: string;
  jobTitle: string;
  department: string;
  salaryOffered: number;
  currentLevel: number;
  overallStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  levels: ApprovalStep[];
  approvalRecordIds: { [level: number]: string };
}

export interface ApprovalPipeline {
  applicationId: string;
  candidate?: CandidateProfile;
  job?: ManpowerJob;
  levels: JobApproval[];
  overallStatus: 'CONFIRMED' | 'REJECTED' | 'PENDING';
}

export interface ManpowerEmployee {
  id: string;
  employeeId: string; // e.g. "AV-EMP-2026-0042"
  userId: string;
  candidateId: string;
  applicationId?: string;
  jobId: string;
  fullName: string;
  email: string;
  mobile: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED';
  basicSalary: number;
  idCardIssued: boolean;
  appointmentLetterIssued: boolean;
  todayStatus?: string;
  currentActivity?: string;
  createdAt: string;
}

export type DutyActivity = 'OFF_DUTY' | 'WORKING' | 'BREAK' | 'LUNCH';

export interface AttendanceSession {
  id: string;
  type: 'WORK' | 'BREAK' | 'LUNCH';
  startTime: string;
  endTime?: string;
  durationMinutes: number;
}

export interface EmployeeAttendance {
  id: string;
  employeeId: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  dutyStatus: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY' | 'OFF';
  currentActivity: DutyActivity;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalLunchMinutes: number;
  sessions: AttendanceSession[];
}

export interface EmployeeLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedBy?: string;
  reviewRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeComplaint {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: 'DUTY' | 'SALARY' | 'FACILITY' | 'HARASSMENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachmentUrl?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePersonalNote {
  id: string;
  employeeId: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCommunication {
  id: string;
  employeeId: string;
  employeeName: string;
  subject: string;
  message: string;
  category: 'DUTY_UPDATE' | 'PERSONAL_SITUATION' | 'OPERATIONAL' | 'CLARIFICATION';
  attachmentUrl?: string;
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  readByAdmin: boolean;
  readByEmployee: boolean;
  createdAt: string;
}

export interface EmployeeSalary {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  netPay: number;
  paymentStatus: 'PAID' | 'PROCESSING' | 'PENDING';
  paymentDate?: string;
  paySlipUrl?: string;
}

export interface EmployeeIdCard {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  cardCode: string;
  qrCodeData: string;
  issueDate: string;
  validUntil: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface AppointmentLetter {
  id: string;
  employeeId: string;
  employeeName: string;
  refNo: string;
  issuedDate: string;
  joiningDate: string;
  department: string;
  designation: string;
  salary: number;
  terms: string[];
  authorizedSignatory: string;
  signatoryTitle: string;
}

export interface ManpowerNotification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type:
    | 'APPLICATION_SUBMITTED'
    | 'STATUS_CHANGED'
    | 'INTERVIEW_SCHEDULED'
    | 'JOB_REOPENED'
    | 'PREVIOUS_APPLICANT_RECALL'
    | 'LEAVE_STATUS'
    | 'COMPLAINT_UPDATE'
    | 'COMMUNICATION'
    | 'APPROVAL_REQUIRED'
    | 'OFFICIALLY_CONFIRMED';
  linkUrl: string;
  isRead: boolean;
  deliveryChannel: 'IN_APP' | 'EMAIL' | 'SMS';
  metadata?: Record<string, any>;
  createdAt: string;
}
