import {
  AppointmentLetter,
  CandidateProfile,
  EmployeeAttendance,
  EmployeeCommunication,
  EmployeeComplaint,
  EmployeeIdCard,
  EmployeeLeave,
  EmployeePersonalNote,
  EmployeeSalary,
  JobApproval,
  ManpowerApplication,
  ManpowerEmployee,
  ManpowerNotification,
  ManpowerRegistration,
  PaymentOrder,
  User,
} from '../types';
import { getSampleJobById, getSampleJobs, sampleJobs } from './sampleJobs';

const now = new Date().toISOString();
const today = new Date().toISOString().slice(0, 10);

const toLocalDateTime = (date: string, time: string) => `${date}T${time}`;
const getCurrentIso = () => new Date().toISOString();
const getCurrentDate = () => new Date().toISOString().slice(0, 10);
const diffMinutes = (start?: string, end?: string) => {
  if (!start || !end) return 0;

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 0;

  return Math.max(0, Math.floor((endTime - startTime) / 60000));
};

const users: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Dr. Ramesh Chandra',
    email: 'admin@ayudhvikas.org',
    mobile: '9849012345',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_emp_01',
    name: 'Vikram Singh',
    email: 'vikram.singh@ayudhvikas.org',
    mobile: '9123456789',
    role: 'employee',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_staff_01',
    name: 'Kavya Rao',
    email: 'staff@ayudhvikas.org',
    mobile: '9849012348',
    role: 'staff',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_cand_01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '9876543210',
    role: 'candidate',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_cand_02',
    name: 'Anita Reddy',
    email: 'anita.reddy@example.com',
    mobile: '9848123456',
    role: 'candidate',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const candidateProfiles: CandidateProfile[] = [
  {
    id: 'prof_cand_01',
    userId: 'usr_cand_01',
    fullName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    dob: '1998-05-14',
    qualification: 'Graduate',
    graduation: 'B.Com Computer Applications',
    skills: ['MS Office', 'Data Entry', 'Tally', 'Customer Support'],
    experienceYears: 2,
    preferredJob: 'Office Assistant',
    preferredLocation: 'Hyderabad',
    address: 'Ameerpet, Hyderabad, Telangana',
    resumeUrl: '/documents/resumes/rahul-sharma.pdf',
    registrationStatus: 'ACTIVE',
    registrationScope: 'AV_JOBS',
    passwordHash: 'Candidate@123',
    detailedExperience: '2 years in office support and data entry.',
    esicNumber: 'ESIC987654321',
    pfAccountNumber: 'PFHYD123456',
    governmentDocumentType: 'AADHAAR',
    governmentDocumentNumber: 'XXXX-XXXX-4321',
    governmentDocumentUrl: '/documents/identity/rahul-sharma-aadhaar.pdf',
    documentVerificationStatus: 'VERIFIED',
    documentVerificationRemarks: 'AADHAAR reference reviewed in demo data.',
    documentVerifiedBy: 'Dr. Ramesh Chandra',
    documentVerifiedAt: '2026-02-01T11:05:00.000Z',
    avRegistrationCompletedAt: '2026-02-01T09:05:00.000Z',
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'prof_cand_02',
    userId: 'usr_cand_02',
    fullName: 'Anita Reddy',
    mobile: '9848123456',
    email: 'anita.reddy@example.com',
    dob: '1999-08-22',
    qualification: 'Diploma',
    graduation: 'Caregiver Certificate',
    skills: ['Patient Assistance', 'Vitals Support', 'First Aid'],
    experienceYears: 3,
    preferredJob: 'Healthcare Support Staff',
    preferredLocation: 'Secunderabad',
    address: 'Tarnaka, Secunderabad, Telangana',
    resumeUrl: '/documents/resumes/anita-reddy.pdf',
    registrationStatus: 'ACTIVE',
    registrationScope: 'AV_JOBS',
    passwordHash: 'Candidate@123',
    detailedExperience: '3 years in patient assistance and caregiver support.',
    esicNumber: 'ESIC984812345',
    pfAccountNumber: 'PFSEC984812',
    governmentDocumentType: 'PAN',
    governmentDocumentNumber: 'ABCDE1234F',
    governmentDocumentUrl: '/documents/identity/anita-reddy-pan.pdf',
    documentVerificationStatus: 'PENDING',
    avRegistrationCompletedAt: '2026-02-05T09:05:00.000Z',
    createdAt: '2026-02-05T09:00:00.000Z',
    updatedAt: now,
  },
];

const registrations: ManpowerRegistration[] = [
  {
    id: 'reg_cand_01',
    candidateId: 'prof_cand_01',
    userId: 'usr_cand_01',
    amount: 10,
    paymentOrderId: 'order_mock_01',
    paymentTransactionId: 'TXN_STATIC_001',
    paymentStatus: 'SUCCESS',
    registrationDate: '2026-02-01T09:10:00.000Z',
    status: 'ACTIVE',
    jobId: 'job_av_02',
  },
];

