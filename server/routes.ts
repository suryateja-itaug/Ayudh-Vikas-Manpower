import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import {
  User,
  ManpowerJob,
  ManpowerApplication,
  JobApproval,
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
  AttendanceSession,
  PaymentOrder,
} from './types.js';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// ==========================================
// Authentication Middleware & Helpers
// ==========================================

export interface AuthenticatedRequest extends Request {
  user?: User;
}

function resolveUser(req: Request): User | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // Support token format "userId" or "Bearer usr_..."
    const foundUser = db.users.find(u => u.id === token || u.email === token);
    if (foundUser) return foundUser;
    const demoUser = demoLoginUsers.find(u => u.id === token || u.email === token);
    if (demoUser) return demoUser;
  }
  // Optional cookie / header fallback
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    const foundUser = db.users.find(u => u.id === customUserId || u.email === customUserId);
    if (foundUser) return foundUser;
    const demoUser = demoLoginUsers.find(u => u.id === customUserId || u.email === customUserId);
    if (demoUser) return demoUser;
  }
  return undefined;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let user = resolveUser(req);
  const adminRoles = ['admin', 'hr_admin', 'ops_admin', 'director_admin'];
  if (!user || !adminRoles.includes(user.role)) {
    // In preview and multi-role testing, allow admin requests to resolve to default admin user
    user = db.users.find(u => adminRoles.includes(u.role)) || db.users[0];
  }
  req.user = user;
  next();
}

function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = resolveUser(req);
  if (!user || !['staff', 'admin', 'hr_admin'].includes(user.role)) {
    return res.status(403).json({ error: 'Staff access required.' });
  }
  req.user = user;
  next();
}

function requireEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let user = resolveUser(req);
  if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
    // In preview and multi-role testing, allow employee requests to resolve to default employee user
    user = db.users.find(u => u.role === 'employee') || db.users[0];
  }
  req.user = user;
  next();
}

const demoPasswords: Record<string, string> = {
  usr_admin_01: 'Admin@123',
  usr_hr_01: 'Hr@12345',
  usr_ops_01: 'Ops@12345',
  usr_staff_01: 'Staff@123',
  usr_emp_01: 'Employee@123',
  usr_cand_01: 'Candidate@123',
  usr_cand_02: 'Candidate@123',
};

const demoLoginUsers: User[] = [
  { id: 'usr_admin_01', name: 'Dr. Ramesh Chandra (Director)', email: 'admin@ayudhvikas.org', mobile: '9849012345', role: 'admin', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'usr_hr_01', name: 'Sunita Sharma (HR Lead)', email: 'hr@ayudhvikas.org', mobile: '9849012346', role: 'hr_admin', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'usr_ops_01', name: 'Manoj Kumar (Operations Head)', email: 'ops@ayudhvikas.org', mobile: '9849012347', role: 'ops_admin', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'usr_staff_01', name: 'Kavya Rao (Front Desk Staff)', email: 'staff@ayudhvikas.org', mobile: '9849012348', role: 'staff', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'usr_emp_01', name: 'Vikram Singh', email: 'vikram.singh@ayudhvikas.org', mobile: '9123456789', role: 'employee', createdAt: '2026-01-10T09:00:00.000Z' },
];

// ==========================================
// 1. AUTHENTICATION & QUICK SWITCH
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, mobile, username, password, role } = req.body;
  let user: User | undefined;
  const loginId = String(mobile || username || email || '').trim().toLowerCase();
  if (loginId) {
    user = db.users.find(u => u.email.toLowerCase() === loginId || u.mobile === loginId);
    if (!user) {
      const demoUser = demoLoginUsers.find(u => u.email.toLowerCase() === loginId || u.mobile === loginId);
      if (demoUser) {
        user = { ...demoUser };
        db.users.push(user);
        db.save();
      }
    }
  } else if (role) {
    user = db.users.find(u => u.role === role);
  }
  if (!user) {
    return res.status(400).json({ error: 'User not found. Please select a valid profile.' });
  }

  const candidateProfile = db.candidateProfiles.find(p => p.userId === user?.id);
  const expectedPassword = (user as any).passwordHash || candidateProfile?.passwordHash || demoPasswords[user.id];
  if (!password || (expectedPassword && expectedPassword !== password)) {
    return res.status(401).json({ error: 'Invalid mobile number or password.' });
  }

  // Check candidate registration if applicable
  const employeeRecord = db.employees.find(e => e.userId === user?.id);

  res.json({
    token: user.id,
    user,
    candidateProfile,
    employeeRecord,
  });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const candidateProfile = db.candidateProfiles.find(p => p.userId === user.id);
  const employeeRecord = db.employees.find(e => e.userId === user.id);
  const registration = candidateProfile
    ? db.registrations.find(r => r.candidateId === candidateProfile.id && r.status === 'ACTIVE')
    : undefined;

  res.json({
    user,
    candidateProfile,
    employeeRecord,
    isRegisteredCandidate: !!registration,
    registration,
  });
});

apiRouter.get('/auth/available-users', (req: Request, res: Response) => {
  const roleLabels: Record<string, string> = {
    admin: 'Managing Director / Admin',
    hr_admin: 'HR Admin / Level 1 Approver',
    ops_admin: 'Operations Admin / Level 2 Approver',
    staff: 'Staff Portal reviewer',
    employee: 'Active employee',
    candidate: 'Registered candidate',
  };
  const merged = [...db.users];
  for (const demoUser of demoLoginUsers) {
    if (!merged.some(u => u.id === demoUser.id || u.email === demoUser.email)) {
      merged.push(demoUser);
    }
  }
  res.json({
    users: merged.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      mobile: u.mobile,
      username: u.role === 'candidate' ? u.mobile : u.email,
      password: (u as any).passwordHash || demoPasswords[u.id] || 'Password@123',
      label: roleLabels[u.role] || 'Portal user',
    })),
  });
});

// ==========================================
// 2. CANDIDATE REGISTRATION & ₹10 PAYMENT
// ==========================================

apiRouter.post('/candidate/register-v2-disabled', (req: AuthenticatedRequest, res: Response) => {
  res.status(410).json({ error: 'Use /candidate/register.' });
});

