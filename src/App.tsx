import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Public & Candidate Pages
import { HomePage } from './pages/HomePage';
import { JobsListPage } from './pages/JobsListPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { CandidateRegisterPage } from './pages/CandidateRegisterPage';
import { CandidateApplicationsPage } from './pages/CandidateApplicationsPage';

// Employee Portal Pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { AttendancePage } from './pages/employee/AttendancePage';
import { LeavePage } from './pages/employee/LeavePage';
import { ComplaintsPage } from './pages/employee/ComplaintsPage';
import { PersonalNotesPage } from './pages/employee/PersonalNotesPage';
import { CommunicationPage } from './pages/employee/CommunicationPage';
import { SalaryPage } from './pages/employee/SalaryPage';
import { DocumentsPage } from './pages/employee/DocumentsPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { JobManagementPage } from './pages/admin/JobManagementPage';
import { ApprovalsPage } from './pages/admin/ApprovalsPage';
import { AVApplicationsPage } from './pages/admin/AVApplicationsPage';
import { AllApplicationsPage } from './pages/admin/AllApplicationsPage';
import { HistoricalSearchPage } from './pages/admin/HistoricalSearchPage';
import { AdminAttendancePage } from './pages/admin/AdminAttendancePage';
import { AdminLeavesPage } from './pages/admin/AdminLeavesPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { EmployeesDirectoryPage } from './pages/admin/EmployeesDirectoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_#dcfce7_0,_#f7fee7_28%,_#ffffff_58%,_#ecfdf5_100%)] text-slate-900">
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              {/* Home & Candidate Routes */}
              <Route path="/" element={<Navigate to="/manpower" replace />} />
              <Route path="/manpower" element={<HomePage />} />
              <Route path="/manpower/jobs" element={<JobsListPage />} />
              <Route path="/manpower/jobs/av" element={<JobsListPage categoryOverride="AV_JOB" />} />
              <Route path="/manpower/jobs/all" element={<JobsListPage categoryOverride="ALL_JOB" />} />
              <Route path="/manpower/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/manpower/register" element={<CandidateRegisterPage />} />
              <Route path="/manpower/apply" element={<CandidateRegisterPage />} />
              <Route path="/candidate/register" element={<CandidateRegisterPage />} />
              <Route path="/manpower/applications" element={<CandidateApplicationsPage />} />

              {/* Employee Routes */}
              <Route path="/manpower/employee" element={<EmployeeDashboardPage />} />
              <Route path="/manpower/employee/dashboard" element={<EmployeeDashboardPage />} />
              <Route path="/manpower/employee/attendance" element={<AttendancePage />} />
              <Route path="/manpower/employee/leave" element={<LeavePage />} />
              <Route path="/manpower/employee/complaints" element={<ComplaintsPage />} />
              <Route path="/manpower/employee/notes" element={<PersonalNotesPage />} />
              <Route path="/manpower/employee/communication" element={<CommunicationPage />} />
              <Route path="/manpower/employee/salary" element={<SalaryPage />} />
              <Route path="/manpower/employee/documents" element={<DocumentsPage />} />

              {/* Admin Routes */}
              <Route path="/manpower/admin" element={<AdminDashboardPage />} />
              <Route path="/manpower/admin/jobs" element={<JobManagementPage />} />
              <Route path="/manpower/admin/approvals" element={<ApprovalsPage />} />
              <Route path="/manpower/admin/employees" element={<EmployeesDirectoryPage />} />
              <Route path="/manpower/admin/av-applications" element={<AVApplicationsPage />} />
              <Route path="/manpower/admin/all-applications" element={<AllApplicationsPage />} />
              <Route path="/manpower/admin/search" element={<HistoricalSearchPage />} />
              <Route path="/manpower/admin/attendance" element={<AdminAttendancePage />} />
              <Route path="/manpower/admin/leaves" element={<AdminLeavesPage />} />
              <Route path="/manpower/admin/complaints" element={<AdminComplaintsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/manpower" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
