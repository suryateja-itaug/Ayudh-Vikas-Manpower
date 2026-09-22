import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  Briefcase,
  Clock,
  FileCheck2,
  LogIn,
  Menu,
  Shield,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationModal';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const {
    user,
    portalMode,
    setPortalMode,
    isRegisteredCandidate,
    employeeRecord,
    logout,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        setUnreadCount(res.unreadCount);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (location.pathname.startsWith('/manpower/staff')) {
      if (portalMode !== 'staff') setPortalMode('staff');
    } else if (location.pathname.startsWith('/manpower/admin')) {
      if (portalMode !== 'admin') setPortalMode('admin');
    } else if (location.pathname.startsWith('/manpower/employee')) {
      if (portalMode !== 'employee') setPortalMode('employee');
    } else {
      if (portalMode !== 'candidate') setPortalMode('candidate');
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/manpower' && location.pathname === '/manpower') return true;
    if (path === '/manpower/admin' && location.pathname === '/manpower/admin') return true;
    if (path === '/manpower/employee' && location.pathname === '/manpower/employee') return true;
    if (path === '/manpower/staff' && location.pathname === '/manpower/staff') return true;
    if (['/manpower/admin', '/manpower/employee', '/manpower/staff'].includes(path)) return false;
    if (path !== '/manpower' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/manpower');
  };

  const navLinkClass = (path: string, activeClass = 'bg-emerald-100 text-emerald-900') =>
    `px-3 py-1.5 rounded-md font-medium transition-colors ${
      isActive(path)
        ? `${activeClass} font-semibold`
        : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
    }`;

  const renderNavLinks = (mobile = false) => {
    const linkClass = mobile
      ? 'px-3 py-2 rounded-lg hover:bg-slate-100 font-medium'
      : '';

    if (portalMode === 'employee') {
      return (
        <>
          <Link to="/manpower/employee/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/employee/dashboard', 'bg-emerald-600 text-white')}>Employee Dashboard</Link>
          <Link to="/manpower/employee/attendance" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : `${navLinkClass('/manpower/employee/attendance', 'bg-emerald-600 text-white')} flex items-center space-x-1`}>
            {!mobile && <Clock className="w-3.5 h-3.5" />}
            <span>Duty & Attendance</span>
          </Link>
          <Link to="/manpower/employee/leave" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/employee/leave')}>Leave Requests</Link>
          <Link to="/manpower/employee/salary" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/employee/salary')}>Salary & Payslips</Link>
          <Link to="/manpower/employee/documents" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : `${navLinkClass('/manpower/employee/documents')} flex items-center space-x-1`}>
            {!mobile && <Award className="w-3.5 h-3.5 text-emerald-600" />}
            <span>ID Card & Letter</span>
          </Link>
        </>
      );
    }

    if (portalMode === 'admin') {
      return (
        <>
          <Link to="/manpower/admin" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin', 'bg-teal-600 text-white')}>Dashboard & KPIs</Link>
          <Link to="/manpower/admin/jobs" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/jobs', 'bg-teal-600 text-white')}>Job Management</Link>
          <Link to="/manpower/admin/users" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/users', 'bg-teal-100 text-teal-900')}>Users & Roles</Link>
          <Link to="/manpower/admin/pipeline" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/pipeline', 'bg-teal-100 text-teal-900')}>Pipeline</Link>
          <Link to="/manpower/admin/av-applications" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/av-applications', 'bg-teal-100 text-teal-900')}>AV Job Applications</Link>
          <Link to="/manpower/admin/all-applications" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/all-applications', 'bg-teal-100 text-teal-900')}>All Job Applications</Link>
          <Link to="/manpower/admin/search" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/search', 'bg-teal-100 text-teal-900')}>Historical Candidate Search</Link>
          <Link to="/manpower/admin/approvals" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/approvals', 'bg-emerald-600 text-white')}>3-Level Approvals</Link>
          <Link to="/manpower/admin/employees" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/employees', 'bg-teal-100 text-teal-900')}>Employees Directory</Link>
          <Link to="/manpower/admin/reports" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/admin/reports', 'bg-teal-100 text-teal-900')}>Reports</Link>
        </>
      );
    }

    if (portalMode === 'staff') {
      return (
        <>
          <Link to="/manpower/staff" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/staff', 'bg-emerald-600 text-white')}>AV Application Review</Link>
          <Link to="/manpower/staff/walk-in" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : `${navLinkClass('/manpower/staff/walk-in')} flex items-center space-x-1`}>
            {!mobile && <UserPlus className="w-3.5 h-3.5" />}
            <span>Walk-in Registration</span>
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to="/manpower" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower')}>Overview</Link>
        <Link to="/manpower/jobs/av" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/jobs/av', 'bg-emerald-600 text-white')}>AV Jobs</Link>
        <Link to="/manpower/jobs/all" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/jobs/all', 'bg-teal-600 text-white')}>All Jobs</Link>
        {user?.role === 'candidate' && (
          <Link to="/manpower/applications" onClick={() => setMobileMenuOpen(false)} className={mobile ? linkClass : navLinkClass('/manpower/applications')}>My Applications</Link>
        )}
      </>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold tracking-wide uppercase text-[11px]">Ayudh Vikas Foundation</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">Empowerment & Manpower Placement Mission</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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

            <div className="flex items-center space-x-2 sm:space-x-3">
              {user && (
                <button
                  onClick={() => setNotificationOpen(true)}
                  className="relative p-2 rounded-lg text-slate-500 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {portalMode === 'candidate' && user?.role === 'candidate' && isRegisteredCandidate && (
                <div className="hidden sm:flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Rs.10 Registration Active</span>
                </div>
              )}

              {portalMode === 'employee' && employeeRecord && (
                <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ID: {employeeRecord.employeeId}</span>
                </div>
              )}

              {user ? (
                <button onClick={handleLogout} className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50">
                  Logout
                </button>
              ) : (
                <Link to="/manpower/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1 py-2 border-t border-slate-100 text-xs overflow-x-auto">
            {renderNavLinks(false)}
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 bg-white p-4 space-y-3">
            <div className="flex flex-col space-y-1 text-sm pt-2">
              {renderNavLinks(true)}
              {user ? (
                <button onClick={handleLogout} className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Logout</button>
              ) : (
                <Link to="/manpower/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 font-medium">Login</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <NotificationDrawer isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </>
  );
};