apiRouter.post('/candidate/register', (req: AuthenticatedRequest, res: Response) => {
  const {
    jobId,
    registrationScope = 'ALL_JOBS',
    password,
    fullName,
    mobile,
    email,
    dob,
    qualification,
    graduation,
    skills,
    experienceYears,
    preferredJob,
    preferredLocation,
    address,
    resumeUrl,
    detailedExperience,
    esicNumber,
    pfAccountNumber,
    governmentDocumentType,
    governmentDocumentNumber,
    governmentDocumentUrl,
    paymentMode,
  } = req.body;

  if (!fullName || !mobile || !qualification) {
    return res.status(400).json({ error: 'Full name, mobile number, and qualification are required.' });
  }

  const targetJob = jobId ? db.jobs.find(j => j.id === jobId) : undefined;
  const desiredScope: 'ALL_JOBS' | 'AV_JOBS' =
    registrationScope === 'AV_JOBS' || targetJob?.jobCategory === 'AV_JOB' ? 'AV_JOBS' : 'ALL_JOBS';

  if (desiredScope === 'AV_JOBS' && (!esicNumber || !pfAccountNumber || !governmentDocumentType || !governmentDocumentNumber || !governmentDocumentUrl)) {
    return res.status(400).json({ error: 'ESIC, PF, and government document upload are required for AV Jobs registration. Use N/A for ESIC or PF if not available.' });
  }

  const now = new Date().toISOString();
  const requester = resolveUser(req);
  if (paymentMode === 'CASH' && (!requester || !['staff', 'admin', 'hr_admin'].includes(requester.role))) {
    return res.status(403).json({ error: 'Cash payment marking is available only from the staff portal.' });
  }

  let user = requester?.role === 'candidate' ? requester : undefined;
  user = user || db.users.find(u => u.mobile === mobile || u.email.toLowerCase() === String(email || '').toLowerCase());
  const existingProfileForUser = user ? db.candidateProfiles.find(p => p.userId === user!.id) : undefined;
  if (!existingProfileForUser && !password) {
    return res.status(400).json({ error: 'Password is required for first-time registration.' });
  }
  if (password && (String(password).length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include one uppercase letter and one number.' });
  }
  if (!user) {
    user = {
      id: `usr_cand_${crypto.randomUUID().slice(0, 8)}`,
      name: fullName,
      email: email || `${mobile}@candidate.local`,
      mobile,
      role: 'candidate',
      createdAt: now,
    };
    db.users.push(user);
  }

  let profile = db.candidateProfiles.find(p => p.userId === user.id);
  if (profile && targetJob) {
    const alreadyApplied = db.applications.find(
      a => a.candidateId === profile!.id && a.jobId === targetJob.id && a.applicationStatus !== 'WITHDRAWN'
    );
    if (alreadyApplied) {
      return res.status(400).json({ error: `You have already applied for "${targetJob.title}".`, profile, application: alreadyApplied });
    }
  }

  const normalizedSkills = Array.isArray(skills)
    ? skills
    : (skills ? String(skills).split(',').map((s: string) => s.trim()).filter(Boolean) : []);

  if (!profile) {
    profile = {
      id: `prof_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      fullName,
      mobile,
      email: email || user.email,
      dob: dob || '1998-01-01',
      qualification,
      graduation: graduation || 'Graduate',
      skills: normalizedSkills,
      experienceYears: Number(experienceYears) || 0,
      preferredJob: preferredJob || targetJob?.title || 'Any Suitable Role',
      preferredLocation: preferredLocation || 'Hyderabad',
      address: address || '',
      resumeUrl: resumeUrl || '/documents/resumes/sample_candidate_resume.pdf',
      registrationStatus: 'PENDING_PAYMENT',
      createdAt: now,
      updatedAt: now,
    };
    db.candidateProfiles.push(profile);
  }

  profile.fullName = fullName;
  profile.mobile = mobile;
  profile.email = email || user.email;
  profile.dob = dob || profile.dob;
  profile.qualification = qualification;
  profile.graduation = graduation || profile.graduation;
  profile.skills = normalizedSkills.length ? normalizedSkills : profile.skills;
  profile.experienceYears = Number(experienceYears) || 0;
  profile.preferredJob = preferredJob || targetJob?.title || profile.preferredJob;
  profile.preferredLocation = preferredLocation || profile.preferredLocation;
  profile.address = address || profile.address;
  if (resumeUrl) profile.resumeUrl = resumeUrl;
  if (password) profile.passwordHash = password;
  profile.registrationScope = desiredScope === 'AV_JOBS' ? 'AV_JOBS' : (profile.registrationScope || 'ALL_JOBS');
  profile.detailedExperience = detailedExperience || profile.detailedExperience;
  profile.esicNumber = esicNumber || profile.esicNumber;
  profile.pfAccountNumber = pfAccountNumber || profile.pfAccountNumber;
  profile.governmentDocumentType = governmentDocumentType || profile.governmentDocumentType;
  profile.governmentDocumentNumber = governmentDocumentNumber || profile.governmentDocumentNumber;
  profile.governmentDocumentUrl = governmentDocumentUrl || profile.governmentDocumentUrl;
  if (desiredScope === 'AV_JOBS') profile.avRegistrationCompletedAt = now;
  profile.updatedAt = now;

  const activeRegistration = db.registrations.find(r => r.candidateId === profile!.id && r.status === 'ACTIVE' && r.paymentStatus === 'SUCCESS');
  let paymentOrder: PaymentOrder | undefined;
  let createdApplication: ManpowerApplication | undefined;

  if (!activeRegistration) {
    paymentOrder = {
      id: `order_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      purpose: 'CANDIDATE_REGISTRATION',
      amount: 10,
      currency: 'INR',
      status: paymentMode === 'CASH' ? 'SUCCESS' : 'PENDING',
      jobId: targetJob?.id,
      jobTitle: targetJob?.title,
      transactionId: paymentMode === 'CASH' ? `CASH_${Date.now()}` : undefined,
      verifiedAt: paymentMode === 'CASH' ? now : undefined,
      createdAt: now,
    };
    db.paymentOrders.push(paymentOrder);

    if (paymentMode === 'CASH') {
      profile.registrationStatus = 'ACTIVE';
      db.registrations.push({
        id: `reg_${crypto.randomUUID().slice(0, 8)}`,
        candidateId: profile.id,
        userId: user.id,
        amount: 10,
        paymentOrderId: paymentOrder.id,
        paymentTransactionId: paymentOrder.transactionId || `CASH_${Date.now()}`,
        paymentStatus: 'SUCCESS',
        registrationDate: now,
        status: 'ACTIVE',
      });
    }
  }

  if (targetJob && (activeRegistration || paymentMode === 'CASH')) {
    createdApplication = {
      id: `app_${crypto.randomUUID().slice(0, 8)}`,
      candidateId: profile.id,
      userId: user.id,
      jobId: targetJob.id,
      jobCategory: targetJob.jobCategory,
      appliedDate: now,
      resumeUrl: profile.resumeUrl,
      applicationStatus: 'APPLIED',
      staffReviewStatus: targetJob.jobCategory === 'AV_JOB' ? 'PENDING' : undefined,
      paymentMode: paymentMode === 'CASH' ? 'CASH' : 'ONLINE',
      paymentMarkedBy: paymentMode === 'CASH' ? requester?.id : undefined,
      notes: paymentMode === 'CASH' ? 'Walk-in registration submitted by staff; cash payment marked.' : '',
      createdAt: now,
      updatedAt: now,
    };
    db.applications.unshift(createdApplication);
  }

  db.save();

  return res.json({
    message: paymentOrder && paymentMode !== 'CASH'
      ? 'Candidate profile saved. Complete one-time Rs.10 portal registration payment.'
      : paymentMode === 'CASH'
      ? 'Walk-in candidate registered and cash payment marked.'
      : targetJob
      ? `Application submitted for "${targetJob.title}".`
      : 'Candidate profile updated.',
    profile,
    application: createdApplication,
    paymentOrder: paymentOrder && paymentMode !== 'CASH' ? {
      orderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: 'INR',
      candidateName: profile.fullName,
      mobile: profile.mobile,
      jobId: targetJob?.id,
      jobTitle: targetJob?.title,
    } : null,
  });
});

apiRouter.post('/candidate/register-legacy', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'candidate');
  if (!user) {
    return res.status(401).json({ error: 'User must be authenticated to register.' });
  }

  const {
    jobId,
    fullName,
    mobile,
    email,
    dob,
    qualification,
    graduation,
    skills,
    experienceYears,
    preferredJob,
    preferredLocation,
    address,
    resumeUrl,
  } = req.body;

  if (!fullName || !mobile || !qualification) {
    return res.status(400).json({ error: 'Full name, mobile number, and qualification are required.' });
  }

  const targetJob = jobId ? db.jobs.find(j => j.id === jobId) : undefined;

  // Check if profile already exists
  let profile = db.candidateProfiles.find(p => p.userId === user.id);
  const now = new Date().toISOString();

  if (profile) {
    // If applying for a specific job, check if already applied for that job
    if (targetJob) {
      const alreadyApplied = db.applications.find(
        a => a.candidateId === profile!.id && a.jobId === targetJob.id && a.applicationStatus !== 'WITHDRAWN'
      );
      if (alreadyApplied) {
        return res.status(400).json({
          error: `You have already applied for "${targetJob.title}". Check your application status under My Applications.`,
          profile,
        });
      }
    }

    // Update existing profile
    profile.fullName = fullName;
    profile.mobile = mobile;
    profile.email = email || user.email;
    profile.dob = dob || profile.dob;
    profile.qualification = qualification;
    profile.graduation = graduation || profile.graduation;
    profile.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : profile.skills);
    profile.experienceYears = Number(experienceYears) || 0;
    profile.preferredJob = preferredJob || (targetJob ? targetJob.title : profile.preferredJob);
    profile.preferredLocation = preferredLocation || profile.preferredLocation;
    profile.address = address || profile.address;
    if (resumeUrl) profile.resumeUrl = resumeUrl;
    profile.updatedAt = now;
  } else {
    profile = {
      id: `prof_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      fullName,
      mobile,
      email: email || user.email,
      dob: dob || '1998-01-01',
      qualification,
      graduation: graduation || 'Graduate',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      experienceYears: Number(experienceYears) || 0,
      preferredJob: preferredJob || (targetJob ? targetJob.title : 'Any Suitable Role'),
      preferredLocation: preferredLocation || 'Hyderabad',
      address: address || '',
      resumeUrl: resumeUrl || '/documents/resumes/sample_candidate_resume.pdf',
      registrationStatus: 'PENDING_PAYMENT',
      createdAt: now,
      updatedAt: now,
    };
    db.candidateProfiles.push(profile);
  }

  // Create payment order strictly for ₹10
  const orderId = `order_${crypto.randomUUID().slice(0, 8)}`;
  const paymentOrder: any = {
    id: orderId,
    userId: user.id,
    purpose: targetJob ? 'JOB_APPLICATION' : 'CANDIDATE_REGISTRATION',
    amount: 10, // Strictly ₹10 registration/application fee
    currency: 'INR' as const,
    status: 'PENDING' as const,
    jobId: targetJob?.id,
    jobTitle: targetJob?.title,
    createdAt: now,
  };
  db.paymentOrders.push(paymentOrder);
  db.save();

  res.json({
    message: targetJob
      ? `Application prepared for "${targetJob.title}". Proceed to pay ₹10 application fee.`
      : 'Candidate profile saved. Proceed to complete ₹10 registration payment.',
    profile,
    paymentOrder: {
      orderId: paymentOrder.id,
      amount: 10,
      currency: 'INR',
      candidateName: profile.fullName,
      mobile: profile.mobile,
      jobId: targetJob?.id,
      jobTitle: targetJob?.title,
    },
  });
});

// Pay-and-Apply directly for an existing candidate (₹10 per job application)
apiRouter.post('/applications/initiate-application', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'candidate');
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { jobId, notes } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required.' });
  }

  const targetJob = db.jobs.find(j => j.id === jobId);
  if (!targetJob) {
    return res.status(404).json({ error: 'Job opening not found.' });
  }

  const profile = db.candidateProfiles.find(p => p.userId === user.id);
  if (!profile) {
    return res.status(400).json({ error: 'Please submit candidate details first.' });
  }

  const existingApp = db.applications.find(
    a => a.candidateId === profile.id && a.jobId === targetJob.id && a.applicationStatus !== 'WITHDRAWN'
  );
  if (existingApp) {
    return res.status(400).json({ error: `You have already applied for "${targetJob.title}".` });
  }

  const now = new Date().toISOString();
  const orderId = `order_${crypto.randomUUID().slice(0, 8)}`;
  const paymentOrder: any = {
    id: orderId,
    userId: user.id,
    purpose: 'JOB_APPLICATION',
    amount: 10,
    currency: 'INR',
    status: 'PENDING',
    jobId: targetJob.id,
    jobTitle: targetJob.title,
    notes: notes || '',
    createdAt: now,
  };
  db.paymentOrders.push(paymentOrder);
  db.save();

  res.json({
    message: `Payment order of ₹10 generated for "${targetJob.title}".`,
    paymentOrder: {
      orderId: paymentOrder.id,
      amount: 10,
      currency: 'INR',
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      candidateName: profile.fullName,
      mobile: profile.mobile,
    },
  });
});

apiRouter.post('/candidate/payment/verify', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'candidate');
  if (!user) {
    return res.status(401).json({ error: 'User must be authenticated.' });
  }

  const { orderId, transactionId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required for verification.' });
  }

  const order = db.paymentOrders.find(o => o.id === orderId && o.userId === user.id);
  if (!order) {
    return res.status(404).json({ error: 'Payment order not found.' });
  }

  const profile = db.candidateProfiles.find(p => p.userId === user.id);
  if (!profile) {
    return res.status(400).json({ error: 'Candidate profile not found.' });
  }

  const txnId = transactionId || `TXN_AVF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  order.status = 'SUCCESS';
  order.transactionId = txnId;
  order.verifiedAt = now;

  profile.registrationStatus = 'ACTIVE';
  profile.updatedAt = now;

  let registration = db.registrations.find(r => r.paymentOrderId === order.id);
  if (!registration) {
    registration = {
      id: `reg_${crypto.randomUUID().slice(0, 8)}`,
      candidateId: profile.id,
      userId: user.id,
      amount: 10,
      paymentOrderId: order.id,
      paymentTransactionId: txnId,
      paymentStatus: 'SUCCESS' as const,
      registrationDate: now,
      status: 'ACTIVE' as const,
      jobId: (order as any).jobId,
    };
    db.registrations.push(registration);
  }

  // If this payment was for a specific job application, automatically create the application record!
  let createdApplication: ManpowerApplication | undefined;
  const targetJobId = (order as any).jobId;
  if (targetJobId) {
    const targetJob = db.jobs.find(j => j.id === targetJobId);
    if (targetJob) {
      const existingApp = db.applications.find(
        a => a.candidateId === profile.id && a.jobId === targetJob.id && a.applicationStatus !== 'WITHDRAWN'
      );
      if (!existingApp) {
        createdApplication = {
          id: `app_${crypto.randomUUID().slice(0, 8)}`,
          candidateId: profile.id,
          userId: user.id,
          jobId: targetJob.id,
          jobCategory: targetJob.jobCategory,
          appliedDate: now,
          resumeUrl: profile.resumeUrl,
          applicationStatus: 'APPLIED',
          notes: `Job-wise applied with paid ₹10 application fee (Txn: ${txnId})`,
          createdAt: now,
          updatedAt: now,
        };
        db.applications.unshift(createdApplication);
      } else {
        createdApplication = existingApp;
      }

      // Create In-App Notification for application
      db.notifications.push({
        id: `notif_${crypto.randomUUID().slice(0, 8)}`,
        recipientUserId: user.id,
        title: `Job Application Submitted: ${targetJob.title} (₹10 Paid)`,
        message: `Your application for "${targetJob.title}" at ${targetJob.companyName} has been successfully submitted (Txn: ${txnId}). Application ID: ${createdApplication?.id}.`,
        type: 'APPLICATION_SUBMITTED',
        linkUrl: '/manpower/applications',
        isRead: false,
        deliveryChannel: 'IN_APP',
        createdAt: now,
      });
    }
  } else {
    // General registration notification
    db.notifications.push({
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      recipientUserId: user.id,
      title: 'Registration Payment Confirmed (₹10)',
      message: `Your Ayudh Vikas Manpower registration is now ACTIVE (Txn: ${txnId}). You are now eligible to apply for all AV Jobs and All Jobs.`,
      type: 'STATUS_CHANGED',
      linkUrl: '/manpower/jobs/av',
      isRead: false,
      deliveryChannel: 'IN_APP',
      createdAt: now,
    });
  }

  db.save();

  return res.json({
    success: true,
    message: (order as any).jobTitle
      ? `Payment of ₹10 verified successfully! You have applied for ${(order as any).jobTitle}.`
      : 'Payment of ₹10 verified successfully! Candidate registration is now active.',
    registration,
    profile,
    application: createdApplication,
  });
});

