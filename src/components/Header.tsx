import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Shield,
  UserCheck,
  Bell,
  Clock,
  FileCheck2,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  Award,
  ClipboardCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationModal';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const {
    user,
    portalMode,
    setPortalMode,
    availableUsers,
    switchUser,
    isRegisteredCandidate,
    employeeRecord,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  useEffect(() => {
    // Poll notifications count periodically
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        setUnreadCount(res.unreadCount);
      } catch {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Keep portalMode synchronized with the current URL route
  useEffect(() => {
    if (location.pathname.startsWith('/manpower/staff')) {
      if (portalMode !== 'staff') setPortalMode('staff');
    } else if (location.pathname.startsWith('/manpower/admin')) {
      if (portalMode !== 'admin') setPortalMode('admin');
    } else if (location.pathname.startsWith('/manpower/employee')) {
      if (portalMode !== 'employee') setPortalMode('employee');
    } else if (
      location.pathname === '/manpower' ||
      location.pathname.startsWith('/manpower/jobs') ||
      location.pathname.startsWith('/manpower/register') ||
      location.pathname.startsWith('/manpower/sign-in') ||
      location.pathname.startsWith('/manpower/applications')
    ) {
      if (portalMode !== 'candidate') setPortalMode('candidate');
    }
  }, [location.pathname]);

  const handlePortalSwitch = (mode: 'candidate' | 'employee' | 'admin' | 'staff') => {
    setPortalMode(mode);
    setMobileMenuOpen(false);
    if (mode === 'admin') {
      if (!user?.role?.includes('admin') && user?.role !== 'hr_manager' && user?.role !== 'operations_head') {
        switchUser('usr_admin_01');
      }
      navigate('/manpower/admin');
    } else if (mode === 'employee') {
      if (user?.role !== 'employee') {
        switchUser('usr_emp_01');
      }
      navigate('/manpower/employee/dashboard');
    } else if (mode === 'staff') {
      if (user?.role !== 'staff') {
        switchUser('usr_staff_01');
      }
      navigate('/manpower/staff');
    } else {
      if (user?.role !== 'candidate') {
        switchUser('usr_cand_01');
      }
      navigate('/manpower/jobs/av');
    }
  };

  const isActive = (path: string) => {
    if (path === '/manpower' && location.pathname === '/manpower') return true;
    if (path !== '/manpower' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Organizational Bar & Quick Persona Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-lime-300 font-semibold tracking-wide uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Ayudh Vikas Foundation
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Empowerment & Manpower Placement Mission
            </span>
          </div>

          {/* Quick Persona Switcher for Evaluation */}
          <div className="relative flex items-center space-x-2">
            <span className="text-slate-400 hidden md:inline text-[11px]">Active Persona:</span>
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white px-2.5 py-1 rounded-md border border-white/15 transition-colors text-[11px] font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="max-w-[150px] sm:max-w-[200px] truncate">{user?.name || 'Director Admin'}</span>
                <span className="text-lime-200 uppercase text-[10px] bg-emerald-950/80 px-1.5 py-0.2 rounded font-semibold">
                  {user?.role?.replace('_', ' ') || 'admin'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {personaMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setPersonaMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-emerald-50 transition-colors ${
                        user?.id === u.id ? 'bg-emerald-50/80 font-semibold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{u.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-slate-100 text-slate-600">
                          {u.role.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">{u.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link to="/manpower" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-500 to-lime-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center">
                  AYUDH VIKAS
                  <span className="ml-1.5 text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    MANPOWER
                  </span>
                </span>
                <span className="text-[10px] tracking-wide text-slate-500 font-medium -mt-0.5">
                  Recruitment & Employee Lifecycle Management
                </span>
              </div>
            </Link>

            {/* Middle: Portal Segmented Selector */}
            <div className="hidden lg:flex items-center bg-emerald-50/90 p-1 rounded-xl border border-emerald-100">
              <button
                onClick={() => handlePortalSwitch('candidate')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  portalMode === 'candidate'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Candidate Portal</span>
              </button>

              <button
                onClick={() => handlePortalSwitch('employee')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  portalMode === 'employee'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Employee Portal</span>
                {employeeRecord && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>

              <button
                onClick={() => handlePortalSwitch('staff')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  portalMode === 'staff'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>

              <button
                onClick={() => handlePortalSwitch('admin')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  portalMode === 'admin'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-teal-100 text-teal-800 font-bold">
                  Recruiter
                </span>
              </button>
            </div>

            {/* Right: Notifications & Quick Profile Action */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notification Bell */}
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Status Badge */}
              {portalMode === 'candidate' && (
                isRegisteredCandidate ? (
                  <div className="hidden sm:flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Rs.10 Registration Active</span>
                  </div>
                ) : (
                  <Link to="/manpower/sign-in" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )
              )}

              {portalMode === 'employee' && employeeRecord && (
                <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ID: {employeeRecord.employeeId}</span>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Sub-Navigation Bar based on Active Portal Mode */}
          <nav className="hidden lg:flex items-center space-x-1 py-2 border-t border-slate-100 text-xs overflow-x-auto">
            {portalMode === 'candidate' && (
              <>
                <Link
                  to="/manpower"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower') && location.pathname === '/manpower'
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/manpower/jobs/av"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/jobs/av')
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  AV Jobs
                </Link>
                <Link
                  to="/manpower/jobs/all"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/jobs/all')
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  All Jobs (External)
                </Link>
                <Link
                  to="/manpower/applications"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/applications')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  My Applications
                </Link>
                <Link
                  to="/manpower/sign-in"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/sign-in')
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Sign In
                </Link>
              </>
            )}

            {portalMode === 'employee' && (
              <>
                <Link
                  to="/manpower/employee/dashboard"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/dashboard')
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Employee Dashboard
                </Link>
                <Link
                  to="/manpower/employee/attendance"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/manpower/employee/attendance')
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Duty & Attendance</span>
                </Link>
                <Link
                  to="/manpower/employee/leave"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/leave')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Leave Balance & Requests
                </Link>
                <Link
                  to="/manpower/employee/complaints"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/complaints')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Complaints & Grievances
                </Link>
                <Link
                  to="/manpower/employee/notes"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/notes')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Personal Notes
                </Link>
                <Link
                  to="/manpower/employee/communication"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/communication')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Admin Communication
                </Link>
                <Link
                  to="/manpower/employee/salary"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/employee/salary')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Salary & Payslips
                </Link>
                <Link
                  to="/manpower/employee/documents"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/manpower/employee/documents')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ID Card & Letter</span>
                </Link>
              </>
            )}

            {portalMode === 'admin' && (
              <>
                <Link
                  to="/manpower/admin"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    location.pathname === '/manpower/admin'
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Dashboard & KPIs
                </Link>
                <Link
                  to="/manpower/admin/jobs"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/jobs')
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Job Management (Reopen & Recall)
                </Link>
                <Link
                  to="/manpower/admin/av-applications"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/av-applications')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  AV Job Applications
                </Link>
                <Link
                  to="/manpower/admin/all-applications"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/all-applications')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  All Job Applications
                </Link>
                <Link
                  to="/manpower/admin/search"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/manpower/admin/search')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <span>Historical Candidate Search</span>
                </Link>
                <Link
                  to="/manpower/admin/approvals"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/manpower/admin/approvals')
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>3-Level Approvals</span>
                </Link>
                <Link
                  to="/manpower/admin/employees"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/employees')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Employees Directory
                </Link>
                <Link
                  to="/manpower/admin/attendance"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/attendance')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Attendance Monitoring
                </Link>
                <Link
                  to="/manpower/admin/leaves"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/leaves')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Leave Approvals
                </Link>
                <Link
                  to="/manpower/admin/complaints"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive('/manpower/admin/complaints')
                      ? 'bg-teal-100 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  Complaints
                </Link>
              </>
            )}

            {portalMode === 'staff' && (
              <>
                <Link
                  to="/manpower/staff"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    location.pathname === '/manpower/staff'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  AV Application Review
                </Link>
                <Link
                  to="/manpower/staff/walk-in"
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/manpower/staff/walk-in')
                      ? 'bg-emerald-100 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Walk-in Registration</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 bg-white p-4 space-y-3">
            <div className="flex bg-emerald-50 p-1 rounded-xl">
              <button
                onClick={() => handlePortalSwitch('candidate')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${portalMode === 'candidate' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-600'}`}
              >
                Candidate
              </button>
              <button
                onClick={() => handlePortalSwitch('employee')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${portalMode === 'employee' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600'}`}
              >
                Employee
              </button>
              <button
                onClick={() => handlePortalSwitch('staff')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${portalMode === 'staff' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-600'}`}
              >
                Staff
              </button>
              <button
                onClick={() => handlePortalSwitch('admin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${portalMode === 'admin' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-600'}`}
              >
                Admin
              </button>
            </div>

            <div className="flex flex-col space-y-1 text-sm pt-2">
              {portalMode === 'candidate' && (
                <>
                  <Link to="/manpower/jobs/av" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">AV Jobs</Link>
                  <Link to="/manpower/jobs/all" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">All Jobs (Partner)</Link>
                  <Link to="/manpower/applications" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">My Applications</Link>
                  <Link to="/manpower/sign-in" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Sign In</Link>
                </>
              )}
              {portalMode === 'employee' && (
                <>
                  <Link to="/manpower/employee/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Employee Dashboard</Link>
                  <Link to="/manpower/employee/attendance" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Duty & Attendance</Link>
                  <Link to="/manpower/employee/leave" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Leave Requests</Link>
                  <Link to="/manpower/employee/salary" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Salary & Payslips</Link>
                  <Link to="/manpower/employee/documents" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">ID Card & Letter</Link>
                </>
              )}
              {portalMode === 'admin' && (
                <>
                  <Link to="/manpower/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Admin Dashboard</Link>
                  <Link to="/manpower/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Job Management</Link>
                  <Link to="/manpower/admin/av-applications" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">AV Job Applications</Link>
                  <Link to="/manpower/admin/all-applications" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">All Job Applications</Link>
                  <Link to="/manpower/admin/search" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Historical Candidate Search</Link>
                  <Link to="/manpower/admin/approvals" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">3-Level Approvals</Link>
                </>
              )}
              {portalMode === 'staff' && (
                <>
                  <Link to="/manpower/staff" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">AV Application Review</Link>
                  <Link to="/manpower/staff/walk-in" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Walk-in Registration</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </>
  );
};

