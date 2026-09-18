import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  CandidateProfile,
  ManpowerRegistration,
  PaymentOrder,
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
} from './types.js';

interface DatabaseSchema {
  users: User[];
  candidateProfiles: CandidateProfile[];
  registrations: ManpowerRegistration[];
  paymentOrders: PaymentOrder[];
  jobs: ManpowerJob[];
  applications: ManpowerApplication[];
  jobApprovals: JobApproval[];
  employees: ManpowerEmployee[];
  attendance: EmployeeAttendance[];
  leaves: EmployeeLeave[];
  complaints: EmployeeComplaint[];
  personalNotes: EmployeePersonalNote[];
  communications: EmployeeCommunication[];
  salaries: EmployeeSalary[];
  idCards: EmployeeIdCard[];
  appointmentLetters: AppointmentLetter[];
  notifications: ManpowerNotification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'manpower-db.json');

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(content);
        const seeds = this.createSeedData();
        let changed = false;

        // Merge missing seed jobs
        if (Array.isArray(parsed.jobs)) {
          for (const sj of seeds.jobs) {
            if (!parsed.jobs.some(j => j.id === sj.id)) {
              parsed.jobs.push(sj);
              changed = true;
            }
          }
        } else {
          parsed.jobs = seeds.jobs;
          changed = true;
        }

        // Merge missing employees
        if (Array.isArray(parsed.employees)) {
          for (const se of seeds.employees) {
            if (!parsed.employees.some(e => e.id === se.id)) {
              parsed.employees.push(se);
              changed = true;
            }
          }
        } else {
          parsed.employees = seeds.employees;
          changed = true;
        }

        // Merge missing attendance records
        if (Array.isArray(parsed.attendance)) {
          for (const sa of seeds.attendance) {
            if (!parsed.attendance.some(a => a.id === sa.id)) {
              parsed.attendance.push(sa);
              changed = true;
            }
          }
        } else {
          parsed.attendance = seeds.attendance;
          changed = true;
        }

        // Merge missing id cards
        if (Array.isArray(parsed.idCards)) {
          for (const sc of seeds.idCards) {
            if (!parsed.idCards.some(c => c.id === sc.id)) {
              parsed.idCards.push(sc);
              changed = true;
            }
          }
        } else {
          parsed.idCards = seeds.idCards;
          changed = true;
        }

        // Merge missing appointment letters
        if (Array.isArray(parsed.appointmentLetters)) {
          for (const sl of seeds.appointmentLetters) {
            if (!parsed.appointmentLetters.some(l => l.id === sl.id)) {
              parsed.appointmentLetters.push(sl);
              changed = true;
            }
          }
        } else {
          parsed.appointmentLetters = seeds.appointmentLetters;
          changed = true;
        }

        if (changed) {
          this.persistSync(parsed);
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse database file, re-initializing seeds', err);
      }
    }
    const initialData = this.createSeedData();
    this.persistSync(initialData);
    return initialData;
  }

  private persistSync(data: DatabaseSchema) {
    this.ensureDataDir();
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
      this.saveTimeout = null;
    }, 100);
  }

  public get users(): User[] {
    return this.data.users;
  }
  public get candidateProfiles(): CandidateProfile[] {
    return this.data.candidateProfiles;
  }
  public get registrations(): ManpowerRegistration[] {
    return this.data.registrations;
  }
  public get paymentOrders(): PaymentOrder[] {
    return this.data.paymentOrders;
  }
  public get jobs(): ManpowerJob[] {
    return this.data.jobs;
  }
  public get applications(): ManpowerApplication[] {
    return this.data.applications;
  }
  public get jobApprovals(): JobApproval[] {
    return this.data.jobApprovals;
  }
  public get employees(): ManpowerEmployee[] {
    return this.data.employees;
  }
  public get attendance(): EmployeeAttendance[] {
    return this.data.attendance;
  }
  public get leaves(): EmployeeLeave[] {
    return this.data.leaves;
  }
  public get complaints(): EmployeeComplaint[] {
    return this.data.complaints;
  }
  public get personalNotes(): EmployeePersonalNote[] {
    return this.data.personalNotes;
  }
  public get communications(): EmployeeCommunication[] {
    return this.data.communications;
  }
  public get salaries(): EmployeeSalary[] {
    return this.data.salaries;
  }
  public get idCards(): EmployeeIdCard[] {
    return this.data.idCards;
  }
  public get appointmentLetters(): AppointmentLetter[] {
    return this.data.appointmentLetters;
  }
  public get notifications(): ManpowerNotification[] {
    return this.data.notifications;
  }

  private createSeedData(): DatabaseSchema {
    const adminUser: User = {
      id: 'usr_admin_01',
      name: 'Dr. Ramesh Chandra (Director)',
      email: 'admin@ayudhvikas.org',
      mobile: '9849012345',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const hrUser: User = {
      id: 'usr_hr_01',
      name: 'Sunita Sharma (HR Lead)',
      email: 'hr@ayudhvikas.org',
      mobile: '9849012346',
      role: 'hr_admin',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const opsUser: User = {
      id: 'usr_ops_01',
      name: 'Manoj Kumar (Operations Head)',
      email: 'ops@ayudhvikas.org',
      mobile: '9849012347',
      role: 'ops_admin',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const staffUser: User = {
      id: 'usr_staff_01',
      name: 'Kavya Rao (Front Desk Staff)',
      email: 'staff@ayudhvikas.org',
      mobile: '9849012348',
      role: 'staff',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    const candidateUser: User = {
      id: 'usr_cand_01',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      mobile: '9876543210',
      role: 'candidate',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T10:00:00.000Z',
    };

    const candidateProfile: CandidateProfile = {
      id: 'prof_cand_01',
      userId: 'usr_cand_01',
      fullName: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      dob: '1998-05-14',
      qualification: 'Graduate',
      graduation: 'B.Com in Computer Applications',
      skills: ['Office Administration', 'Tally ERP', 'Customer Relations', 'Documentation'],
      experienceYears: 2,
      preferredJob: 'Office Assistant',
      preferredLocation: 'Hyderabad, Telangana',
      address: 'Plot 42, Sri Krishna Nagar, Kukatpally, Hyderabad - 500072',
      resumeUrl: '/documents/resumes/rahul_sharma_resume.pdf',
      registrationStatus: 'ACTIVE',
      registrationScope: 'AV_JOBS',
      passwordHash: 'Candidate@123',
      detailedExperience: 'Two years handling visitor registers, invoice files, office documentation, and front-desk coordination.',
      esicNumber: 'ESIC-TS-192837',
      pfAccountNumber: 'PF/HYD/AVF/0042',
      governmentDocumentType: 'AADHAAR',
      governmentDocumentNumber: 'XXXX-XXXX-1234',
      governmentDocumentUrl: '/documents/identity/rahul_sharma_aadhaar.pdf',
      avRegistrationCompletedAt: '2026-01-10T10:15:00.000Z',
      createdAt: '2026-01-10T10:05:00.000Z',
      updatedAt: '2026-01-10T10:15:00.000Z',
    };

    const registration: ManpowerRegistration = {
      id: 'reg_cand_01',
      candidateId: 'prof_cand_01',
      userId: 'usr_cand_01',
      amount: 10,
      paymentOrderId: 'order_pay_01',
      paymentTransactionId: 'TXN_AVF_2026_001928',
      paymentStatus: 'SUCCESS',
      registrationDate: '2026-01-10T10:15:00.000Z',
      status: 'ACTIVE',
    };

    const paymentOrder: PaymentOrder = {
      id: 'order_pay_01',
      userId: 'usr_cand_01',
      purpose: 'CANDIDATE_REGISTRATION',
      amount: 10,
      currency: 'INR',
      status: 'SUCCESS',
      transactionId: 'TXN_AVF_2026_001928',
      createdAt: '2026-01-10T10:10:00.000Z',
      verifiedAt: '2026-01-10T10:15:00.000Z',
    };

    // Second candidate: In 3-level approval flow
    const candidate2User: User = {
      id: 'usr_cand_02',
      name: 'Anita Reddy',
      email: 'anita.reddy@example.com',
      mobile: '9848123456',
      role: 'candidate',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T09:00:00.000Z',
    };

    const candidate2Profile: CandidateProfile = {
      id: 'prof_cand_02',
      userId: 'usr_cand_02',
      fullName: 'Anita Reddy',
      mobile: '9848123456',
      email: 'anita.reddy@example.com',
      dob: '1999-08-22',
      qualification: 'Graduate',
      graduation: 'B.Sc Nursing & Healthcare Caregiving',
      skills: ['Patient Care', 'First Aid Certified', 'Vitals Monitoring', 'Compassionate Care'],
      experienceYears: 3,
      preferredJob: 'Healthcare Support Staff',
      preferredLocation: 'Secunderabad, Telangana',
      address: 'H.No 12-4-88, Tarnaka Main Road, Secunderabad - 500017',
      resumeUrl: '/documents/resumes/anita_reddy_resume.pdf',
      registrationStatus: 'ACTIVE',
      registrationScope: 'AV_JOBS',
      passwordHash: 'Candidate@123',
      detailedExperience: 'Three years of clinic assistance, patient movement coordination, vitals monitoring, and camp documentation.',
      esicNumber: 'ESIC-TS-847263',
      pfAccountNumber: 'PF/HYD/AVF/0078',
      governmentDocumentType: 'AADHAAR',
      governmentDocumentNumber: 'XXXX-XXXX-5678',
      governmentDocumentUrl: '/documents/identity/anita_reddy_aadhaar.pdf',
      avRegistrationCompletedAt: '2026-02-01T09:15:00.000Z',
      createdAt: '2026-02-01T09:10:00.000Z',
      updatedAt: '2026-02-01T09:15:00.000Z',
    };

    const registration2: ManpowerRegistration = {
      id: 'reg_cand_02',
      candidateId: 'prof_cand_02',
      userId: 'usr_cand_02',
      amount: 10,
      paymentOrderId: 'order_pay_02',
      paymentTransactionId: 'TXN_AVF_2026_002847',
      paymentStatus: 'SUCCESS',
      registrationDate: '2026-02-01T09:15:00.000Z',
      status: 'ACTIVE',
    };

    // Confirmed Employee
    const employeeUser: User = {
      id: 'usr_emp_01',
      name: 'Vikram Singh',
      email: 'vikram.singh@ayudhvikas.org',
      mobile: '9123456789',
      role: 'employee',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-06-01T00:00:00.000Z',
    };

    const employee: ManpowerEmployee = {
      id: 'emp_01',
      employeeId: 'AV-EMP-2026-0042',
      userId: 'usr_emp_01',
      candidateId: 'prof_emp_01',
      applicationId: 'app_hist_01',
      jobId: 'job_av_01',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@ayudhvikas.org',
      mobile: '9123456789',
      department: 'Security & Facility Operations',
      designation: 'Facility Operations Supervisor',
      joiningDate: '2025-07-01',
      status: 'ACTIVE',
      basicSalary: 26000,
      idCardIssued: true,
      appointmentLetterIssued: true,
      createdAt: '2025-07-01T08:00:00.000Z',
    };

    const employee2: ManpowerEmployee = {
      id: 'emp_02',
      employeeId: 'AV-EMP-2026-0043',
      userId: 'usr_emp_02',
      candidateId: 'prof_emp_02',
      jobId: 'job_av_02',
      fullName: 'Priya Narayanan',
      email: 'priya.narayanan@ayudhvikas.org',
      mobile: '9848123457',
      department: 'General Administration',
      designation: 'Senior Administrative Associate',
      joiningDate: '2025-08-15',
      status: 'ACTIVE',
      basicSalary: 28000,
      idCardIssued: true,
      appointmentLetterIssued: true,
      createdAt: '2025-08-15T09:00:00.000Z',
    };

    const employee3: ManpowerEmployee = {
      id: 'emp_03',
      employeeId: 'AV-EMP-2026-0044',
      userId: 'usr_emp_03',
      candidateId: 'prof_emp_03',
      jobId: 'job_av_05',
      fullName: 'Mohammed Arshad',
      email: 'm.arshad@ayudhvikas.org',
      mobile: '9848234568',
      department: 'Logistics & Fleet Transport',
      designation: 'Senior Commercial Fleet Driver',
      joiningDate: '2025-09-01',
      status: 'ACTIVE',
      basicSalary: 26000,
      idCardIssued: true,
      appointmentLetterIssued: true,
      createdAt: '2025-09-01T08:30:00.000Z',
    };

    const employee4: ManpowerEmployee = {
      id: 'emp_04',
      employeeId: 'AV-EMP-2026-0045',
      userId: 'usr_emp_04',
      candidateId: 'prof_emp_04',
      jobId: 'job_av_03',
      fullName: 'K. Sunitha Reddy',
      email: 'k.sunitha@ayudhvikas.org',
      mobile: '9848345679',
      department: 'Community Health & Caregiving',
      designation: 'Healthcare Support Team Lead',
      joiningDate: '2025-10-10',
      status: 'ACTIVE',
      basicSalary: 30000,
      idCardIssued: true,
      appointmentLetterIssued: true,
      createdAt: '2025-10-10T10:00:00.000Z',
    };

    const employee5: ManpowerEmployee = {
      id: 'emp_05',
      employeeId: 'AV-EMP-2026-0046',
      userId: 'usr_emp_05',
      candidateId: 'prof_emp_05',
      jobId: 'job_av_08',
      fullName: 'G. Suresh Babu',
      email: 'suresh.babu@ayudhvikas.org',
      mobile: '9848456780',
      department: 'Technical Maintenance & Power',
      designation: 'Chief Maintenance Electrician',
      joiningDate: '2025-11-01',
      status: 'ACTIVE',
      basicSalary: 27000,
      idCardIssued: true,
      appointmentLetterIssued: true,
      createdAt: '2025-11-01T08:00:00.000Z',
    };

    // Jobs Definition
    const jobs: ManpowerJob[] = [
      {
        id: 'job_av_01',
        title: 'Security / Facility Staff',
        department: 'Security & Premises Protection',
        jobCategory: 'AV_JOB',
        classification: 'SECURITY',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Provide round-the-clock physical security, premises monitoring, visitor log management, access control, and fire safety vigilance across institutional facilities.',
        qualification: '10th / 12th Pass',
        graduationRequired: false,
        skills: ['Premises Security', 'Access Control', 'Visitor Log Register', 'Emergency Response', 'Physical Fitness'],
        experienceRequirement: '1+ years in security or facility maintenance',
        jobType: 'SHIFT_BASED',
        location: 'Hyderabad, Secunderabad, Warangal',
        salaryMin: 18000,
        salaryMax: 24000,
        salaryPeriod: 'MONTHLY',
        openings: 25,
        responsibilities: [
          'Monitor main gates, vehicle check-ins, and visitor documentation',
          'Conduct periodic security patrol rounds every 2 hours',
          'Operate fire extinguishers and basic surveillance monitors',
          'Maintain clean incident logs and emergency escalation contacts'
        ],
        requiredDocuments: ['Aadhaar Card', 'Address Proof', '10th Marksheet', 'Police Clearance / Character Certificate'],
        applicationDeadline: '2026-10-31',
        status: 'CLOSED', // Marked closed initially so Admin can reopen and trigger "127 previous applicants" recall!
        wasReopened: false,
        notifiedApplicantsCount: 0,
        createdAt: '2025-03-01T10:00:00.000Z',
        updatedAt: '2026-08-01T12:00:00.000Z',
      },
      {
        id: 'job_av_02',
        title: 'Office Assistant',
        department: 'General Administration',
        jobCategory: 'AV_JOB',
        classification: 'OFFICE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Assist administrative operations, handle inward/outward communications, basic data entry, physical filing, scheduling appointments, and inventory management.',
        qualification: 'Graduate / Intermediate',
        graduationRequired: true,
        skills: ['MS Office / Excel', 'Documentation', 'Filing', 'Office Equipment Operation', 'Email Etiquette'],
        experienceRequirement: '0 - 2 years',
        jobType: 'FULL_TIME',
        location: 'Hyderabad (Begumpet HQ)',
        salaryMin: 20000,
        salaryMax: 28000,
        salaryPeriod: 'MONTHLY',
        openings: 8,
        responsibilities: [
          'Manage daily office supply registers and inventory requests',
          'Support senior officers with meeting logistics and files preparation',
          'Answer telephone queries and dispatch official couriers'
        ],
        requiredDocuments: ['Graduation Degree / Certificate', 'Aadhaar Card', 'Resume', 'Experience Letter if any'],
        applicationDeadline: '2026-10-15',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-01-05T09:00:00.000Z',
        updatedAt: '2026-01-05T09:00:00.000Z',
      },
      {
        id: 'job_av_03',
        title: 'Healthcare Support Staff',
        department: 'Community Health & Caregiving',
        jobCategory: 'AV_JOB',
        classification: 'HEALTHCARE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Provide dedicated patient assistance, basic vitals monitoring, hygiene support, patient mobilization, and clinic assistance under senior nurse supervision.',
        qualification: 'Diploma in Nursing / Caregiver Certificate / 12th Pass',
        graduationRequired: false,
        skills: ['Vitals Check', 'First Aid', 'Bedside Care', 'Hygiene Protocols', 'Patient Compassion'],
        experienceRequirement: '1+ year experience in healthcare clinic or old age home',
        jobType: 'SHIFT_BASED',
        location: 'Hyderabad, Nizamabad, Karimnagar',
        salaryMin: 22000,
        salaryMax: 30000,
        salaryPeriod: 'MONTHLY',
        openings: 15,
        responsibilities: [
          'Assist patients with personal hygiene, movement, and prescribed nutrition',
          'Record blood pressure, temperature, and pulse readings',
          'Ensure sanitation of patient rooms and medical utilities'
        ],
        requiredDocuments: ['Caregiver / ANM / GNM Certificate', 'Aadhaar Card', 'Recent Medical Fitness Certificate'],
        applicationDeadline: '2026-11-15',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-01-12T10:00:00.000Z',
        updatedAt: '2026-01-12T10:00:00.000Z',
      },
      {
        id: 'job_av_04',
        title: 'Cleaning / Housekeeping Staff',
        department: 'Sanitation & Hygiene Services',
        jobCategory: 'AV_JOB',
        classification: 'FACILITY',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Ensure spotless hygiene and sanitization of institutional premises, floors, restrooms, waste segregation, and disinfectant protocols.',
        qualification: '8th / 10th Standard',
        graduationRequired: false,
        skills: ['Deep Cleaning', 'Sanitization Techniques', 'Waste Segregation', 'Chemical Safety'],
        experienceRequirement: 'No prior experience mandatory, training provided',
        jobType: 'FULL_TIME',
        location: 'Hyderabad, Secunderabad',
        salaryMin: 16000,
        salaryMax: 20000,
        salaryPeriod: 'MONTHLY',
        openings: 20,
        responsibilities: [
          'Clean and disinfect assigned rooms, corridors, and washrooms',
          'Maintain disposal bins as per wet/dry municipal segregation guidelines',
          'Replenish soaps, paper towels, and housekeeping consumables'
        ],
        requiredDocuments: ['Aadhaar Card', 'Bank Passbook Copy'],
        applicationDeadline: '2026-12-01',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-01-15T08:00:00.000Z',
        updatedAt: '2026-01-15T08:00:00.000Z',
      },
      {
        id: 'job_av_05',
        title: 'Driver (Light & Heavy Commercial)',
        department: 'Logistics & Fleet Transport',
        jobCategory: 'AV_JOB',
        classification: 'LOGISTICS',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Safe transport of staff, goods, community health mobile vans, and supply distribution across Telangana districts.',
        qualification: '10th Pass with Valid Commercial Driving License',
        graduationRequired: false,
        skills: ['Commercial Driving', 'Vehicle Maintenance', 'Route Navigation', 'Traffic Rules Compliance'],
        experienceRequirement: '3+ years driving commercial vehicles',
        jobType: 'FULL_TIME',
        location: 'Hyderabad & Regional Routes',
        salaryMin: 22000,
        salaryMax: 28000,
        salaryPeriod: 'MONTHLY',
        openings: 10,
        responsibilities: [
          'Safely operate foundation ambulances, staff buses, and supply trucks',
          'Perform daily fluid checks, tire pressure, and vehicle cleanliness',
          'Maintain trip odometer logs, fuel slips, and toll vouchers'
        ],
        requiredDocuments: ['Commercial Driving License (Badge)', 'Aadhaar Card', 'Medical Vision Certificate'],
        applicationDeadline: '2026-10-30',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-01-20T11:00:00.000Z',
        updatedAt: '2026-01-20T11:00:00.000Z',
      },
      {
        id: 'job_av_06',
        title: 'Sales / Field Executive',
        department: 'Outreach & Mobilization',
        jobCategory: 'AV_JOB',
        classification: 'OFFICE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Community mobilization, rural outreach, corporate CSR liaising, and candidate enrollment for skill empowerment programs.',
        qualification: 'Graduate / Intermediate',
        graduationRequired: false,
        skills: ['Telugu & Hindi Fluency', 'Public Speaking', 'Field Mobilization', 'Reporting', 'Two-Wheeler Driving'],
        experienceRequirement: '1 - 3 years in field sales, NGO outreach or insurance',
        jobType: 'FULL_TIME',
        location: 'Khammam, Nalgonda, Mahabubnagar',
        salaryMin: 20000,
        salaryMax: 32000,
        salaryPeriod: 'MONTHLY',
        openings: 12,
        responsibilities: [
          'Conduct village hall awareness camps and youth mobilization sessions',
          'Register aspiring candidates into vocational training schemes',
          'Coordinate with local panchayats and self-help groups'
        ],
        requiredDocuments: ['Intermediate / Degree Certificate', 'Driving License', 'Aadhaar Card'],
        applicationDeadline: '2026-11-20',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-01T12:00:00.000Z',
        updatedAt: '2026-02-01T12:00:00.000Z',
      },
      {
        id: 'job_av_07',
        title: 'Receptionist / Front Desk Executive',
        department: 'Customer Relations',
        jobCategory: 'AV_JOB',
        classification: 'OFFICE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Welcoming visitors, managing PBX telephone lines, coordinating interview schedules, and handling visitor security passes.',
        qualification: 'Graduate (Any stream)',
        graduationRequired: true,
        skills: ['Professional Communication', 'EPABX Operation', 'English & Telugu Fluency', 'Computer Literacy'],
        experienceRequirement: '1+ year experience in corporate or institutional front office',
        jobType: 'FULL_TIME',
        location: 'Hyderabad (Jubilee Hills Center)',
        salaryMin: 22000,
        salaryMax: 27000,
        salaryPeriod: 'MONTHLY',
        openings: 4,
        responsibilities: [
          'Greet and register all walk-in candidates, donors, and dignitaries',
          'Coordinate appointment timings with department heads',
          'Ensure front reception lounge remains immaculate and orderly'
        ],
        requiredDocuments: ['Graduation Certificate', 'Resume', 'ID Proof', 'Photo'],
        applicationDeadline: '2026-10-25',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-10T14:00:00.000Z',
        updatedAt: '2026-02-10T14:00:00.000Z',
      },
      {
        id: 'job_av_08',
        title: 'Electrical & Equipment Maintenance Technician',
        department: 'Technical Maintenance & Power',
        jobCategory: 'AV_JOB',
        classification: 'FACILITY',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Maintain institutional electrical substations, solar inverters, UPS systems, DG backup sets, and internal wiring across foundation premises.',
        qualification: 'ITI Electrician / Diploma in Electrical Engineering',
        graduationRequired: false,
        skills: ['Electrical Wiring', 'DG Set Maintenance', 'Substation Safety', 'UPS Diagnostics', 'Preventive Maintenance'],
        experienceRequirement: '1+ years in electrical maintenance',
        jobType: 'FULL_TIME',
        location: 'Hyderabad, Secunderabad',
        salaryMin: 22000,
        salaryMax: 29000,
        salaryPeriod: 'MONTHLY',
        openings: 6,
        responsibilities: [
          'Inspect and service foundation power distribution panels daily',
          'Conduct periodic battery water and load tests on emergency UPS units',
          'Coordinate rapid response for power outage contingencies'
        ],
        requiredDocuments: ['ITI Certificate / Diploma', 'Aadhaar Card', 'Electrical Wireman License'],
        applicationDeadline: '2026-11-20',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-12T09:00:00.000Z',
        updatedAt: '2026-02-12T09:00:00.000Z',
      },
      {
        id: 'job_av_09',
        title: 'Computer Lab & Digital Literacy Instructor',
        department: 'Vocational Training & Skill Development',
        jobCategory: 'AV_JOB',
        classification: 'OFFICE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Conduct hands-on digital literacy sessions for rural and underprivileged youth, teaching computer fundamentals, MS Office, typing, and internet applications.',
        qualification: 'BCA / B.Sc Computers / DCA Certified Graduate',
        graduationRequired: true,
        skills: ['Computer Basics', 'MS Office & Excel', 'Telugu & English Fluency', 'Classroom Instruction', 'Internet Tools'],
        experienceRequirement: '1 - 2 years in computer coaching or teaching',
        jobType: 'FULL_TIME',
        location: 'Warangal & Karimnagar Centers',
        salaryMin: 24000,
        salaryMax: 30000,
        salaryPeriod: 'MONTHLY',
        openings: 8,
        responsibilities: [
          'Deliver 3 batches of vocational computer training daily',
          'Track student attendance, practical lab assignments, and certification exams',
          'Maintain lab PCs, operating system updates, and network connectivity'
        ],
        requiredDocuments: ['Degree Certificate', 'Resume', 'ID Proof', 'Teaching Experience Certificate'],
        applicationDeadline: '2026-10-25',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-14T11:00:00.000Z',
        updatedAt: '2026-02-14T11:00:00.000Z',
      },
      {
        id: 'job_av_10',
        title: 'Community Health Worker & Mobile Clinic Assistant',
        department: 'Community Health & Caregiving',
        jobCategory: 'AV_JOB',
        classification: 'HEALTHCARE',
        companyName: 'Ayudh Vikas Foundation',
        description: 'Support community medical check-up camps, assist visiting doctors, register rural beneficiaries, and distribute basic vitamins and oral rehydration kits.',
        qualification: '12th Pass / ANM Diploma / First Aid Certified',
        graduationRequired: false,
        skills: ['Patient Registration', 'First Aid', 'BP & Sugar Testing', 'Community Empathy', 'Camp Logistics'],
        experienceRequirement: '0 - 2 years',
        jobType: 'FULL_TIME',
        location: 'Nalgonda, Mahabubnagar',
        salaryMin: 21000,
        salaryMax: 26000,
        salaryPeriod: 'MONTHLY',
        openings: 14,
        responsibilities: [
          'Set up rural screening camps and organize patient queue tokens',
          'Record primary vital signs (Blood Pressure, Pulse, Blood Glucose)',
          'Assist medical team with pharmacy sample inventory and referral vouchers'
        ],
        requiredDocuments: ['Intermediate / ANM Certificate', 'Aadhaar Card', 'First Aid Training Certificate'],
        applicationDeadline: '2026-11-10',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-15T08:30:00.000Z',
        updatedAt: '2026-02-15T08:30:00.000Z',
      },
      // ALL JOBS (External / Partner Opportunities)
      {
        id: 'job_all_01',
        title: 'Junior Software Engineer (Web & Full-Stack)',
        department: 'Software Engineering',
        jobCategory: 'ALL_JOB',
        classification: 'IT',
        companyName: 'Tata Consultancy Services (Partner Placement)',
        description: 'Develop responsive modern web applications using React, TypeScript, and Node.js REST services. Build clean user interfaces and optimize database queries.',
        qualification: 'B.Tech / B.E / MCA / B.Sc Computer Science',
        graduationRequired: true,
        skills: ['JavaScript / TypeScript', 'React', 'Node.js', 'SQL', 'Git version control'],
        experienceRequirement: '0 - 2 years (Freshers with portfolio welcome)',
        jobType: 'FULL_TIME',
        location: 'HITEC City, Hyderabad',
        salaryMin: 35000,
        salaryMax: 50000,
        salaryPeriod: 'MONTHLY',
        openings: 30,
        responsibilities: [
          'Write clean, modular, and testable frontend and backend code',
          'Collaborate with agile sprint teams and code reviewers',
          'Participate in daily standups and bug resolution cycles'
        ],
        requiredDocuments: ['Degree Certificate & Transcripts', 'PAN Card', 'Aadhaar Card', 'GitHub / Project Portfolio'],
        applicationDeadline: '2026-11-30',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-15T10:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
      },
      {
        id: 'job_all_02',
        title: 'IT Desktop Support & Systems Technician',
        department: 'Infrastructure & Hardware',
        jobCategory: 'ALL_JOB',
        classification: 'IT',
        companyName: 'Wipro InfoTech (Client Operations)',
        description: 'Hardware installation, OS troubleshooting, network printer configuration, LAN cabling, antivirus deployment, and helpdesk ticketing.',
        qualification: 'Diploma in Hardware & Networking / BCA / B.Sc',
        graduationRequired: false,
        skills: ['Windows 11 / Linux', 'LAN/WAN Troubleshooting', 'Printer Setup', 'Active Directory basics', 'Hardware Assembly'],
        experienceRequirement: '1 - 3 years',
        jobType: 'FULL_TIME',
        location: 'Gachibowli, Hyderabad',
        salaryMin: 25000,
        salaryMax: 35000,
        salaryPeriod: 'MONTHLY',
        openings: 15,
        responsibilities: [
          'Configure employee laptops, monitors, and secure VPN connections',
          'Resolve Tier 1 & Tier 2 user tickets within SLA guidelines',
          'Maintain IT asset inventory and warranty tracking registers'
        ],
        requiredDocuments: ['Technical Diploma / Degree', 'Aadhaar Card', 'Experience Certificates'],
        applicationDeadline: '2026-10-31',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-18T11:00:00.000Z',
        updatedAt: '2026-02-18T11:00:00.000Z',
      },
      {
        id: 'job_all_03',
        title: 'Accounts & Billing Executive',
        department: 'Finance & Accounts',
        jobCategory: 'ALL_JOB',
        classification: 'NON_IT',
        companyName: 'Reliance Retail Logistics',
        description: 'Handling vendor invoices, GST reconciliation, accounts receivable/payable, bank reconciliation, and Tally ERP vouchers.',
        qualification: 'B.Com / M.Com / MBA Finance',
        graduationRequired: true,
        skills: ['Tally Prime', 'GST Filing Basics', 'MS Excel (VLOOKUP, Pivot)', 'Bank Reconciliation'],
        experienceRequirement: '1 - 3 years',
        jobType: 'FULL_TIME',
        location: 'Shamshabad, Hyderabad',
        salaryMin: 26000,
        salaryMax: 36000,
        salaryPeriod: 'MONTHLY',
        openings: 12,
        responsibilities: [
          'Process purchase orders and match three-way delivery challans',
          'Prepare weekly bank balance reports and tax invoices',
          'Coordinate with statutory auditors during quarterly reviews'
        ],
        requiredDocuments: ['B.Com / M.Com Degree', 'Aadhaar Card', 'PAN Card', 'Experience Letters'],
        applicationDeadline: '2026-11-10',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-20T09:30:00.000Z',
        updatedAt: '2026-02-20T09:30:00.000Z',
      },
      {
        id: 'job_all_04',
        title: 'Warehouse Operations & Inventory Lead',
        department: 'Supply Chain & Logistics',
        jobCategory: 'ALL_JOB',
        classification: 'NON_IT',
        companyName: 'Flipkart Fulfillment Center',
        description: 'Supervising inbound loading, barcode scanning, bin location allocation, picking, packing, dispatch auditing, and inventory stock counting.',
        qualification: 'Graduate / Intermediate',
        graduationRequired: false,
        skills: ['Inventory Auditing', 'WMS Software', 'Shift Management', '5S Standards', 'Stock Reconciliation'],
        experienceRequirement: '2+ years in warehouse or e-commerce hub',
        jobType: 'SHIFT_BASED',
        location: 'Medchal, Telangana',
        salaryMin: 28000,
        salaryMax: 40000,
        salaryPeriod: 'MONTHLY',
        openings: 20,
        responsibilities: [
          'Supervise team of 30 warehouse associates across morning and evening shifts',
          'Ensure zero damage during handling and fast dock-to-stock turnaround',
          'Conduct monthly physical inventory cycle counts'
        ],
        requiredDocuments: ['Education Certificates', 'Aadhaar Card', 'Previous Relieving Letter'],
        applicationDeadline: '2026-10-28',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-22T10:00:00.000Z',
        updatedAt: '2026-02-22T10:00:00.000Z',
      },
      {
        id: 'job_all_05',
        title: 'Customer Support Executive (Voice & Email)',
        department: 'BPO & Customer Success',
        jobCategory: 'ALL_JOB',
        classification: 'NON_IT',
        companyName: 'Teleperformance Business Services',
        description: 'Handling inbound customer queries regarding order tracking, service billing, and resolution delivery with high customer satisfaction score.',
        qualification: 'Intermediate / Graduate',
        graduationRequired: false,
        skills: ['English & Hindi / Telugu Fluency', 'Active Listening', 'CRM Tools', 'Problem Solving'],
        experienceRequirement: '0 - 2 years (Freshers with good spoken skills welcome)',
        jobType: 'FULL_TIME',
        location: 'Madhapur, Hyderabad',
        salaryMin: 22000,
        salaryMax: 30000,
        salaryPeriod: 'MONTHLY',
        openings: 50,
        responsibilities: [
          'Handle 80-100 inbound support inquiries via telephone and ticketing portal',
          'Log customer feedback accurately in Salesforce CRM',
          'Maintain average handling time and first-contact resolution metrics'
        ],
        requiredDocuments: ['Intermediate / Degree Certificate', 'Aadhaar Card', 'PAN Card'],
        applicationDeadline: '2026-11-25',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-25T11:00:00.000Z',
        updatedAt: '2026-02-25T11:00:00.000Z',
      },
      {
        id: 'job_all_06',
        title: 'Logistics Fleet Dispatcher & Route Coordinator',
        department: 'Logistics & Transportation',
        jobCategory: 'ALL_JOB',
        classification: 'LOGISTICS',
        companyName: 'Blue Dart Express (Partner Placement)',
        description: 'Assign daily delivery routes, monitor GPS courier vans, resolve parcel delivery exceptions, and maintain on-time hub turnaround.',
        qualification: 'Graduate / Intermediate',
        graduationRequired: false,
        skills: ['Fleet Tracking', 'Route Optimization', 'Vendor Coordination', 'Logistics Software', 'Time Management'],
        experienceRequirement: '1+ years in express logistics or courier operations',
        jobType: 'SHIFT_BASED',
        location: 'Begumpet Hub & Shamshabad Cargo',
        salaryMin: 24000,
        salaryMax: 32000,
        salaryPeriod: 'MONTHLY',
        openings: 18,
        responsibilities: [
          'Dispatch 45+ daily delivery vehicle routes across twin cities',
          'Monitor delivery exceptions and address customer reschedules in real time',
          'Coordinate vehicle servicing schedules and fuel consumption logs'
        ],
        requiredDocuments: ['Intermediate / Graduation Certificate', 'Aadhaar Card', 'Driving License if any'],
        applicationDeadline: '2026-11-15',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-26T09:00:00.000Z',
        updatedAt: '2026-02-26T09:00:00.000Z',
      },
      {
        id: 'job_all_07',
        title: 'Pharmacy Dispensing Trainee / Store Assistant',
        department: 'Retail Healthcare',
        jobCategory: 'ALL_JOB',
        classification: 'HEALTHCARE',
        companyName: 'Apollo Pharmacy Retail (Placement Partner)',
        description: 'Assist licensed pharmacists in prescription fulfillment, medicine inventory storage, OTC product sales, and billing system billing.',
        qualification: 'D.Pharm / B.Pharm / 12th Science',
        graduationRequired: false,
        skills: ['Prescription Reading', 'Drug Nomenclature', 'Customer Service', 'POS Billing', 'Inventory Sorting'],
        experienceRequirement: 'Freshers or 0-1 year experience',
        jobType: 'FULL_TIME',
        location: 'Kukatpally, Kondapur, Secunderabad',
        salaryMin: 20000,
        salaryMax: 27000,
        salaryPeriod: 'MONTHLY',
        openings: 25,
        responsibilities: [
          'Locate prescribed medications on categorized pharmacy racks',
          'Verify batch numbers and expiry dates prior to barcode scanning',
          'Support store manager with weekly distributor order replenishment'
        ],
        requiredDocuments: ['Pharmacy Diploma / 12th Certificate', 'Aadhaar Card', 'Medical Council Registration if applicable'],
        applicationDeadline: '2026-11-20',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-02-27T10:30:00.000Z',
        updatedAt: '2026-02-27T10:30:00.000Z',
      },
      {
        id: 'job_all_08',
        title: 'Data Entry Operator & MIS Executive',
        department: 'Operations & BPO',
        jobCategory: 'ALL_JOB',
        classification: 'OFFICE',
        companyName: 'Tech Mahindra BPS (Partner Opportunity)',
        description: 'Fast and accurate data entry, digitization of handwritten forms, Excel spreadsheet validation, and daily discrepancy reporting.',
        qualification: 'Graduate (Any stream) / 12th Pass with 35+ WPM',
        graduationRequired: false,
        skills: ['35+ WPM Typing Speed', 'Excel Formulas', 'Attention to Detail', 'Data Validation', 'Speed Accuracy'],
        experienceRequirement: '0 - 1 year',
        jobType: 'FULL_TIME',
        location: 'Bahadurpally, Hyderabad',
        salaryMin: 21000,
        salaryMax: 26000,
        salaryPeriod: 'MONTHLY',
        openings: 35,
        responsibilities: [
          'Process digitized application forms with 99.5% keystroke accuracy',
          'Validate fields against statutory document scans (PAN, Aadhaar)',
          'Generate end-of-day discrepancy reconciliation reports'
        ],
        requiredDocuments: ['12th / Degree Marksheets', 'Aadhaar Card', 'Typing Speed Certificate if available'],
        applicationDeadline: '2026-10-31',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-03-01T12:00:00.000Z',
        updatedAt: '2026-03-01T12:00:00.000Z',
      },
      {
        id: 'job_all_09',
        title: 'Solar Rooftop Installation & Maintenance Technician',
        department: 'Renewable Energy & Infrastructure',
        jobCategory: 'ALL_JOB',
        classification: 'NON_IT',
        companyName: 'Tata Power Solar (Placement Partner)',
        description: 'Mount solar panels on commercial and residential rooftops, connect DC cabling, test inverter feeds, and carry out regular maintenance checks.',
        qualification: 'ITI Electrical / Solar PV Technician Certificate',
        graduationRequired: false,
        skills: ['Solar PV Installation', 'DC Cabling', 'Inverter Connections', 'Working at Heights', 'Physical Agility'],
        experienceRequirement: '1+ years in rooftop solar or electrical projects',
        jobType: 'FULL_TIME',
        location: 'Hyderabad Regional Sites',
        salaryMin: 23000,
        salaryMax: 31000,
        salaryPeriod: 'MONTHLY',
        openings: 16,
        responsibilities: [
          'Install aluminum mounting structures on industrial sheds and roofs',
          'String photovoltaic solar modules and route conduits safely',
          'Conduct earthing resistance and open-circuit voltage tests'
        ],
        requiredDocuments: ['ITI Certificate / Solar PV Certificate', 'Aadhaar Card', 'Height Safety Fitness Certificate'],
        applicationDeadline: '2026-11-25',
        status: 'OPEN',
        wasReopened: false,
        createdAt: '2026-03-02T14:00:00.000Z',
        updatedAt: '2026-03-02T14:00:00.000Z',
      },
    ];

    // Historical Applicants Generator for "Security / Facility Staff" (Job ID 'job_av_01')
    // The prompt requirement: "Past applicants: 127. Job is closed. Later Admin reopens: Security / Facility Staff.
    // System should identify: Previous applicants = 127. Admin should see: '127 previous applicants' and a: NOTIFY APPLICANTS button."
    const applications: ManpowerApplication[] = [];
    const historicalCandidateProfiles: CandidateProfile[] = [];
    const historicalUsers: User[] = [];

    const firstNames = ['Suresh', 'Kavitha', 'Praveen', 'Anil', 'Lakshmi', 'Naveen', 'Raju', 'Swathi', 'Kiran', 'Deepak', 'Manjula', 'Prasad', 'Sandhya', 'Ganesh', 'Radha', 'Naresh', 'Saritha', 'Ashok', 'Sravani', 'Mahesh'];
    const lastNames = ['Yadav', 'Reddy', 'Goud', 'Rao', 'Verma', 'Sharma', 'Patel', 'Chary', 'Naidu', 'Kumar', 'Mudhiraj', 'Babu', 'Prasad', 'Rani', 'Das', 'Singh', 'Gupta'];
    const qualifications = ['10th Pass', '12th Pass', 'Graduate (B.A.)', 'Graduate (B.Com)', 'Graduate (B.Sc)', 'Diploma in ITI'];
    const cities = ['Hyderabad', 'Secunderabad', 'Warangal', 'Khammam', 'Karimnagar', 'Nizamabad', 'Mahabubnagar'];

    for (let i = 1; i <= 127; i++) {
      const fn = firstNames[(i * 3 + 7) % firstNames.length];
      const ln = lastNames[(i * 5 + 3) % lastNames.length];
      const uId = `usr_hist_${i.toString().padStart(3, '0')}`;
      const cId = `prof_hist_${i.toString().padStart(3, '0')}`;
      const appId = `app_hist_${i.toString().padStart(3, '0')}`;
      const phone = `98${Math.floor(10000000 + (i * 68421) % 89999999)}`;
      const qual = qualifications[i % qualifications.length];
      const city = cities[i % cities.length];
      const monthOffset = (i % 24) + 1;
      const date = new Date(Date.now() - monthOffset * 28 * 86400000);
      const isoDate = date.toISOString();

      historicalUsers.push({
        id: uId,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
        mobile: phone,
        role: 'candidate',
        createdAt: isoDate,
      });

      historicalCandidateProfiles.push({
        id: cId,
        userId: uId,
        fullName: `${fn} ${ln}`,
        mobile: phone,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
        dob: `199${(i % 9) + 1}-0${(i % 9) + 1}-15`,
        qualification: qual,
        graduation: qual.includes('Graduate') ? qual : 'None',
        skills: ['Premises Security', 'Access Control', 'Physical Fitness', 'Night Duty'],
        experienceYears: (i % 6) + 1,
        preferredJob: 'Security / Facility Staff',
        preferredLocation: city,
        address: `House No ${i + 12}, Street 4, ${city}, Telangana`,
        registrationStatus: 'ACTIVE',
        createdAt: isoDate,
        updatedAt: isoDate,
      });

      // Statuses vary across historical applicants: REJECTED, WITHDRAWN, CLOSED, etc.
      const statusList: ManpowerApplication['applicationStatus'][] = [
        'REJECTED',
        'CLOSED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'REJECTED',
        'CLOSED',
      ];
      const appStatus = i === 1 ? 'SELECTED' : statusList[i % statusList.length];

      applications.push({
        id: appId,
        candidateId: cId,
        userId: uId,
        jobId: 'job_av_01',
        jobCategory: 'AV_JOB',
        appliedDate: isoDate,
        applicationStatus: appStatus,
        notes: `Historical applicant #${i} for Security / Facility Staff.`,
        adminRemarks: i % 3 === 0 ? 'Good physical fitness; kept on talent pool file.' : undefined,
        rejectionReason: appStatus === 'REJECTED' ? 'Position vacancy filled in previous cohort.' : undefined,
        createdAt: isoDate,
        updatedAt: isoDate,
      });
    }

    // Rahul Sharma's application
    applications.push({
      id: 'app_cand_01',
      candidateId: 'prof_cand_01',
      userId: 'usr_cand_01',
      jobId: 'job_av_02', // Office Assistant
      jobCategory: 'AV_JOB',
      appliedDate: '2026-01-12T14:30:00.000Z',
      applicationStatus: 'SHORTLISTED',
      notes: 'Fluent in MS Office & customer communication.',
      createdAt: '2026-01-12T14:30:00.000Z',
      updatedAt: '2026-01-15T11:00:00.000Z',
    });

    // Anita Reddy's application in 3-level approval
    applications.push({
      id: 'app_cand_02',
      candidateId: 'prof_cand_02',
      userId: 'usr_cand_02',
      jobId: 'job_av_03', // Healthcare Support Staff
      jobCategory: 'AV_JOB',
      appliedDate: '2026-02-02T10:00:00.000Z',
      applicationStatus: 'SELECTED',
      notes: 'Selected after personal interview with Dr. Ramesh. Advancing to 3-Level Job Confirmation.',
      createdAt: '2026-02-02T10:00:00.000Z',
      updatedAt: '2026-02-05T16:00:00.000Z',
    });

    // 3-Level Job Approvals for Anita Reddy
    const jobApprovals: JobApproval[] = [
      {
        id: 'appr_01',
        applicationId: 'app_cand_02',
        candidateId: 'prof_cand_02',
        userId: 'usr_cand_02',
        jobId: 'job_av_03',
        level: 1,
        levelName: 'LEVEL_1_HR',
        approverId: 'usr_hr_01',
        approverName: 'Sunita Sharma (HR Lead)',
        approverRole: 'HR Manager',
        status: 'APPROVED',
        remarks: 'All nursing diplomas, background checks and Aadhaar verification cleared with distinction.',
        decidedAt: '2026-02-06T11:30:00.000Z',
      },
      {
        id: 'appr_02',
        applicationId: 'app_cand_02',
        candidateId: 'prof_cand_02',
        userId: 'usr_cand_02',
        jobId: 'job_av_03',
        level: 2,
        levelName: 'LEVEL_2_OPERATIONS',
        approverId: 'usr_ops_01',
        approverName: 'Manoj Kumar (Operations Head)',
        approverRole: 'Operations Head',
        status: 'APPROVED',
        remarks: 'Shift flexibility and hospital station allocation reviewed and accepted.',
        decidedAt: '2026-02-07T15:00:00.000Z',
      },
      {
        id: 'appr_03',
        applicationId: 'app_cand_02',
        candidateId: 'prof_cand_02',
        userId: 'usr_cand_02',
        jobId: 'job_av_03',
        level: 3,
        levelName: 'LEVEL_3_DIRECTOR',
        approverId: 'usr_admin_01',
        approverName: 'Dr. Ramesh Chandra (Director)',
        approverRole: 'Managing Director',
        status: 'PENDING', // Awaiting final approval in Admin portal!
        remarks: 'Pending final executive sign-off for appointment letter dispatch.',
      },
    ];

    // Attendance history for Vikram Singh (emp_01: AV-EMP-2026-0042) for September 2026
    const todayStr = '2026-09-16';
    const attendance: EmployeeAttendance[] = [];

    // Seed past days 1 to 15 of September 2026
    for (let day = 1; day <= 15; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateKey = `2026-09-${dayStr}`;
      const isSunday = day === 6 || day === 13;

      if (isSunday) {
        attendance.push({
          id: `att_emp_01_${dateKey}`,
          employeeId: 'AV-EMP-2026-0042',
          date: dateKey,
          dutyStatus: 'OFF',
          currentActivity: 'OFF_DUTY',
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
          totalLunchMinutes: 0,
          sessions: [],
        });
      } else {
        attendance.push({
          id: `att_emp_01_${dateKey}`,
          employeeId: 'AV-EMP-2026-0042',
          date: dateKey,
          clockInTime: '08:58:00',
          clockOutTime: '18:05:00',
          dutyStatus: 'PRESENT',
          currentActivity: 'OFF_DUTY',
          totalWorkMinutes: 480,
          totalBreakMinutes: 25,
          totalLunchMinutes: 45,
          sessions: [
            {
              id: `sess_${dateKey}_1`,
              type: 'WORK',
              startTime: `${dateKey}T09:00:00.000Z`,
              endTime: `${dateKey}T13:00:00.000Z`,
              durationMinutes: 240,
            },
            {
              id: `sess_${dateKey}_2`,
              type: 'LUNCH',
              startTime: `${dateKey}T13:00:00.000Z`,
              endTime: `${dateKey}T13:45:00.000Z`,
              durationMinutes: 45,
            },
            {
              id: `sess_${dateKey}_3`,
              type: 'WORK',
              startTime: `${dateKey}T13:45:00.000Z`,
              endTime: `${dateKey}T18:00:00.000Z`,
              durationMinutes: 240,
            },
          ],
        });
      }
    }

    // Demo current-day placeholder starts clean; users build the day dynamically with clock-in/out.
    attendance.push({
      id: 'att_emp_01_today',
      employeeId: 'AV-EMP-2026-0042',
      date: todayStr,
      dutyStatus: 'ABSENT',
      currentActivity: 'OFF_DUTY',
      totalWorkMinutes: 0,
      totalBreakMinutes: 0,
      totalLunchMinutes: 0,
      sessions: [],
    });

    const leaves: EmployeeLeave[] = [
      {
        id: 'leave_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        leaveType: 'CASUAL',
        startDate: '2026-08-10',
        endDate: '2026-08-11',
        totalDays: 2,
        reason: 'Attending family religious ceremony in native town.',
        status: 'APPROVED',
        reviewedBy: 'Manoj Kumar (Operations Head)',
        reviewRemarks: 'Approved with shift handover to Reliever Guard.',
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-02T14:00:00.000Z',
      },
      {
        id: 'leave_02',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        leaveType: 'EARNED',
        startDate: '2026-10-05',
        endDate: '2026-10-08',
        totalDays: 4,
        reason: 'Annual festival leave and home renovation.',
        status: 'PENDING',
        createdAt: '2026-09-10T12:00:00.000Z',
        updatedAt: '2026-09-10T12:00:00.000Z',
      },
    ];

    const complaints: EmployeeComplaint[] = [
      {
        id: 'comp_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        title: 'Biometric Gate Reader Intermittent Sync Error',
        description: 'Gate 2 biometric fingerprint scanner delays reading during morning rush hour (08:45 - 09:15 AM). Needs firmware recalibration.',
        category: 'FACILITY',
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        adminResponse: 'Facility IT team notified; technician scheduled for sensor lens replacement.',
        createdAt: '2026-09-12T09:30:00.000Z',
        updatedAt: '2026-09-13T10:00:00.000Z',
      },
    ];

    const personalNotes: EmployeePersonalNote[] = [
      {
        id: 'note_01',
        employeeId: 'AV-EMP-2026-0042',
        title: 'Emergency Contact Drill Checklist',
        content: 'Check fire valve pressure in Zone B every Tuesday morning. Ensure visitor badge register has at least 3 spare receipt booklets.',
        color: 'amber',
        createdAt: '2026-08-20T10:00:00.000Z',
        updatedAt: '2026-08-20T10:00:00.000Z',
      },
      {
        id: 'note_02',
        employeeId: 'AV-EMP-2026-0042',
        title: 'Uniform Laundry Schedule',
        content: 'Drop off badge blazer on alternate Fridays with the foundation laundry coordinator.',
        color: 'blue',
        createdAt: '2026-09-01T15:00:00.000Z',
        updatedAt: '2026-09-01T15:00:00.000Z',
      },
    ];

    const communications: EmployeeCommunication[] = [
      {
        id: 'comm_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        subject: 'Shift timing coordination for upcoming district health camp',
        message: 'Dear Manoj Sir, for the upcoming Mega Free Health Camp this Sunday at Shamshabad Center, I can take the lead 07:00 AM opening shift. Kindly confirm the gate crew dispatch list.',
        category: 'DUTY_UPDATE',
        reply: 'Confirmed Vikram. Ramesh and Kiran will join you as wing guards at 07:00 AM sharp. Refreshments have been arranged.',
        repliedBy: 'Manoj Kumar (Operations Head)',
        repliedAt: '2026-09-14T11:30:00.000Z',
        readByAdmin: true,
        readByEmployee: true,
        createdAt: '2026-09-14T09:00:00.000Z',
      },
    ];

    const salaries: EmployeeSalary[] = [
      {
        id: 'sal_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        month: '2026-08',
        basicPay: 18000,
        hra: 4500,
        allowances: 3500,
        deductions: 1200,
        netPay: 24800,
        paymentStatus: 'PAID',
        paymentDate: '2026-09-01',
        paySlipUrl: '/documents/salary/AVF_PAYSLIP_2026_08_0042.pdf',
      },
      {
        id: 'sal_02',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        month: '2026-07',
        basicPay: 18000,
        hra: 4500,
        allowances: 3500,
        deductions: 1200,
        netPay: 24800,
        paymentStatus: 'PAID',
        paymentDate: '2026-08-01',
        paySlipUrl: '/documents/salary/AVF_PAYSLIP_2026_07_0042.pdf',
      },
    ];

    const idCards: EmployeeIdCard[] = [
      {
        id: 'idc_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        department: 'Security & Facility Operations',
        designation: 'Facility Operations Supervisor',
        joiningDate: '2025-07-01',
        cardCode: 'AVF-SEC-0042',
        qrCodeData: 'https://ayudhvikas.org/verify/emp/AV-EMP-2026-0042',
        issueDate: '2025-07-02',
        validUntil: '2028-06-30',
        status: 'ACTIVE',
      },
      {
        id: 'idc_02',
        employeeId: 'AV-EMP-2026-0043',
        employeeName: 'Priya Narayanan',
        department: 'General Administration',
        designation: 'Senior Administrative Associate',
        joiningDate: '2025-08-15',
        cardCode: 'AVF-ADM-0043',
        qrCodeData: 'https://ayudhvikas.org/verify/emp/AV-EMP-2026-0043',
        issueDate: '2025-08-16',
        validUntil: '2028-08-15',
        status: 'ACTIVE',
      },
      {
        id: 'idc_03',
        employeeId: 'AV-EMP-2026-0044',
        employeeName: 'Mohammed Arshad',
        department: 'Logistics & Fleet Transport',
        designation: 'Senior Commercial Fleet Driver',
        joiningDate: '2025-09-01',
        cardCode: 'AVF-LOG-0044',
        qrCodeData: 'https://ayudhvikas.org/verify/emp/AV-EMP-2026-0044',
        issueDate: '2025-09-02',
        validUntil: '2028-08-31',
        status: 'ACTIVE',
      },
      {
        id: 'idc_04',
        employeeId: 'AV-EMP-2026-0045',
        employeeName: 'K. Sunitha Reddy',
        department: 'Community Health & Caregiving',
        designation: 'Healthcare Support Team Lead',
        joiningDate: '2025-10-10',
        cardCode: 'AVF-HLT-0045',
        qrCodeData: 'https://ayudhvikas.org/verify/emp/AV-EMP-2026-0045',
        issueDate: '2025-10-11',
        validUntil: '2028-10-10',
        status: 'ACTIVE',
      },
      {
        id: 'idc_05',
        employeeId: 'AV-EMP-2026-0046',
        employeeName: 'G. Suresh Babu',
        department: 'Technical Maintenance & Power',
        designation: 'Chief Maintenance Electrician',
        joiningDate: '2025-11-01',
        cardCode: 'AVF-MNT-0046',
        qrCodeData: 'https://ayudhvikas.org/verify/emp/AV-EMP-2026-0046',
        issueDate: '2025-11-02',
        validUntil: '2028-10-31',
        status: 'ACTIVE',
      },
    ];

    const appointmentLetters: AppointmentLetter[] = [
      {
        id: 'appt_01',
        employeeId: 'AV-EMP-2026-0042',
        employeeName: 'Vikram Singh',
        refNo: 'AVF/2025/MANPOWER/APPT-0042',
        issuedDate: '2025-07-01',
        joiningDate: '2025-07-01',
        department: 'Security & Facility Operations',
        designation: 'Facility Operations Supervisor',
        salary: 26000,
        terms: [
          'The employee shall be governed by the standard service conduct, safety standards, and operational guidelines of Ayudh Vikas Foundation.',
          'Official working hours shall follow the assigned roster schedule, including emergency facility readiness where mandated.',
          'The employment is subject to annual performance assessment, attendance adherence, and organizational code of ethics.',
          'Termination requires 30 days prior written notice by either party, or basic salary in lieu thereof.'
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      },
      {
        id: 'appt_02',
        employeeId: 'AV-EMP-2026-0043',
        employeeName: 'Priya Narayanan',
        refNo: 'AVF/2025/MANPOWER/APPT-0043',
        issuedDate: '2025-08-15',
        joiningDate: '2025-08-15',
        department: 'General Administration',
        designation: 'Senior Administrative Associate',
        salary: 28000,
        terms: [
          'Responsible for institutional records, donor correspondence, and statutory regulatory filings.',
          'Office hours are 09:30 AM to 06:00 PM, Monday through Saturday.',
          'Subject to organizational privacy and data governance confidentiality policies.'
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      },
      {
        id: 'appt_03',
        employeeId: 'AV-EMP-2026-0044',
        employeeName: 'Mohammed Arshad',
        refNo: 'AVF/2025/MANPOWER/APPT-0044',
        issuedDate: '2025-09-01',
        joiningDate: '2025-09-01',
        department: 'Logistics & Fleet Transport',
        designation: 'Senior Commercial Fleet Driver',
        salary: 26000,
        terms: [
          'Safe operation of foundation commercial transport vehicles, ambulances, and mobile outreach clinics.',
          'Strict adherence to motor vehicle regulations, zero alcohol tolerance, and daily vehicle maintenance checklists.'
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      },
      {
        id: 'appt_04',
        employeeId: 'AV-EMP-2026-0045',
        employeeName: 'K. Sunitha Reddy',
        refNo: 'AVF/2025/MANPOWER/APPT-0045',
        issuedDate: '2025-10-10',
        joiningDate: '2025-10-10',
        department: 'Community Health & Caregiving',
        designation: 'Healthcare Support Team Lead',
        salary: 30000,
        terms: [
          'Lead primary healthcare support teams across regional health camps.',
          'Maintain medical equipment sterility, medicine logbooks, and doctor assistance schedules.'
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      },
      {
        id: 'appt_05',
        employeeId: 'AV-EMP-2026-0046',
        employeeName: 'G. Suresh Babu',
        refNo: 'AVF/2025/MANPOWER/APPT-0046',
        issuedDate: '2025-11-01',
        joiningDate: '2025-11-01',
        department: 'Technical Maintenance & Power',
        designation: 'Chief Maintenance Electrician',
        salary: 27000,
        terms: [
          'Supervise electrical maintenance, solar inverter uptime, and diesel generator emergency readiness.',
          'Enforce strict electrical safety protocols and periodic circuit breaker testing.'
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      },
    ];

    const notifications: ManpowerNotification[] = [
      {
        id: 'notif_01',
        recipientUserId: 'usr_cand_01',
        title: 'Application Shortlisted',
        message: 'Congratulations! Your application for Office Assistant (Job ID: job_av_02) has been shortlisted for personal interaction.',
        type: 'STATUS_CHANGED',
        linkUrl: '/manpower/applications',
        isRead: false,
        deliveryChannel: 'IN_APP',
        createdAt: '2026-01-15T11:05:00.000Z',
      },
      {
        id: 'notif_02',
        recipientUserId: 'usr_cand_02',
        title: 'Level 2 Operations Clearance Approved',
        message: 'Your candidature for Healthcare Support Staff has received Level 2 Operations approval and is now pending final Director confirmation.',
        type: 'APPROVAL_REQUIRED',
        linkUrl: '/manpower/applications',
        isRead: false,
        deliveryChannel: 'IN_APP',
        createdAt: '2026-02-07T15:05:00.000Z',
      },
    ];

    return {
      users: [adminUser, hrUser, opsUser, staffUser, candidateUser, candidate2User, employeeUser, ...historicalUsers],
      candidateProfiles: [candidateProfile, candidate2Profile, ...historicalCandidateProfiles],
      registrations: [registration, registration2],
      paymentOrders: [paymentOrder],
      jobs,
      applications,
      jobApprovals,
      employees: [employee, employee2, employee3, employee4, employee5],
      attendance,
      leaves,
      complaints,
      personalNotes,
      communications,
      salaries,
      idCards,
      appointmentLetters,
      notifications,
    };
  }
}

export const db = new Database();