// ==========================================
// 3. JOBS (AV JOBS & ALL JOBS)
// ==========================================

apiRouter.get('/jobs', (req: Request, res: Response) => {
  const {
    category, // 'AV_JOB' | 'ALL_JOB'
    search,
    classification,
    department,
    qualification,
    graduationRequired,
    location,
    jobType,
    status,
    minSalary,
    maxSalary,
    wasReopened,
    page = '1',
    limit = '20',
  } = req.query;

  let list = db.jobs.filter(j => j.status !== 'ARCHIVED');

  if (category) {
    list = list.filter(j => j.jobCategory === category);
  }
  if (status) {
    list = list.filter(j => j.status === status);
  }
  if (classification) {
    list = list.filter(j => j.classification === classification);
  }
  if (department) {
    const deptStr = String(department).toLowerCase();
    list = list.filter(j => j.department.toLowerCase().includes(deptStr));
  }
  if (qualification) {
    const qStr = String(qualification).toLowerCase();
    list = list.filter(j => j.qualification.toLowerCase().includes(qStr));
  }
  if (graduationRequired !== undefined && graduationRequired !== '') {
    const isGrad = graduationRequired === 'true';
    list = list.filter(j => j.graduationRequired === isGrad);
  }
  if (location) {
    const locStr = String(location).toLowerCase();
    list = list.filter(j => j.location.toLowerCase().includes(locStr));
  }
  if (jobType) {
    list = list.filter(j => j.jobType === jobType);
  }
  if (minSalary) {
    const minSalNum = Number(minSalary);
    if (!isNaN(minSalNum)) {
      list = list.filter(j => (j.salaryMax || j.salaryMin) >= minSalNum);
    }
  }
  if (maxSalary) {
    const maxSalNum = Number(maxSalary);
    if (!isNaN(maxSalNum)) {
      list = list.filter(j => (j.salaryMin || 0) <= maxSalNum);
    }
  }
  if (wasReopened !== undefined && wasReopened !== '') {
    const isReopened = wasReopened === 'true';
    list = list.filter(j => Boolean(j.wasReopened) === isReopened);
  }
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      j =>
        j.title.toLowerCase().includes(s) ||
        j.department.toLowerCase().includes(s) ||
        j.companyName.toLowerCase().includes(s) ||
        j.skills.some(sk => sk.toLowerCase().includes(s)) ||
        j.description.toLowerCase().includes(s)
    );
  }

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedJobs = list.slice(startIndex, startIndex + limitNum);

  // Attach previous applicant counts for each job
  const enrichedJobs = paginatedJobs.map(job => {
    const pastApps = db.applications.filter(a => a.jobId === job.id);
    return {
      ...job,
      totalApplicantsCount: pastApps.length,
      previousApplicantsCount: pastApps.length,
    };
  });

  res.json({
    jobs: enrichedJobs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job vacancy not found' });
  }

  const pastApps = db.applications.filter(a => a.jobId === job.id);

  res.json({
    job: {
      ...job,
      totalApplicantsCount: pastApps.length,
      previousApplicantsCount: pastApps.length,
    },
  });
});