const employee: ManpowerEmployee = {
  id: 'emp_01',
  employeeId: 'AV-EMP-2026-0042',
  userId: 'usr_emp_01',
  candidateId: 'prof_emp_01',
  applicationId: 'app_emp_01',
  jobId: 'job_av_02',
  fullName: 'Vikram Singh',
  email: 'vikram.singh@ayudhvikas.org',
  mobile: '9123456789',
  department: 'Security & Facility Operations',
  designation: 'Facility Operations Supervisor',
  joiningDate: '2026-01-10',
  status: 'ACTIVE',
  basicSalary: 26000,
  idCardIssued: true,
  appointmentLetterIssued: true,
  todayStatus: 'PRESENT',
  currentActivity: 'WORKING',
  createdAt: '2026-01-10T09:00:00.000Z',
};

const employees: ManpowerEmployee[] = [
  employee,
  {
    ...employee,
    id: 'emp_02',
    employeeId: 'AV-EMP-2026-0043',
    fullName: 'Priya Narayanan',
    email: 'priya.narayanan@ayudhvikas.org',
    mobile: '9848123457',
    department: 'Administration',
    designation: 'Administrative Associate',
    basicSalary: 28000,
    todayStatus: 'PRESENT',
    currentActivity: 'OFF_DUTY',
  },
  {
    ...employee,
    id: 'emp_03',
    employeeId: 'AV-EMP-2026-0044',
    fullName: 'Mohammed Arshad',
    email: 'm.arshad@ayudhvikas.org',
    mobile: '9848234568',
    department: 'Logistics',
    designation: 'Fleet Driver',
    basicSalary: 24000,
    todayStatus: 'ON_LEAVE',
    currentActivity: 'OFF_DUTY',
  },
];

const attendance: EmployeeAttendance[] = [
  {
    id: 'att_today',
    employeeId: employee.employeeId,
    date: today,
    clockInTime: toLocalDateTime(today, '09:03:00'),
    dutyStatus: 'PRESENT',
    currentActivity: 'WORKING',
    totalWorkMinutes: 245,
    totalBreakMinutes: 15,
    totalLunchMinutes: 40,
    sessions: [
      {
        id: 'sess_work_01',
        type: 'WORK',
        startTime: toLocalDateTime(today, '09:03:00'),
        durationMinutes: 245,
      },
    ],
  },
  {
    id: 'att_yesterday',
    employeeId: employee.employeeId,
    date: '2026-09-15',
    clockInTime: toLocalDateTime('2026-09-15', '09:00:00'),
    clockOutTime: toLocalDateTime('2026-09-15', '18:05:00'),
    dutyStatus: 'PRESENT',
    currentActivity: 'OFF_DUTY',
    totalWorkMinutes: 480,
    totalBreakMinutes: 20,
    totalLunchMinutes: 45,
    sessions: [],
  },
];

const applications: ManpowerApplication[] = [
  {
    id: 'app_cand_01',
    candidateId: 'prof_cand_01',
    userId: 'usr_cand_01',
    jobId: 'job_av_02',
    jobCategory: 'AV_JOB',
    appliedDate: '2026-09-01T10:00:00.000Z',
    applicationStatus: 'SHORTLISTED',
    notes: 'Strong office administration experience.',
    candidate: candidateProfiles[0],
    job: getSampleJobById('job_av_02') || sampleJobs[0],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'app_cand_02',
    candidateId: 'prof_cand_02',
    userId: 'usr_cand_02',
    jobId: 'job_av_03',
    jobCategory: 'AV_JOB',
    appliedDate: '2026-09-02T10:00:00.000Z',
    applicationStatus: 'SELECTED',
    notes: 'Selected for final approval.',
    candidate: candidateProfiles[1],
    job: getSampleJobById('job_av_03') || sampleJobs[1],
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'app_all_01',
    candidateId: 'prof_cand_01',
    userId: 'usr_cand_01',
    jobId: 'job_all_01',
    jobCategory: 'ALL_JOB',
    appliedDate: '2026-09-05T10:00:00.000Z',
    applicationStatus: 'UNDER_REVIEW',
    notes: 'Interested in desktop support role.',
    candidate: candidateProfiles[0],
    job: getSampleJobById('job_all_01') || sampleJobs[2],
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: now,
  },
];