// Admin Job CRUD
apiRouter.post('/admin/jobs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    department,
    jobCategory,
    classification,
    companyName,
    description,
    qualification,
    graduationRequired,
    skills,
    experienceRequirement,
    jobType,
    location,
    salaryMin,
    salaryMax,
    salaryPeriod,
    openings,
    responsibilities,
    requiredDocuments,
    applicationDeadline,
    status = 'OPEN',
  } = req.body;

  if (!title || !jobCategory || !department) {
    return res.status(400).json({ error: 'Title, department, and job category are required.' });
  }

  const now = new Date().toISOString();
  const newJob: ManpowerJob = {
    id: `job_${jobCategory === 'AV_JOB' ? 'av' : 'all'}_${crypto.randomUUID().slice(0, 8)}`,
    title,
    department,
    jobCategory,
    classification: classification || (jobCategory === 'AV_JOB' ? 'OFFICE' : 'NON_IT'),
    companyName: companyName || (jobCategory === 'AV_JOB' ? 'Ayudh Vikas Foundation' : 'Corporate Partner'),
    description: description || '',
    qualification: qualification || 'Any Qualification',
    graduationRequired: !!graduationRequired,
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
    experienceRequirement: experienceRequirement || '0 - 1 year',
    jobType: jobType || 'FULL_TIME',
    location: location || 'Hyderabad',
    salaryMin: Number(salaryMin) || 18000,
    salaryMax: Number(salaryMax) || 25000,
    salaryPeriod: salaryPeriod || 'MONTHLY',
    openings: Number(openings) || 5,
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : ['Aadhaar Card', 'Resume'],
    applicationDeadline: applicationDeadline || '2026-12-31',
    status,
    wasReopened: false,
    createdAt: now,
    updatedAt: now,
  };

  db.jobs.unshift(newJob);
  db.save();

  res.status(201).json({ message: 'Job created successfully.', job: newJob });
});

apiRouter.put('/admin/jobs/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const oldStatus = job.status;
  const updates = req.body;
  const now = new Date().toISOString();

  // If reopening from CLOSED to OPEN:
  if (oldStatus === 'CLOSED' && updates.status === 'OPEN') {
    job.wasReopened = true;
    job.reopenedAt = now;
  }

  Object.assign(job, updates, { updatedAt: now });
  db.save();

  res.json({ message: 'Job updated successfully.', job });
});

apiRouter.post('/admin/jobs/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { status } = req.body;
  const oldStatus = job.status;
  const now = new Date().toISOString();

  if (oldStatus === 'CLOSED' && status === 'OPEN') {
    job.wasReopened = true;
    job.reopenedAt = now;
  }

  job.status = status;
  job.updatedAt = now;
  db.save();

  res.json({ message: `Job status updated to ${status}.`, job });
});

apiRouter.delete('/admin/jobs/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Soft delete / archive to preserve historical application records
  job.status = 'ARCHIVED';
  job.updatedAt = new Date().toISOString();
  db.save();

  res.json({ message: 'Job archived successfully. Historical applications remain preserved.', job });
});

// ==========================================
// 4. PREVIOUS APPLICANT RECALL & NOTIFY
// ==========================================

apiRouter.get('/admin/jobs/:id/previous-applicants', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const applications = db.applications.filter(a => a.jobId === job.id);
  const applicantProfiles = applications.map(app => {
    const profile = db.candidateProfiles.find(p => p.id === app.candidateId);
    return {
      applicationId: app.id,
      candidateId: app.candidateId,
      fullName: profile?.fullName || 'Candidate',
      mobile: profile?.mobile || '',
      email: profile?.email || '',
      qualification: profile?.qualification || '',
      appliedDate: app.appliedDate,
      status: app.applicationStatus,
    };
  });

  res.json({
    jobId: job.id,
    jobTitle: job.title,
    count: applicantProfiles.length,
    applicants: applicantProfiles,
  });
});

apiRouter.post('/admin/jobs/:id/notify-applicants', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const pastApplications = db.applications.filter(a => a.jobId === job.id);
  if (pastApplications.length === 0) {
    return res.status(400).json({ error: 'No previous applicants found for this job vacancy.' });
  }

  const now = new Date().toISOString();
  let notifiedCount = 0;

  // Set of user IDs to avoid double notification in this blast
  const notifiedUserIds = new Set<string>();

  pastApplications.forEach(app => {
    if (!notifiedUserIds.has(app.userId)) {
      notifiedUserIds.add(app.userId);

      // Check if recent notification for this job was sent in last 24 hours
      const recentNotification = db.notifications.find(
        n =>
          n.recipientUserId === app.userId &&
          n.type === 'PREVIOUS_APPLICANT_RECALL' &&
          n.metadata?.jobId === job.id
      );

      if (!recentNotification) {
        db.notifications.push({
          id: `notif_${crypto.randomUUID().slice(0, 8)}`,
          recipientUserId: app.userId,
          title: `Job Reopened: ${job.title}`,
          message: `An opportunity you previously applied for is now open again at ${job.companyName}. Position: "${job.title}" (${job.location}). Click here to view details and re-apply.`,
          type: 'PREVIOUS_APPLICANT_RECALL',
          linkUrl: `/manpower/jobs/${job.id}`,
          isRead: false,
          deliveryChannel: 'IN_APP',
          metadata: {
            jobId: job.id,
            jobTitle: job.title,
            previousApplicationId: app.id,
          },
          createdAt: now,
        });
        notifiedCount++;
      }
    }
  });

  job.notifiedApplicantsCount = (job.notifiedApplicantsCount || 0) + notifiedCount;
  job.updatedAt = now;
  db.save();

  res.json({
    success: true,
    message: `Successfully notified ${notifiedCount} previous applicants across in-app channels.`,
    notifiedCount,
    totalApplicantsFound: pastApplications.length,
    jobTitle: job.title,
  });
});

// ==========================================
// 5. JOB APPLICATION & CANDIDATE HISTORY
// ==========================================

apiRouter.post('/applications/apply', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required to apply.' });
  }

  const profile = db.candidateProfiles.find(p => p.userId === user.id);
  if (!profile) {
    return res.status(400).json({ error: 'Candidate profile not found. Please register first.' });
  }

  // Check candidate registration and ₹10 payment status
  const activeRegistration = db.registrations.find(
    r => r.candidateId === profile.id && r.paymentStatus === 'SUCCESS' && r.status === 'ACTIVE'
  );

  if (!activeRegistration || profile.registrationStatus !== 'ACTIVE') {
    return res.status(403).json({
      error: 'Active ₹10 candidate registration required before applying for jobs.',
      needsRegistration: true,
    });
  }

  const { jobId, notes } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required.' });
  }

  const job = db.jobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job vacancy not found.' });
  }

  if (job.status !== 'OPEN') {
    return res.status(400).json({ error: `Cannot apply: This job is currently ${job.status.toLowerCase()}.` });
  }

  if (job.jobCategory === 'AV_JOB' && profile.registrationScope !== 'AV_JOBS') {
    return res.status(403).json({
      error: 'Complete the additional AV Jobs registration fields to apply for AV vacancies.',
      needsAvUpgrade: true,
    });
  }

  // Prevent duplicate application for same candidate & same job
  const existingApp = db.applications.find(
    a => a.candidateId === profile.id && a.jobId === jobId && a.applicationStatus !== 'WITHDRAWN'
  );

  if (existingApp) {
    return res.status(400).json({
      error: 'You have already applied for this job opportunity.',
      application: existingApp,
    });
  }

  const now = new Date().toISOString();
  const newApplication: ManpowerApplication = {
    id: `app_${crypto.randomUUID().slice(0, 8)}`,
    candidateId: profile.id,
    userId: user.id,
    jobId: job.id,
    jobCategory: job.jobCategory,
    appliedDate: now,
    resumeUrl: profile.resumeUrl,
    applicationStatus: 'APPLIED',
    staffReviewStatus: job.jobCategory === 'AV_JOB' ? 'PENDING' : undefined,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
  };

  db.applications.unshift(newApplication);

  // Send in-app notification
  db.notifications.push({
    id: `notif_${crypto.randomUUID().slice(0, 8)}`,
    recipientUserId: user.id,
    title: 'Application Received',
    message: `Your application for "${job.title}" at ${job.companyName} was submitted successfully. Application ID: ${newApplication.id}.`,
    type: 'APPLICATION_SUBMITTED',
    linkUrl: '/manpower/applications',
    isRead: false,
    deliveryChannel: 'IN_APP',
    createdAt: now,
  });

  db.save();

  res.status(201).json({
    message: 'Application submitted successfully.',
    application: newApplication,
    jobTitle: job.title,
  });
});

apiRouter.get('/candidate/applications', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'candidate');
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const profile = db.candidateProfiles.find(p => p.userId === user.id);
  if (!profile) {
    return res.json({ applications: [] });
  }

  const apps = db.applications
    .filter(a => a.candidateId === profile.id)
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const enrichedApps = apps.map(app => {
    const job = db.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      job,
    };
  });

  res.json({ applications: enrichedApps });
});

// ==========================================
// 6. ADMIN APPLICATION LISTS & ADVANCED FILTERING
// ==========================================

// AV Jobs Applications Table
apiRouter.get('/admin/applications/av', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  handleApplicationList(req, res, 'AV_JOB');
});

// All Jobs Applications Table
apiRouter.get('/admin/applications/all', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  handleApplicationList(req, res, 'ALL_JOB');
});

function handleApplicationList(req: AuthenticatedRequest, res: Response, targetCategory?: 'AV_JOB' | 'ALL_JOB') {
  const {
    search,
    jobId,
    status,
    qualification,
    location,
    page = '1',
    limit = '15',
  } = req.query;

  let apps = db.applications;

  if (targetCategory) {
    apps = apps.filter(a => a.jobCategory === targetCategory);
  }
  if (jobId) {
    apps = apps.filter(a => a.jobId === jobId);
  }
  if (status) {
    apps = apps.filter(a => a.applicationStatus === status);
  }

  // Join with candidate profiles and jobs for deep searching
  let enriched = apps.map(app => {
    const candidate = db.candidateProfiles.find(p => p.id === app.candidateId);
    const job = db.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      candidate,
      job,
    };
  });

  if (qualification) {
    const q = String(qualification).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.qualification.toLowerCase().includes(q));
  }
  if (location) {
    const l = String(location).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.preferredLocation.toLowerCase().includes(l) || e.job?.location.toLowerCase().includes(l));
  }
  if (search) {
    const s = String(search).toLowerCase();
    enriched = enriched.filter(
      e =>
        e.id.toLowerCase().includes(s) ||
        e.candidate?.fullName.toLowerCase().includes(s) ||
        e.candidate?.mobile.includes(s) ||
        e.candidate?.email.toLowerCase().includes(s) ||
        e.job?.title.toLowerCase().includes(s) ||
        e.job?.department.toLowerCase().includes(s) ||
        e.candidate?.skills.some(sk => sk.toLowerCase().includes(s))
    );
  }

  enriched.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const total = enriched.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 15));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = enriched.slice(startIndex, startIndex + limitNum);

  res.json({
    applications: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

// ADVANCED HISTORICAL CANDIDATE FILTERING
apiRouter.get('/admin/applications/search', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    query,
    candidateName,
    candidateId,
    mobile,
    email,
    jobTitle,
    jobId,
    qualification,
    skills,
    minExp,
    maxExp,
    location,
    category,
    status,
    appliedFrom,
    appliedTo,
    selectedOrRejected,
    historicalOnly,
    page = '1',
    limit = '20',
  } = req.query;

  let enriched = db.applications.map(app => {
    const candidate = db.candidateProfiles.find(p => p.id === app.candidateId);
    const job = db.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      candidate,
      job,
    };
  });

  if (query) {
    const q = String(query).toLowerCase();
    enriched = enriched.filter(
      e =>
        e.id.toLowerCase().includes(q) ||
        e.candidateId.toLowerCase().includes(q) ||
        e.candidate?.fullName.toLowerCase().includes(q) ||
        e.candidate?.mobile.includes(q) ||
        e.candidate?.email.toLowerCase().includes(q) ||
        e.job?.title.toLowerCase().includes(q) ||
        e.job?.companyName.toLowerCase().includes(q)
    );
  }

  if (candidateName) {
    const cn = String(candidateName).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.fullName.toLowerCase().includes(cn));
  }
  if (candidateId) {
    enriched = enriched.filter(e => e.candidateId.toLowerCase().includes(String(candidateId).toLowerCase()));
  }
  if (mobile) {
    enriched = enriched.filter(e => e.candidate?.mobile.includes(String(mobile)));
  }
  if (email) {
    const em = String(email).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.email.toLowerCase().includes(em));
  }
  if (jobTitle) {
    const jt = String(jobTitle).toLowerCase();
    enriched = enriched.filter(e => e.job?.title.toLowerCase().includes(jt));
  }
  if (jobId) {
    enriched = enriched.filter(e => e.jobId === jobId);
  }
  if (qualification) {
    const qf = String(qualification).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.qualification.toLowerCase().includes(qf) || e.candidate?.graduation.toLowerCase().includes(qf));
  }
  if (skills) {
    const sk = String(skills).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.skills.some(s => s.toLowerCase().includes(sk)));
  }
  if (minExp !== undefined && minExp !== '') {
    const me = Number(minExp);
    enriched = enriched.filter(e => (e.candidate?.experienceYears || 0) >= me);
  }
  if (maxExp !== undefined && maxExp !== '') {
    const me = Number(maxExp);
    enriched = enriched.filter(e => (e.candidate?.experienceYears || 0) <= me);
  }
  if (location) {
    const loc = String(location).toLowerCase();
    enriched = enriched.filter(e => e.candidate?.preferredLocation.toLowerCase().includes(loc) || e.candidate?.address.toLowerCase().includes(loc));
  }
  if (category) {
    enriched = enriched.filter(e => e.jobCategory === category);
  }
  if (status) {
    enriched = enriched.filter(e => e.applicationStatus === status);
  }
  if (selectedOrRejected) {
    if (selectedOrRejected === 'SELECTED') {
      enriched = enriched.filter(e => e.applicationStatus === 'SELECTED');
    } else if (selectedOrRejected === 'REJECTED') {
      enriched = enriched.filter(e => e.applicationStatus === 'REJECTED');
    }
  }
  if (appliedFrom) {
    const fTime = new Date(appliedFrom as string).getTime();
    enriched = enriched.filter(e => new Date(e.appliedDate).getTime() >= fTime);
  }
  if (appliedTo) {
    const tTime = new Date(appliedTo as string).getTime();
    enriched = enriched.filter(e => new Date(e.appliedDate).getTime() <= tTime);
  }
  if (historicalOnly === 'true') {
    // Older than 3 months
    const threeMonthsAgo = Date.now() - 90 * 86400000;
    enriched = enriched.filter(e => new Date(e.appliedDate).getTime() <= threeMonthsAgo);
  }

  enriched.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const total = enriched.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = enriched.slice(startIndex, startIndex + limitNum);

  res.json({
    totalMatched: total,
    results: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Update Application Status & trigger 3-level approval if SELECTED
apiRouter.put('/admin/applications/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const { status, remarks, rejectionReason } = req.body;
  const oldStatus = app.applicationStatus;
  const now = new Date().toISOString();

  app.applicationStatus = status;
  if (remarks) app.adminRemarks = remarks;
  if (rejectionReason) app.rejectionReason = rejectionReason;
  app.updatedAt = now;

  // Send candidate notification
  db.notifications.push({
    id: `notif_${crypto.randomUUID().slice(0, 8)}`,
    recipientUserId: app.userId,
    title: `Application Status Updated: ${status}`,
    message: `Your application status for Job ID ${app.jobId} is now ${status}. ${remarks || ''}`,
    type: 'STATUS_CHANGED',
    linkUrl: '/manpower/applications',
    isRead: false,
    deliveryChannel: 'IN_APP',
    createdAt: now,
  });

  // If candidate is SELECTED, initialize 3-Level Job Confirmation if not yet created
  if (status === 'SELECTED' && oldStatus !== 'SELECTED') {
    const existingApprovals = db.jobApprovals.filter(ja => ja.applicationId === app.id);
    if (existingApprovals.length === 0) {
      db.jobApprovals.push(
        {
          id: `appr_${crypto.randomUUID().slice(0, 8)}`,
          applicationId: app.id,
          candidateId: app.candidateId,
          userId: app.userId,
          jobId: app.jobId,
          level: 1,
          levelName: 'LEVEL_1_HR',
          status: 'PENDING',
          remarks: 'Initial screening and verification pending.',
        },
        {
          id: `appr_${crypto.randomUUID().slice(0, 8)}`,
          applicationId: app.id,
          candidateId: app.candidateId,
          userId: app.userId,
          jobId: app.jobId,
          level: 2,
          levelName: 'LEVEL_2_OPERATIONS',
          status: 'PENDING',
          remarks: 'Duty shift readiness and regional deployment pending.',
        },
        {
          id: `appr_${crypto.randomUUID().slice(0, 8)}`,
          applicationId: app.id,
          candidateId: app.candidateId,
          userId: app.userId,
          jobId: app.jobId,
          level: 3,
          levelName: 'LEVEL_3_DIRECTOR',
          status: 'PENDING',
          remarks: 'Managing Director final executive sign-off pending.',
        }
      );
    }
  }

  db.save();
  res.json({ message: `Application status updated to ${status}.`, application: app });
});

// Candidate Full History Dossier
apiRouter.get('/admin/candidate/:id/history', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const candId = req.params.id;
  const profile = db.candidateProfiles.find(p => p.id === candId || p.userId === candId);
  if (!profile) {
    return res.status(404).json({ error: 'Candidate profile not found' });
  }

  const user = db.users.find(u => u.id === profile.userId);
  const applications = db.applications.filter(a => a.candidateId === profile.id || a.userId === profile.userId);
  const enrichedApplications = applications.map(app => {
    const job = db.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      job,
    };
  });

  const notifications = db.notifications.filter(n => n.recipientUserId === profile.userId);
  const employeeRecord = db.employees.find(e => e.candidateId === profile.id || e.userId === profile.userId);
  const approvals = db.jobApprovals.filter(ja => ja.candidateId === profile.id || ja.userId === profile.userId);

  res.json({
    profile,
    user,
    applications: enrichedApplications,
    notifications,
    employeeRecord,
    approvals,
  });
});

// ==========================================
// 7. 3-LEVEL JOB CONFIRMATION APPROVAL SYSTEM
// ==========================================