const approvals: JobApproval[] = [
  {
    id: 'appr_l1',
    applicationId: 'app_cand_02',
    candidateId: 'prof_cand_02',
    userId: 'usr_cand_02',
    jobId: 'job_av_03',
    level: 1,
    levelName: 'LEVEL_1_HR',
    approverId: 'usr_admin_01',
    approverName: 'Sunita Sharma',
    approverRole: 'HR Lead',
    status: 'APPROVED',
    remarks: 'Documents verified.',
    decidedAt: '2026-09-03T10:00:00.000Z',
  },
  {
    id: 'appr_l2',
    applicationId: 'app_cand_02',
    candidateId: 'prof_cand_02',
    userId: 'usr_cand_02',
    jobId: 'job_av_03',
    level: 2,
    levelName: 'LEVEL_2_OPERATIONS',
    approverId: 'usr_admin_01',
    approverName: 'Manoj Kumar',
    approverRole: 'Operations Head',
    status: 'PENDING',
  },
  {
    id: 'appr_l3',
    applicationId: 'app_cand_02',
    candidateId: 'prof_cand_02',
    userId: 'usr_cand_02',
    jobId: 'job_av_03',
    level: 3,
    levelName: 'LEVEL_3_DIRECTOR',
    approverId: 'usr_admin_01',
    approverName: 'Dr. Ramesh Chandra',
    approverRole: 'Director',
    status: 'PENDING',
  },
];

let notes: EmployeePersonalNote[] = [
  {
    id: 'note_01',
    employeeId: employee.employeeId,
    title: 'Gate duty checklist',
    content: 'Verify visitor pass register and fire extinguisher seal at the start of shift.',
    color: 'emerald',
    createdAt: now,
    updatedAt: now,
  },
];

let leaves: EmployeeLeave[] = [
  {
    id: 'leave_01',
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    leaveType: 'CASUAL',
    startDate: '2026-09-22',
    endDate: '2026-09-23',
    totalDays: 2,
    reason: 'Family function',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  },
];

let complaints: EmployeeComplaint[] = [
  {
    id: 'comp_01',
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    title: 'Biometric reader delay',
    description: 'Gate 2 scanner is slow during morning check-in.',
    category: 'FACILITY',
    priority: 'MEDIUM',
    status: 'IN_REVIEW',
    adminResponse: 'Maintenance team assigned.',
    createdAt: now,
    updatedAt: now,
  },
];

let communications: EmployeeCommunication[] = [
  {
    id: 'comm_01',
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    subject: 'Sunday health camp duty',
    message: 'I can take the opening shift for the health camp.',
    category: 'DUTY_UPDATE',
    reply: 'Confirmed. Report at 7 AM.',
    repliedBy: 'Operations Head',
    repliedAt: now,
    readByAdmin: true,
    readByEmployee: true,
    createdAt: now,
  },
];

const salaries: EmployeeSalary[] = [
  {
    id: 'sal_01',
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    month: '2026-08',
    basicPay: 18000,
    hra: 4500,
    allowances: 3500,
    deductions: 1200,
    netPay: 24800,
    paymentStatus: 'PAID',
    paymentDate: '2026-09-01',
    paySlipUrl: '/documents/mock-payslip.pdf',
  },
  {
    id: 'sal_02',
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    month: '2026-09',
    basicPay: 18000,
    hra: 4500,
    allowances: 3500,
    deductions: 0,
    netPay: 26000,
    paymentStatus: 'PROCESSING',
  },
];

const idCard: EmployeeIdCard = {
  id: 'idc_01',
  employeeId: employee.employeeId,
  employeeName: employee.fullName,
  department: employee.department,
  designation: employee.designation,
  joiningDate: employee.joiningDate,
  cardCode: 'AVF-SEC-0042',
  qrCodeData: 'https://ayudhvikas.org/verify/AV-EMP-2026-0042',
  issueDate: '2026-01-11',
  validUntil: '2029-01-10',
  status: 'ACTIVE',
};

const appointmentLetter: AppointmentLetter = {
  id: 'appt_01',
  employeeId: employee.employeeId,
  employeeName: employee.fullName,
  refNo: 'AVF/2026/MANPOWER/APPT-0042',
  issuedDate: '2026-01-10',
  joiningDate: employee.joiningDate,
  department: employee.department,
  designation: employee.designation,
  salary: employee.basicSalary,
  terms: [
    'Follow assigned duty roster and workplace safety standards.',
    'Maintain confidentiality of operational records.',
    'Employment is subject to attendance and conduct review.',
  ],
  authorizedSignatory: 'Dr. Ramesh Chandra',
  signatoryTitle: 'Managing Director',
};

const createEmptyTodayAttendance = (): EmployeeAttendance => ({
  id: `att_${getCurrentDate()}`,
  employeeId: employee.employeeId,
  date: getCurrentDate(),
  dutyStatus: 'ABSENT',
  currentActivity: 'OFF_DUTY',
  totalWorkMinutes: 0,
  totalBreakMinutes: 0,
  totalLunchMinutes: 0,
  sessions: [],
});

const getTodayAttendanceRecord = () => {
  const currentDate = getCurrentDate();
  let todayRecord = attendance.find(item => item.employeeId === employee.employeeId && item.date === currentDate);

  if (!todayRecord) {
    todayRecord = createEmptyTodayAttendance();
    attendance.unshift(todayRecord);
  }

  return todayRecord;
};