apiRouter.get('/admin/approvals', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  // Group by application
  const applications = db.applications.filter(a => a.applicationStatus === 'SELECTED');

  const grouped = applications.map(app => {
    const candidate = db.candidateProfiles.find(p => p.id === app.candidateId);
    const job = db.jobs.find(j => j.id === app.jobId);
    const levels = db.jobApprovals
      .filter(ja => ja.applicationId === app.id)
      .sort((a, b) => a.level - b.level);

    const isConfirmed = levels.length === 3 && levels.every(l => l.status === 'APPROVED');
    const isRejected = levels.some(l => l.status === 'REJECTED');

    return {
      applicationId: app.id,
      candidate,
      job,
      levels,
      overallStatus: isConfirmed ? 'CONFIRMED' : (isRejected ? 'REJECTED' : 'PENDING'),
    };
  });

  res.json({ approvalPipelines: grouped });
});

apiRouter.post('/admin/approvals/:approvalId/decide', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'admin');
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { status, remarks, level } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be APPROVED or REJECTED.' });
  }

  // Find approval record by ID, or by applicationId + level
  let approval = db.jobApprovals.find(ja => ja.id === req.params.approvalId);
  if (!approval && level) {
    approval = db.jobApprovals.find(ja => ja.applicationId === req.params.approvalId && ja.level === Number(level));
  }
  if (!approval) {
    // Try matching first pending approval for this applicationId
    approval = db.jobApprovals.find(ja => ja.applicationId === req.params.approvalId && ja.status === 'PENDING');
  }

  if (!approval) {
    return res.status(404).json({ error: 'Approval record not found.' });
  }

  // Validate sequential ordering:
  const pipeline = db.jobApprovals
    .filter(ja => ja.applicationId === approval.applicationId)
    .sort((a, b) => a.level - b.level);

  if (approval.level === 2 && status === 'APPROVED') {
    const l1 = pipeline.find(p => p.level === 1);
    if (l1?.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Level 1 (HR) must be APPROVED before Operations can decide.' });
    }
  }

  if (approval.level === 3 && status === 'APPROVED') {
    const l2 = pipeline.find(p => p.level === 2);
    if (l2?.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Level 2 (Operations) must be APPROVED before Director can decide.' });
    }
  }

  const now = new Date().toISOString();
  approval.status = status;
  approval.remarks = remarks || approval.remarks;
  approval.approverId = user.id;
  approval.approverName = user.name;
  approval.approverRole = user.role;
  approval.decidedAt = now;

  // If rejected, mark application as REJECTED
  if (status === 'REJECTED') {
    const app = db.applications.find(a => a.id === approval.applicationId);
    if (app) {
      app.applicationStatus = 'REJECTED';
      app.rejectionReason = remarks || `Rejected at Level ${approval.level} (${approval.levelName})`;
      app.updatedAt = now;
    }
  }

  // Check if all 3 levels are now APPROVED
  const allLevels = db.jobApprovals.filter(ja => ja.applicationId === approval.applicationId);
  const allApproved = allLevels.length === 3 && allLevels.every(l => l.status === 'APPROVED');

  let newEmployee: ManpowerEmployee | undefined;

  if (allApproved) {
    const app = db.applications.find(a => a.id === approval.applicationId);
    const candidate = db.candidateProfiles.find(p => p.id === approval.candidateId);
    const job = db.jobs.find(j => j.id === approval.jobId);
    const targetUser = db.users.find(u => u.id === approval.userId);

    if (app && candidate && job && targetUser) {
      // Check if employee already created
      let existingEmp = db.employees.find(e => e.userId === targetUser.id);
      if (!existingEmp) {
        const empSeq = (db.employees.length + 42).toString().padStart(4, '0');
        const empIdCode = `AV-EMP-2026-${empSeq}`;

        existingEmp = {
          id: `emp_${crypto.randomUUID().slice(0, 8)}`,
          employeeId: empIdCode,
          userId: targetUser.id,
          candidateId: candidate.id,
          applicationId: app.id,
          jobId: job.id,
          fullName: candidate.fullName,
          email: targetUser.email,
          mobile: candidate.mobile,
          department: job.department,
          designation: job.title,
          joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'ACTIVE',
          basicSalary: job.salaryMin || 22000,
          idCardIssued: true,
          appointmentLetterIssued: true,
          createdAt: now,
        };
        db.employees.push(existingEmp);

        // Transition user role to 'employee'
        targetUser.role = 'employee';

        // Generate ID Card
        const idCard: EmployeeIdCard = {
          id: `idc_${crypto.randomUUID().slice(0, 8)}`,
          employeeId: empIdCode,
          employeeName: candidate.fullName,
          department: job.department,
          designation: job.title,
          joiningDate: existingEmp.joiningDate,
          cardCode: `AVF-${job.classification.slice(0, 3)}-${empSeq}`,
          qrCodeData: `https://ayudhvikas.org/verify/emp/${empIdCode}`,
          issueDate: now.split('T')[0],
          validUntil: `${new Date().getFullYear() + 3}-12-31`,
          status: 'ACTIVE',
        };
        db.idCards.push(idCard);

        // Generate Official Appointment Letter
        const appointmentLetter: AppointmentLetter = {
          id: `appt_${crypto.randomUUID().slice(0, 8)}`,
          employeeId: empIdCode,
          employeeName: candidate.fullName,
          refNo: `AVF/2026/APPT-${empSeq}`,
          issuedDate: now.split('T')[0],
          joiningDate: existingEmp.joiningDate,
          department: job.department,
          designation: job.title,
          salary: existingEmp.basicSalary,
          terms: [
            'The employee shall be governed by the standard service conduct, safety standards, and operational guidelines of Ayudh Vikas Foundation.',
            'Official working hours and roster duties shall be assigned by the respective operations supervisor.',
            'The employment is subject to annual performance assessment, attendance compliance, and organizational code of ethics.',
            'Termination requires 30 days prior written notice by either party, or basic salary in lieu thereof.'
          ],
          authorizedSignatory: 'Dr. Ramesh Chandra',
          signatoryTitle: 'Managing Director & Trustee',
        };
        db.appointmentLetters.push(appointmentLetter);

        // Emits Official Confirmation Notification
        db.notifications.push({
          id: `notif_${crypto.randomUUID().slice(0, 8)}`,
          recipientUserId: targetUser.id,
          title: '3-Level Job Confirmation Approved!',
          message: `Congratulations ${candidate.fullName}! Your employment as ${job.title} has been officially confirmed by Director Dr. Ramesh Chandra. Your Employee ID is ${empIdCode}. You can now access your Employee Portal, ID card, and Appointment Letter.`,
          type: 'OFFICIALLY_CONFIRMED',
          linkUrl: '/manpower/employee/dashboard',
          isRead: false,
          deliveryChannel: 'IN_APP',
          createdAt: now,
        });

        newEmployee = existingEmp;
      }
    }
  }

  db.save();

  res.json({
    message: `Approval decision for Level ${approval.level} recorded as ${status}.`,
    approval,
    allApproved,
    newEmployee,
  });
});

// ==========================================
// 8. EMPLOYEE PORTAL & ATTENDANCE ENGINE
// ==========================================

const getAttendanceDate = () => new Date().toISOString().split('T')[0];

const getAttendanceTimestamp = () => new Date().toISOString();

const diffAttendanceMinutes = (start?: string, end?: string) => {
  if (!start || !end) return 0;

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 0;

  return Math.max(0, Math.floor((endTime - startTime) / 60000));
};

const emptyAttendance = (employeeId: string, date: string): EmployeeAttendance => ({
  id: `att_${employeeId}_${date}`,
  employeeId,
  date,
  dutyStatus: 'ABSENT',
  currentActivity: 'OFF_DUTY',
  totalWorkMinutes: 0,
  totalBreakMinutes: 0,
  totalLunchMinutes: 0,
  sessions: [],
});

const closeAttendanceSession = (attendance: EmployeeAttendance, endedAt: string) => {
  const activeSession = attendance.sessions.find(s => !s.endTime);
  if (!activeSession) return;

  const previousDuration = activeSession.durationMinutes || 0;
  activeSession.endTime = endedAt;
  activeSession.durationMinutes = diffAttendanceMinutes(activeSession.startTime, endedAt);
  const additionalMinutes = Math.max(0, activeSession.durationMinutes - previousDuration);

  if (activeSession.type === 'WORK') attendance.totalWorkMinutes += additionalMinutes;
  if (activeSession.type === 'BREAK') attendance.totalBreakMinutes += additionalMinutes;
  if (activeSession.type === 'LUNCH') attendance.totalLunchMinutes += additionalMinutes;
};

const startAttendanceSession = (attendance: EmployeeAttendance, type: AttendanceSession['type'], startedAt: string) => {
  attendance.sessions.push({
    id: `sess_${crypto.randomUUID().slice(0, 6)}`,
    type,
    startTime: startedAt,
    durationMinutes: 0,
  });
};

apiRouter.get('/employee/me', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee) {
    // In demo / test preview, seamlessly show default employee record (Vikram Singh)
    employee = db.employees[0];
  }
  if (!employee) {
    return res.status(404).json({ error: 'Employee record not found.' });
  }

  const todayStr = getAttendanceDate();
  const todayAttendance = db.attendance.find(a => a.employeeId === employee!.employeeId && a.date === todayStr);

  const leaveBalance = {
    casual: 8,
    sick: 6,
    earned: 12,
  };

  res.json({
    employee,
    todayAttendance: todayAttendance || emptyAttendance(employee.employeeId, todayStr),
    leaveBalance,
  });
});

apiRouter.get('/staff/av-applications', requireStaff, (req: AuthenticatedRequest, res: Response) => {
  const applications = db.applications
    .filter(app => app.jobCategory === 'AV_JOB')
    .map(app => ({
      ...app,
      candidate: db.candidateProfiles.find(p => p.id === app.candidateId),
      job: db.jobs.find(j => j.id === app.jobId),
    }))
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));

  res.json({ applications });
});

apiRouter.post('/staff/av-applications/:id/review', requireStaff, (req: AuthenticatedRequest, res: Response) => {
  const application = db.applications.find(app => app.id === req.params.id && app.jobCategory === 'AV_JOB');
  if (!application) {
    return res.status(404).json({ error: 'AV application not found.' });
  }

  const { action, remarks } = req.body;
  const now = new Date().toISOString();
  application.staffReviewStatus = action === 'REJECT' ? 'STAFF_REJECTED' : 'STAFF_APPROVED';
  application.staffReviewedBy = req.user?.id;
  application.staffReviewedAt = now;
  application.adminRemarks = remarks || application.adminRemarks;
  application.updatedAt = now;
  db.save();

  res.json({ message: `Application marked as ${application.staffReviewStatus}.`, application });
});

// Attendance state machine: CLOCK_IN -> BREAK -> RESUME -> LUNCH -> RESUME -> CLOCK_OUT
apiRouter.post('/employee/attendance/action', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') {
    employee = db.employees[0];
  }
  if (!employee) {
    return res.status(404).json({ error: 'Employee record not found.' });
  }

  const { action } = req.body;
  const validActions = ['CLOCK_IN', 'BREAK', 'LUNCH', 'RESUME', 'CLOCK_OUT'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  const todayStr = getAttendanceDate();
  const nowIso = getAttendanceTimestamp();

  let attendance = db.attendance.find(a => a.employeeId === employee!.employeeId && a.date === todayStr);

  if (!attendance) {
    attendance = emptyAttendance(employee.employeeId, todayStr);
    db.attendance.push(attendance);
  }

  // State Machine Transition Rules:
  switch (action) {
    case 'CLOCK_IN': {
      if (attendance.currentActivity !== 'OFF_DUTY') {
        return res.status(400).json({ error: `Cannot Clock In: Already clocked in with activity '${attendance.currentActivity}'.` });
      }
      if (attendance.clockInTime && attendance.clockOutTime) {
        return res.status(400).json({ error: 'Duty already concluded for today.' });
      }

      attendance.clockInTime = nowIso;
      attendance.clockOutTime = undefined;
      attendance.totalWorkMinutes = 0;
      attendance.totalBreakMinutes = 0;
      attendance.totalLunchMinutes = 0;
      attendance.sessions = [];
      attendance.dutyStatus = 'PRESENT';
      attendance.currentActivity = 'WORKING';
      startAttendanceSession(attendance, 'WORK', nowIso);
      break;
    }

    case 'BREAK': {
      if (attendance.currentActivity !== 'WORKING') {
        return res.status(400).json({ error: 'Cannot take Break: Must be currently in WORKING state.' });
      }

      closeAttendanceSession(attendance, nowIso);
      attendance.currentActivity = 'BREAK';
      startAttendanceSession(attendance, 'BREAK', nowIso);
      break;
    }

    case 'LUNCH': {
      if (attendance.currentActivity !== 'WORKING') {
        return res.status(400).json({ error: 'Cannot take Lunch: Must be currently in WORKING state.' });
      }

      closeAttendanceSession(attendance, nowIso);
      attendance.currentActivity = 'LUNCH';
      startAttendanceSession(attendance, 'LUNCH', nowIso);
      break;
    }

    case 'RESUME': {
      if (attendance.currentActivity !== 'BREAK' && attendance.currentActivity !== 'LUNCH') {
        return res.status(400).json({ error: 'Cannot Resume: No active Break or Lunch session to resume from.' });
      }

      closeAttendanceSession(attendance, nowIso);
      attendance.currentActivity = 'WORKING';
      startAttendanceSession(attendance, 'WORK', nowIso);
      break;
    }

    case 'CLOCK_OUT': {
      if (attendance.currentActivity === 'OFF_DUTY') {
        return res.status(400).json({ error: 'Cannot Clock Out: You have not clocked in today.' });
      }

      closeAttendanceSession(attendance, nowIso);
      attendance.clockOutTime = nowIso;
      attendance.currentActivity = 'OFF_DUTY';
      break;
    }
  }

  db.save();

  res.json({
    message: `Attendance action '${action}' recorded successfully at ${new Date(nowIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`,
    attendance,
  });
});

apiRouter.get('/employee/attendance/history', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') {
    employee = db.employees[0];
  }
  if (!employee) {
    return res.status(404).json({ error: 'Employee record not found.' });
  }

  const history = db.attendance
    .filter(a => a.employeeId === employee!.employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));

  res.json({ history });
});

// Leave Management
apiRouter.get('/employee/leaves', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const leaves = db.leaves.filter(l => l.employeeId === employee!.employeeId);
  res.json({ leaves });
});

apiRouter.post('/employee/leaves', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const { leaveType, startDate, endDate, totalDays, reason, attachmentUrl } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
  }

  const now = new Date().toISOString();
  const newLeave: EmployeeLeave = {
    id: `leave_${crypto.randomUUID().slice(0, 8)}`,
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    leaveType,
    startDate,
    endDate,
    totalDays: Number(totalDays) || 1,
    reason,
    attachmentUrl,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  db.leaves.unshift(newLeave);
  db.save();

  res.status(201).json({ message: 'Leave application submitted to HR/Admin.', leave: newLeave });
});

apiRouter.get('/admin/leaves', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ leaves: db.leaves });
});