const closeActiveAttendanceSession = (record: EmployeeAttendance, endedAt: string) => {
  const activeSession = record.sessions.find(session => !session.endTime);

  if (!activeSession) return null;

  const previousDuration = activeSession.durationMinutes || 0;
  activeSession.endTime = endedAt;
  activeSession.durationMinutes = diffMinutes(activeSession.startTime, endedAt);
  const additionalMinutes = Math.max(0, activeSession.durationMinutes - previousDuration);

  if (activeSession.type === 'WORK') record.totalWorkMinutes += additionalMinutes;
  if (activeSession.type === 'BREAK') record.totalBreakMinutes += additionalMinutes;
  if (activeSession.type === 'LUNCH') record.totalLunchMinutes += additionalMinutes;

  return activeSession;
};

const startAttendanceSession = (record: EmployeeAttendance, type: 'WORK' | 'BREAK' | 'LUNCH', startedAt: string) => {
  record.sessions.push({
    id: nextId(`sess_${type.toLowerCase()}`),
    type,
    startTime: startedAt,
    durationMinutes: 0,
  });
};

let notifications: ManpowerNotification[] = [
  {
    id: 'notif_01',
    recipientUserId: 'usr_admin_01',
    title: 'Approval Pending',
    message: 'Healthcare Support Staff candidate is waiting for Level 2 approval.',
    type: 'APPROVAL_REQUIRED',
    linkUrl: '/manpower/admin/approvals',
    isRead: false,
    deliveryChannel: 'IN_APP',
    createdAt: now,
  },
  {
    id: 'notif_02',
    recipientUserId: 'usr_emp_01',
    title: 'Duty Started',
    message: 'Your attendance for today is marked as PRESENT.',
    type: 'STATUS_CHANGED',
    linkUrl: '/manpower/employee/attendance',
    isRead: false,
    deliveryChannel: 'IN_APP',
    createdAt: now,
  },
];

const paymentOrders: PaymentOrder[] = [];

const demoPasswords: Record<string, string> = {
  usr_admin_01: 'Admin@123',
  usr_emp_01: 'Employee@123',
  usr_staff_01: 'Staff@123',
  usr_cand_01: 'Candidate@123',
  usr_cand_02: 'Candidate@123',
};

function currentUser(token: string | null) {
  return users.find(u => u.id === token);
}