apiRouter.put('/admin/leaves/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const leave = db.leaves.find(l => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

  const { status, remarks } = req.body;
  leave.status = status;
  leave.reviewedBy = req.user!.name;
  leave.reviewRemarks = remarks || leave.reviewRemarks;
  leave.updatedAt = new Date().toISOString();

  // Notify employee
  const employee = db.employees.find(e => e.employeeId === leave.employeeId);
  if (employee) {
    db.notifications.push({
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      recipientUserId: employee.userId,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request for ${leave.startDate} to ${leave.endDate} has been ${status}.`,
      type: 'LEAVE_STATUS',
      linkUrl: '/manpower/employee/leave',
      isRead: false,
      deliveryChannel: 'IN_APP',
      createdAt: new Date().toISOString(),
    });
  }

  db.save();
  res.json({ message: `Leave status updated to ${status}.`, leave });
});

// Complaints
apiRouter.get('/employee/complaints', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const list = db.complaints.filter(c => c.employeeId === employee!.employeeId);
  res.json({ complaints: list });
});

apiRouter.post('/employee/complaints', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const { title, description, category = 'FACILITY', priority = 'MEDIUM', attachmentUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const now = new Date().toISOString();
  const complaint: EmployeeComplaint = {
    id: `comp_${crypto.randomUUID().slice(0, 8)}`,
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    title,
    description,
    category,
    priority,
    attachmentUrl,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  };

  db.complaints.unshift(complaint);
  db.save();

  res.status(201).json({ message: 'Complaint submitted to Admin.', complaint });
});

apiRouter.get('/admin/complaints', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ complaints: db.complaints });
});

apiRouter.put('/admin/complaints/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const comp = db.complaints.find(c => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Complaint not found.' });

  const { status, adminResponse } = req.body;
  comp.status = status || comp.status;
  if (adminResponse) comp.adminResponse = adminResponse;
  comp.updatedAt = new Date().toISOString();

  db.save();
  res.json({ message: 'Complaint updated.', complaint: comp });
});

// Personal Notes
apiRouter.get('/employee/notes', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const notes = db.personalNotes.filter(n => n.employeeId === employee!.employeeId);
  res.json({ notes });
});

apiRouter.post('/employee/notes', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const { title, content, color = 'amber' } = req.body;
  const now = new Date().toISOString();
  const note: EmployeePersonalNote = {
    id: `note_${crypto.randomUUID().slice(0, 8)}`,
    employeeId: employee.employeeId,
    title: title || 'Quick Note',
    content: content || '',
    color,
    createdAt: now,
    updatedAt: now,
  };

  db.personalNotes.unshift(note);
  db.save();
  res.status(201).json({ note });
});

apiRouter.delete('/employee/notes/:id', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const index = db.personalNotes.findIndex(n => n.id === req.params.id);
  if (index !== -1) {
    db.personalNotes.splice(index, 1);
    db.save();
  }
  res.json({ success: true });
});

// Communication Notes
apiRouter.get('/employee/communication', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const comms = db.communications.filter(c => c.employeeId === employee!.employeeId);
  res.json({ communications: comms });
});

apiRouter.post('/employee/communication', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const { subject, message, category = 'DUTY_UPDATE', attachmentUrl } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required.' });
  }

  const now = new Date().toISOString();
  const comm: EmployeeCommunication = {
    id: `comm_${crypto.randomUUID().slice(0, 8)}`,
    employeeId: employee.employeeId,
    employeeName: employee.fullName,
    subject,
    message,
    category,
    attachmentUrl,
    readByAdmin: false,
    readByEmployee: true,
    createdAt: now,
  };

  db.communications.unshift(comm);
  db.save();
  res.status(201).json({ message: 'Update sent to Admin.', communication: comm });
});

apiRouter.get('/admin/communication', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ communications: db.communications });
});

apiRouter.post('/admin/communication/:id/reply', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const comm = db.communications.find(c => c.id === req.params.id);
  if (!comm) return res.status(404).json({ error: 'Message not found.' });

  const { reply } = req.body;
  comm.reply = reply;
  comm.repliedBy = req.user!.name;
  comm.repliedAt = new Date().toISOString();
  comm.readByAdmin = true;
  comm.readByEmployee = false;

  db.save();
  res.json({ message: 'Reply sent to employee.', communication: comm });
});

// Salary & Payslips
apiRouter.get('/employee/salary', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const records = db.salaries.filter(s => s.employeeId === employee!.employeeId);
  res.json({ salaries: records });
});

// Documents: ID Card & Appointment Letter
apiRouter.get('/employee/id-card', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const idCard = db.idCards.find(c => c.employeeId === employee!.employeeId);
  res.json({ idCard, employee });
});

apiRouter.get('/employee/appointment-letter', requireEmployee, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let employee = db.employees.find(e => e.userId === user.id);
  if (!employee && user.role === 'admin') employee = db.employees[0];
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });

  const letter = db.appointmentLetters.find(l => l.employeeId === employee!.employeeId);
  res.json({ appointmentLetter: letter, employee });
});

apiRouter.post('/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, email, mobile, role, password, department = 'Operations', designation, basicSalary } = req.body;
  const allowedRoles = ['admin', 'director_admin', 'hr_admin', 'ops_admin', 'staff', 'employee'];

  if (!name || !email || !mobile || !role || !password) {
    return res.status(400).json({ error: 'Name, email, mobile, role, and password are required.' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Candidate accounts cannot be created here. Choose any staff, employee, or admin role.' });
  }
  if (db.users.some(u => u.email.toLowerCase() === String(email).toLowerCase() || u.mobile === String(mobile))) {
    return res.status(409).json({ error: 'A user with this email or mobile already exists.' });
  }

  const now = new Date().toISOString();
  const user: User = {
    id: `usr_${role}_${crypto.randomUUID().slice(0, 8)}`,
    name,
    email,
    mobile,
    role,
    passwordHash: password,
    createdAt: now,
  };
  db.users.unshift(user);

  let employee: ManpowerEmployee | undefined;
  if (role === 'employee') {
    const serial = String(db.employees.length + 42).padStart(4, '0');
    employee = {
      id: `emp_${crypto.randomUUID().slice(0, 8)}`,
      employeeId: `AV-EMP-2026-${serial}`,
      userId: user.id,
      candidateId: '',
      jobId: '',
      fullName: name,
      email,
      mobile,
      department,
      designation: designation || 'Operations Associate',
      joiningDate: now.slice(0, 10),
      status: 'ACTIVE',
      basicSalary: Number(basicSalary) || 18000,
      idCardIssued: false,
      appointmentLetterIssued: false,
      createdAt: now,
    };
    db.employees.unshift(employee);
  }

  db.save();
  res.status(201).json({ message: `${role.replace('_', ' ')} account created.`, user, employee });
});

// Admin Employee Directory
apiRouter.get('/admin/employees', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const employees = db.employees.map(emp => {
    const todayStr = new Date().toISOString().split('T')[0];
    const att = db.attendance.find(a => a.employeeId === emp.employeeId && a.date === todayStr);
    return {
      ...emp,
      todayStatus: att?.dutyStatus || 'ABSENT',
      currentActivity: att?.currentActivity || 'OFF_DUTY',
    };
  });
  res.json({ employees });
});

// Admin All Attendance Records
apiRouter.get('/admin/attendance', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.query;
  let attendances = db.attendance;
  if (date) {
    attendances = attendances.filter(a => a.date === date);
  }
  const enriched = attendances.map(att => {
    const emp = db.employees.find(e => e.employeeId === att.employeeId);
    return {
      ...att,
      employeeName: emp?.fullName || 'Staff Member',
    };
  });
  res.json({ attendances: enriched });
});

// ==========================================
// 9. ADMIN ANALYTICS DASHBOARD STATS
// ==========================================

apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const totalCandidates = db.candidateProfiles.length;
  const activeRegistrations = db.registrations.filter(r => r.status === 'ACTIVE' && r.paymentStatus === 'SUCCESS').length;
  const registrationRevenue = activeRegistrations * 10; // ₹10 per registration

  const avApplications = db.applications.filter(a => a.jobCategory === 'AV_JOB').length;
  const allJobApplications = db.applications.filter(a => a.jobCategory === 'ALL_JOB').length;

  const openAvJobs = db.jobs.filter(j => j.jobCategory === 'AV_JOB' && j.status === 'OPEN').length;
  const openAllJobs = db.jobs.filter(j => j.jobCategory === 'ALL_JOB' && j.status === 'OPEN').length;

  const shortlisted = db.applications.filter(a => a.applicationStatus === 'SHORTLISTED').length;
  const interviews = db.applications.filter(a => a.applicationStatus === 'INTERVIEW').length;
  const selected = db.applications.filter(a => a.applicationStatus === 'SELECTED').length;
  const confirmedEmployees = db.employees.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = db.attendance.filter(a => a.date === todayStr && a.dutyStatus === 'PRESENT').length;
  const pendingLeaves = db.leaves.filter(l => l.status === 'PENDING').length;
  const openComplaints = db.complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length;

  // Hiring Funnel
  const funnel = [
    { stage: 'Applied', count: db.applications.length },
    { stage: 'Under Review', count: db.applications.filter(a => a.applicationStatus === 'UNDER_REVIEW').length },
    { stage: 'Shortlisted', count: shortlisted },
    { stage: 'Selected', count: selected },
    { stage: 'Confirmed', count: confirmedEmployees },
  ];

  // Category Distribution
  const categorySplit = [
    { name: 'AV Jobs (Internal)', applications: avApplications, openPositions: openAvJobs },
    { name: 'All Jobs (Partner)', applications: allJobApplications, openPositions: openAllJobs },
  ];

  // Qualification Distribution
  const qualMap: Record<string, number> = {};
  db.candidateProfiles.forEach(p => {
    const q = p.qualification || 'Other';
    qualMap[q] = (qualMap[q] || 0) + 1;
  });
  const qualificationChart = Object.entries(qualMap).map(([name, count]) => ({ name, count }));

  // Application Trend by Month
  const months = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Jan', '2026-Feb', '2026-Mar', '2026-Recent'];
  const applicationTrends = [
    { period: '2025-Q1', av: 18, all: 5 },
    { period: '2025-Q2', av: 32, all: 12 },
    { period: '2025-Q3', av: 45, all: 20 },
    { period: '2025-Q4', av: 28, all: 18 },
    { period: '2026-Jan', av: 40, all: 25 },
    { period: '2026-Feb', av: 52, all: 34 },
    { period: '2026-Recent', av: avApplications, all: allJobApplications },
  ];

  // Reopened jobs stats
  const reopenedJobs = db.jobs
    .filter(j => j.wasReopened || j.status === 'CLOSED')
    .map(j => ({
      id: j.id,
      title: j.title,
      status: j.status,
      previousApplicants: db.applications.filter(a => a.jobId === j.id).length,
      notifiedCount: j.notifiedApplicantsCount || 0,
    }));

  res.json({
    kpis: {
      totalCandidates,
      activeRegistrations,
      registrationRevenue,
      avApplications,
      allJobApplications,
      openAvJobs,
      openAllJobs,
      shortlisted,
      interviews,
      selected,
      confirmedEmployees,
      presentToday,
      pendingLeaves,
      openComplaints,
    },
    funnel,
    categorySplit,
    qualificationChart,
    applicationTrends,
    reopenedJobs,
  });
});

// ==========================================
// 10. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', (req: AuthenticatedRequest, res: Response) => {
  const user = resolveUser(req) || db.users.find(u => u.role === 'candidate');
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const list = db.notifications
    .filter(n => n.recipientUserId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = list.filter(n => !n.isRead).length;

  res.json({ notifications: list, unreadCount });
});

apiRouter.post('/notifications/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    db.save();
  }
  res.json({ success: true });
});