function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      total: items.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function mockApiRequest<T>(endpoint: string, options: RequestInit = {}, token: string | null): T | undefined {
  const method = (options.method || 'GET').toUpperCase();
  const [pathname, queryString = ''] = endpoint.split('?');
  const query = new URLSearchParams(queryString);
  const user = currentUser(token);
  const candidateProfile = user ? candidateProfiles.find(p => p.userId === user.id) : undefined;

  if (pathname === '/auth/available-users') {
    return {
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        username: u.role === 'candidate' ? u.mobile : u.email,
        password: demoPasswords[u.id] || 'Password@123',
        role: u.role,
        label: `${u.role.replace('_', ' ')} demo persona`,
      })),
    } as T;
  }

  if (pathname === '/auth/me') {
    if (!user) return undefined;
    const profile = candidateProfiles.find(p => p.userId === user.id);
    const emp = employees.find(e => e.userId === user.id);
    const registration = profile ? registrations.find(r => r.candidateId === profile.id && r.status === 'ACTIVE') : undefined;
    return {
      user,
      candidateProfile: profile,
      employeeRecord: emp,
      isRegisteredCandidate: Boolean(registration || profile?.registrationStatus === 'ACTIVE'),
      registration,
    } as T;
  }

  if (pathname === '/auth/login' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}'));
    const loginId = String(body.mobile || body.username || body.email || '').trim().toLowerCase();
    const matchedUser = loginId
      ? users.find(u => u.email.toLowerCase() === loginId || u.mobile === loginId)
      : users.find(u => u.role === body.role);
    if (!matchedUser) return undefined;
    if (matchedUser.isActive === false) return undefined;
    const profile = candidateProfiles.find(p => p.userId === matchedUser.id);
    const expectedPassword = matchedUser.passwordHash || profile?.passwordHash || demoPasswords[matchedUser.id];
    if (!body.password || (expectedPassword && expectedPassword !== body.password)) return undefined;
    return {
      token: matchedUser.id,
      user: matchedUser,
      candidateProfile: profile,
      employeeRecord: employees.find(e => e.userId === matchedUser.id),
    } as T;
  }

  if (pathname === '/jobs') {
    let jobs = getSampleJobs(query.get('category') as any);
    const search = query.get('search')?.toLowerCase();
    if (search) {
      jobs = jobs.filter(job => `${job.title} ${job.companyName} ${job.department} ${job.description}`.toLowerCase().includes(search));
    }
    const page = Number(query.get('page') || 1);
    const limit = Number(query.get('limit') || 20);
    const { items, pagination } = paginate(jobs, page, limit);
    return { jobs: items, pagination } as T;
  }

  if (pathname.startsWith('/jobs/')) {
    const id = pathname.split('/').pop() || '';
    const job = getSampleJobById(id);
    return job ? ({ job } as T) : undefined;
  }

  if (pathname === '/candidate/register' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}'));
    const existingUser = user?.role === 'candidate'
      ? user
      : users.find(u => u.mobile === body.mobile || u.email.toLowerCase() === String(body.email || '').toLowerCase());
    const candidateUser = existingUser || {
      id: nextId('usr_cand'),
      name: body.fullName,
      email: body.email || `${body.mobile}@candidate.local`,
      mobile: body.mobile,
      role: 'candidate' as const,
      createdAt: now,
    };
    if (!existingUser) users.push(candidateUser);
    const existingProfile = candidateProfiles.find(p => p.userId === candidateUser.id);
    const profile: CandidateProfile = {
      ...(existingProfile || candidateProfile),
      ...body,
      id: existingProfile?.id || nextId('prof'),
      userId: candidateUser.id,
      fullName: body.fullName || candidateUser.name,
      mobile: body.mobile || candidateUser.mobile,
      email: body.email || candidateUser.email,
      skills: Array.isArray(body.skills) ? body.skills : [],
      registrationStatus: body.paymentMode === 'CASH' ? 'ACTIVE' : 'PENDING_PAYMENT',
      registrationScope: body.registrationScope || 'ALL_JOBS',
      updatedAt: now,
    };
    if (!existingProfile) candidateProfiles.push(profile);
    const activeRegistration = registrations.find(r => r.candidateId === profile.id && r.status === 'ACTIVE');
    if (activeRegistration || body.paymentMode === 'CASH') {
      if (!activeRegistration) {
        registrations.push({
          id: nextId('reg'),
          candidateId: profile.id,
          userId: candidateUser.id,
          amount: 10,
          paymentOrderId: nextId('order_cash'),
          paymentTransactionId: nextId('cash'),
          paymentStatus: 'SUCCESS',
          registrationDate: now,
          status: 'ACTIVE',
        });
      }
      return { message: 'Candidate registered in static demo mode.', profile, paymentOrder: null } as T;
    }
    const order: PaymentOrder = {
      id: nextId('order'),
      userId: candidateUser.id,
      purpose: 'CANDIDATE_REGISTRATION',
      amount: 10,
      currency: 'INR',
      status: 'PENDING',
      jobId: body.jobId,
      jobTitle: body.jobId ? getSampleJobById(body.jobId)?.title : undefined,
      createdAt: now,
    };
    paymentOrders.push(order);
    return {
      message: 'Mock payment order generated.',
      profile,
      paymentOrder: {
        orderId: order.id,
        amount: 10,
        currency: 'INR',
        candidateName: profile.fullName,
        mobile: profile.mobile,
        jobId: order.jobId,
        jobTitle: order.jobTitle,
      },
    } as T;
  }

  if (pathname === '/candidate/payment/verify' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}'));
    const order = paymentOrders.find(o => o.id === body.orderId) || paymentOrders[paymentOrders.length - 1];
    const job = order?.jobId ? getSampleJobById(order.jobId) : undefined;
    const registration: ManpowerRegistration = {
      id: nextId('reg'),
      candidateId: candidateProfile.id,
      userId: user.id,
      amount: 10,
      paymentOrderId: order?.id || nextId('order'),
      paymentTransactionId: body.transactionId || nextId('txn'),
      paymentStatus: 'SUCCESS',
      registrationDate: now,
      status: 'ACTIVE',
      jobId: job?.id,
    };
    registrations.push(registration);
    const application = job
      ? {
          id: nextId('app'),
          candidateId: candidateProfile.id,
          userId: user.id,
          jobId: job.id,
          jobCategory: job.jobCategory,
          appliedDate: now,
          applicationStatus: 'APPLIED',
          notes: 'Static deployment application submitted after Rs.10 mock payment.',
          candidate: candidateProfile,
          job,
          createdAt: now,
          updatedAt: now,
        } as ManpowerApplication
      : undefined;
    if (application) applications.unshift(application);
    return { success: true, message: 'Payment verified in static demo mode.', registration, profile: candidateProfile, application } as T;
  }

  if (pathname === '/candidate/applications') {
    return { applications: applications.filter(a => a.userId === user.id || user.role === 'admin') } as T;
  }

  if (pathname === '/staff/av-applications') {
    return { applications: applications.filter(a => a.jobCategory === 'AV_JOB') } as T;
  }

  if (pathname.startsWith('/staff/av-applications/') && pathname.endsWith('/review') && method === 'POST') {
    const id = pathname.split('/')[3];
    const body = JSON.parse(String(options.body || '{}'));
    const application = applications.find(a => a.id === id);
    if (!application) return undefined;
    application.staffReviewStatus = body.action === 'APPROVE' ? 'STAFF_APPROVED' : 'STAFF_REJECTED';
    application.staffReviewedBy = user.id;
    application.staffReviewedAt = now;
    application.updatedAt = now;
    return { message: 'Staff review saved in static demo mode.', application } as T;
  }

  if (pathname === '/admin/applications/bulk-status' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}'));
    const ids = Array.isArray(body.ids) ? body.ids : [];
    const updated = applications.filter(app => ids.includes(app.id));
    updated.forEach(app => {
      app.applicationStatus = body.status || app.applicationStatus;
      app.adminRemarks = body.remarks || app.adminRemarks;
      app.updatedAt = getCurrentIso();
    });
    return { message: `${updated.length} application(s) updated in static demo mode.`, applications: updated } as T;
  }

  if (pathname.startsWith('/admin/applications/') && pathname.endsWith('/status') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const body = JSON.parse(String(options.body || '{}'));
    const application = applications.find(a => a.id === id);
    if (!application) return undefined;
    application.applicationStatus = body.status || application.applicationStatus;
    application.adminRemarks = body.remarks || application.adminRemarks;
    application.rejectionReason = body.rejectionReason || application.rejectionReason;
    application.updatedAt = getCurrentIso();
    return { message: `Application status updated to ${application.applicationStatus}.`, application } as T;
  }

  if (pathname.startsWith('/admin/applications/') && method === 'GET') {
    const category = pathname.endsWith('/all') ? 'ALL_JOB' : 'AV_JOB';
    const page = Number(query.get('page') || 1);
    const limit = Number(query.get('limit') || 20);
    const { items, pagination } = paginate(applications.filter(a => a.jobCategory === category), page, limit);
    return { applications: items, pagination } as T;
  }

  if (pathname === '/admin/applications/search') {
    const { items, pagination } = paginate(applications, Number(query.get('page') || 1), Number(query.get('limit') || 20));
    return { totalMatched: applications.length, results: items, pagination } as T;
  }

  if (pathname === '/admin/approvals') {
    return {
      approvalPipelines: [
        {
          applicationId: 'app_cand_02',
          candidate: candidateProfiles[1],
          job: getSampleJobById('job_av_03'),
          levels: approvals,
          overallStatus: 'PENDING',
        },
      ],
    } as T;
  }

  if (pathname === '/admin/stats') {
    return {
      kpis: {
        totalCandidates: candidateProfiles.length + 84,
        activeRegistrations: registrations.length,
        registrationRevenue: registrations.length * 10,
        avApplications: applications.filter(a => a.jobCategory === 'AV_JOB').length,
        allJobApplications: applications.filter(a => a.jobCategory === 'ALL_JOB').length,
        openAvJobs: getSampleJobs('AV_JOB').length,
        openAllJobs: getSampleJobs('ALL_JOB').length,
        shortlisted: applications.filter(a => a.applicationStatus === 'SHORTLISTED').length,
        interviews: 3,
        selected: applications.filter(a => a.applicationStatus === 'SELECTED').length,
        confirmedEmployees: employees.length,
        presentToday: 2,
        currentlyOnDuty: attendance.filter(a => a.date === today && a.currentActivity === 'WORKING').length,
        pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
        openComplaints: complaints.filter(c => c.status !== 'RESOLVED').length,
        pendingStaffReviews: applications.filter(a => a.jobCategory === 'AV_JOB' && (!a.staffReviewStatus || a.staffReviewStatus === 'PENDING')).length,
        documentMissingCount: candidateProfiles.filter(p => p.registrationScope === 'AV_JOBS' && (!p.governmentDocumentUrl || p.documentVerificationStatus === 'NEEDS_CORRECTION' || p.documentVerificationStatus === 'REJECTED')).length,
        todayWalkIns: applications.filter(a => a.paymentMode === 'CASH' && a.createdAt?.slice(0, 10) === today).length,
        pendingInterviews: applications.filter(a => a.applicationStatus === 'INTERVIEW').length,
      },
      funnel: [
        { stage: 'Applied', count: 86 },
        { stage: 'Under Review', count: 24 },
        { stage: 'Shortlisted', count: 12 },
        { stage: 'Selected', count: 5 },
        { stage: 'Confirmed', count: employees.length },
      ],
      categorySplit: [
        { name: 'AV Jobs', applications: 54, openPositions: getSampleJobs('AV_JOB').length },
        { name: 'All Jobs', applications: 32, openPositions: getSampleJobs('ALL_JOB').length },
      ],
      qualificationChart: [
        { name: '10th / SSC', count: 20 },
        { name: 'Intermediate', count: 28 },
        { name: 'Graduate', count: 38 },
      ],
      applicationTrends: [
        { period: 'Aug', av: 34, all: 18 },
        { period: 'Sep', av: 54, all: 32 },
      ],
      reopenedJobs: [],
    } as T;
  }

  if (pathname === '/employee/me') {
    return { employee, todayAttendance: getTodayAttendanceRecord(), leaveBalance: { casual: 8, sick: 6, earned: 12 } } as T;
  }

  if (pathname === '/employee/attendance/history') return { history: attendance } as T;
  if (pathname === '/admin/attendance') return { attendances: attendance.map(a => ({ ...a, employeeName: employee.fullName })) } as T;
  if (pathname === '/employee/leaves' || pathname === '/admin/leaves') return { leaves } as T;
  if (pathname === '/employee/complaints' || pathname === '/admin/complaints') return { complaints } as T;
  if (pathname === '/employee/notes') return { notes } as T;
  if (pathname === '/employee/communication' || pathname === '/admin/communication') return { communications } as T;
  if (pathname === '/employee/salary') return { salaries } as T;
  if (pathname === '/employee/id-card') return { idCard, employee } as T;
  if (pathname === '/employee/appointment-letter') return { appointmentLetter, employee } as T;
  if (pathname === '/admin/employees') return { employees } as T;

  if (pathname === '/admin/users' && method === 'GET') {
    const portalUsers = users
      .filter(u => u.role !== 'candidate')
      .map(u => ({
        ...u,
        isActive: u.isActive !== false,
        employeeRecord: employees.find(e => e.userId === u.id),
      }));
    return { users: portalUsers } as T;
  }

  if (pathname === '/admin/users' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}'));
    const allowedRoles = ['admin', 'director_admin', 'hr_admin', 'ops_admin', 'staff', 'employee'];
    if (!body.name || !body.email || !body.mobile || !body.role || !body.password || !allowedRoles.includes(body.role)) {
      return undefined;
    }
    if (users.some(u => u.email.toLowerCase() === String(body.email).toLowerCase() || u.mobile === String(body.mobile))) {
      return undefined;
    }
    const createdAt = getCurrentIso();
    const createdUser: User = {
      id: nextId(`usr_${body.role}`),
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      role: body.role,
      passwordHash: body.password,
      isActive: true,
      createdAt,
    };
    users.unshift(createdUser);

    let createdEmployee: ManpowerEmployee | undefined;
    if (body.role === 'employee') {
      createdEmployee = {
        id: nextId('emp'),
        employeeId: `AV-EMP-2026-${String(employees.length + 42).padStart(4, '0')}`,
        userId: createdUser.id,
        candidateId: '',
        jobId: '',
        fullName: body.name,
        email: body.email,
        mobile: body.mobile,
        department: body.department || 'Operations',
        designation: body.designation || 'Operations Associate',
        joiningDate: getCurrentDate(),
        status: 'ACTIVE',
        basicSalary: Number(body.basicSalary) || 18000,
        idCardIssued: false,
        appointmentLetterIssued: false,
        createdAt,
      };
      employees.unshift(createdEmployee);
    }
    return { message: `${String(body.role).replace('_', ' ')} account created in static demo mode.`, user: createdUser, employee: createdEmployee } as T;
  }

  if (pathname.startsWith('/admin/users/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const body = JSON.parse(String(options.body || '{}'));
    const target = users.find(u => u.id === id);
    if (!target || target.role === 'candidate') return undefined;
    if (body.name) target.name = body.name;
    if (body.email) target.email = body.email;
    if (body.mobile) target.mobile = body.mobile;
    if (body.role) target.role = body.role;
    if (body.password) target.passwordHash = body.password;
    if (typeof body.isActive === 'boolean') target.isActive = body.isActive;
    const emp = employees.find(e => e.userId === target.id);
    if (emp) {
      emp.fullName = target.name;
      emp.email = target.email;
      emp.mobile = target.mobile;
    }
    return { message: 'User updated in static demo mode.', user: target, employee: emp } as T;
  }

  if (pathname === '/notifications') {
    const list = notifications.filter(n => n.recipientUserId === user.id || user.role === 'admin');
    return { notifications: list, unreadCount: list.filter(n => !n.isRead).length } as T;
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    if (pathname === '/employee/attendance/action' && method === 'POST') {
      const body = JSON.parse(String(options.body || '{}'));
      const action = body.action as 'CLOCK_IN' | 'BREAK' | 'LUNCH' | 'RESUME' | 'CLOCK_OUT';
      const record = getTodayAttendanceRecord();
      const timestamp = getCurrentIso();

      if (action === 'CLOCK_IN') {
        if (record.currentActivity !== 'OFF_DUTY') {
          return { message: 'You are already clocked in for duty.', attendance: record } as T;
        }
        if (record.clockInTime && record.clockOutTime) {
          return { message: 'Today\'s shift is already completed. Clock in is available again tomorrow.', attendance: record } as T;
        }

        record.clockInTime = timestamp;
        record.clockOutTime = undefined;
        record.totalWorkMinutes = 0;
        record.totalBreakMinutes = 0;
        record.totalLunchMinutes = 0;
        record.sessions = [];
        record.dutyStatus = 'PRESENT';
        record.currentActivity = 'WORKING';
        startAttendanceSession(record, 'WORK', timestamp);

        return { message: 'Clock in recorded successfully.', attendance: record } as T;
      }

      if (action === 'BREAK' || action === 'LUNCH') {
        if (record.currentActivity !== 'WORKING') {
          return { message: 'Start or resume active work before taking a break.', attendance: record } as T;
        }

        closeActiveAttendanceSession(record, timestamp);
        record.currentActivity = action;
        startAttendanceSession(record, action, timestamp);

        return {
          message: action === 'BREAK' ? 'Short break started.' : 'Lunch recess started.',
          attendance: record,
        } as T;
      }

      if (action === 'RESUME') {
        if (record.currentActivity !== 'BREAK' && record.currentActivity !== 'LUNCH') {
          return { message: 'There is no active break to resume from.', attendance: record } as T;
        }

        closeActiveAttendanceSession(record, timestamp);
        record.currentActivity = 'WORKING';
        startAttendanceSession(record, 'WORK', timestamp);

        return { message: 'Duty resumed successfully.', attendance: record } as T;
      }

      if (action === 'CLOCK_OUT') {
        if (record.currentActivity === 'OFF_DUTY') {
          return { message: 'You are already clocked out.', attendance: record } as T;
        }

        closeActiveAttendanceSession(record, timestamp);
        record.clockOutTime = timestamp;
        record.currentActivity = 'OFF_DUTY';

        return { message: 'Clock out recorded and shift finalized.', attendance: record } as T;
      }
    }

    if (pathname === '/employee/notes' && method === 'POST') {
      const body = JSON.parse(String(options.body || '{}'));
      const note = { id: nextId('note'), employeeId: employee.employeeId, title: body.title || 'Note', content: body.content || '', color: body.color || 'emerald', createdAt: now, updatedAt: now };
      notes.unshift(note);
      return { note } as T;
    }
    if (pathname === '/employee/leaves' && method === 'POST') {
      const body = JSON.parse(String(options.body || '{}'));
      const leave = { id: nextId('leave'), employeeId: employee.employeeId, employeeName: employee.fullName, leaveType: body.leaveType || 'CASUAL', startDate: body.startDate || today, endDate: body.endDate || today, totalDays: Number(body.totalDays || 1), reason: body.reason || 'Personal', status: 'PENDING', createdAt: now, updatedAt: now } as EmployeeLeave;
      leaves.unshift(leave);
      return { message: 'Leave submitted in static demo mode.', leave } as T;
    }
    if (pathname === '/employee/complaints' && method === 'POST') {
      const body = JSON.parse(String(options.body || '{}'));
      const complaint = { id: nextId('comp'), employeeId: employee.employeeId, employeeName: employee.fullName, title: body.title || 'Complaint', description: body.description || '', category: body.category || 'OTHER', priority: body.priority || 'MEDIUM', status: 'OPEN', createdAt: now, updatedAt: now } as EmployeeComplaint;
      complaints.unshift(complaint);
      return { message: 'Complaint submitted in static demo mode.', complaint } as T;
    }
    if (pathname === '/employee/communication' && method === 'POST') {
      const body = JSON.parse(String(options.body || '{}'));
      const communication = { id: nextId('comm'), employeeId: employee.employeeId, employeeName: employee.fullName, subject: body.subject || 'Update', message: body.message || '', category: body.category || 'DUTY_UPDATE', readByAdmin: false, readByEmployee: true, createdAt: now } as EmployeeCommunication;
      communications.unshift(communication);
      return { message: 'Communication sent in static demo mode.', communication } as T;
    }
    return { success: true, message: 'Static demo action completed.' } as T;
  }

  if (pathname.startsWith('/admin/candidate/') && pathname.endsWith('/document-verification') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const body = JSON.parse(String(options.body || '{}'));
    const profile = candidateProfiles.find(p => p.id === id || p.userId === id);
    if (!profile) return undefined;
    profile.documentVerificationStatus = body.status || 'PENDING';
    profile.documentVerificationRemarks = body.remarks || '';
    profile.documentVerifiedBy = user?.name || user?.id;
    profile.documentVerifiedAt = getCurrentIso();
    profile.updatedAt = profile.documentVerifiedAt;
    return { message: 'Document verification updated in static demo mode.', profile } as T;
  }

  if (pathname.startsWith('/admin/candidate/') && pathname.endsWith('/history')) {
    const id = pathname.split('/')[3];
    const profile = candidateProfiles.find(p => p.id === id || p.userId === id);
    if (!profile) return undefined;
    const profileUser = users.find(u => u.id === profile.userId);
    const profileApplications = applications.filter(a => a.candidateId === profile.id || a.userId === profile.userId);
    const profileNotifications = notifications.filter(n => n.recipientUserId === profile.userId);
    const employeeRecord = employees.find(e => e.candidateId === profile.id || e.userId === profile.userId);
    return { profile, user: profileUser, applications: profileApplications, notifications: profileNotifications, employeeRecord, approvals } as T;
  }

  return undefined;
}
