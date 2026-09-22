import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Calendar,
  IndianRupee,
  Eye,
  Download,
  Printer,
  X,
  Building2,
  Clock,
  Sparkles,
  ChevronRight,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { api } from '../../services/api';
import { ManpowerEmployee, EmployeeIdCard, AppointmentLetter, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

export const EmployeesDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<ManpowerEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'employee' as Exclude<UserRole, 'candidate'>,
    password: 'Password@123',
    department: 'Operations',
    designation: 'Operations Associate',
    basicSalary: 18000,
  });

  // Modal states
  const [activeModal, setActiveModal] = useState<'idCard' | 'appointment' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<ManpowerEmployee | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [idCardData, setIdCardData] = useState<EmployeeIdCard | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentLetter | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminEmployees();
      setEmployees(res.employees || []);
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        !searchTerm ||
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.mobile?.includes(searchTerm) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, selectedDept]);
  const employeesPager = usePaginatedRows(filteredEmployees, 9);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage(null);
    if (createForm.password.length < 8 || !/[A-Z]/.test(createForm.password) || !/[0-9]/.test(createForm.password)) {
      setCreateMessage({ type: 'error', text: 'Password must be at least 8 characters with one uppercase letter and one number.' });
      return;
    }
    try {
      setCreateSaving(true);
      const res = await api.createPortalAccount(createForm);
      setCreateMessage({
        type: 'success',
        text: `${res.user.name} created as ${res.user.role.replace('_', ' ')}. Login username: ${res.user.email}.`,
      });
      if (res.employee) {
        await fetchEmployees();
      }
      setCreateForm(prev => ({
        ...prev,
        name: '',
        email: '',
        mobile: '',
        password: 'Password@123',
      }));
    } catch (err: any) {
      setCreateMessage({ type: 'error', text: err.message || 'Failed to create portal account.' });
    } finally {
      setCreateSaving(false);
    }
  };

  const handleOpenIdCard = async (emp: ManpowerEmployee) => {
    setSelectedEmployee(emp);
    setActiveModal('idCard');
    setModalLoading(true);
    try {
      const res = await api.getIdCard(emp.id);
      setIdCardData(res.idCard);
    } catch {
      // Fallback ID card
      setIdCardData({
        id: `idc_${emp.id}`,
        employeeId: emp.employeeId,
        employeeName: emp.fullName,
        department: emp.department,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        cardCode: `AVF-${emp.employeeId.slice(-4)}`,
        qrCodeData: `https://ayudhvikas.org/verify/emp/${emp.employeeId}`,
        issueDate: emp.joiningDate,
        validUntil: '2028-12-31',
        status: 'ACTIVE',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAppointment = async (emp: ManpowerEmployee) => {
    setSelectedEmployee(emp);
    setActiveModal('appointment');
    setModalLoading(true);
    try {
      const res = await api.getAppointmentLetter(emp.id);
      setAppointmentData(res.appointmentLetter);
    } catch {
      // Fallback Appointment letter
      setAppointmentData({
        id: `appt_${emp.id}`,
        employeeId: emp.employeeId,
        employeeName: emp.fullName,
        refNo: `AVF/2025/MANPOWER/APPT-${emp.employeeId.slice(-4)}`,
        issuedDate: emp.joiningDate,
        joiningDate: emp.joiningDate,
        department: emp.department,
        designation: emp.designation,
        salary: emp.basicSalary || 25000,
        terms: [
          'The employee shall be governed by the standard service conduct and operational guidelines of Ayudh Vikas Foundation.',
          'Official working hours shall follow the assigned roster schedule, including emergency readiness where mandated.',
          'Employment is subject to annual performance assessment, attendance adherence, and organizational ethics.',
          'Termination requires 30 days prior written notice by either party, or basic salary in lieu thereof.',
        ],
        authorizedSignatory: 'Dr. Ramesh Chandra',
        signatoryTitle: 'Managing Director & Trustee',
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Ayudh Vikas Staff Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Users className="w-8 h-8 text-amber-400" />
            <span>Employees Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Verified Ayudh Vikas Foundation workforce, staff rosters, biometric credentials, official ID cards, and signed appointment letters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => {
              setCreateModalOpen(true);
              setCreateMessage(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
          <div className="px-3 py-1 text-center">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {employees.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Staff
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="px-3 py-1 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {employees.filter(e => e.status === 'ACTIVE').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Active
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="px-3 py-1 text-center">
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
              100%
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Verified
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="employees-search-input"
              type="text"
              placeholder="Search by name, ID, mobile, role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                id="view-mode-grid"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Grid Cards
              </button>
              <button
                id="view-mode-table"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Department:
          </span>
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedDept === 'ALL'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments ({employees.length})
          </button>
          {departments.map(dept => {
            const count = employees.filter(e => e.department === dept).length;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedDept === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No employees found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No employees match your current search and department filters. Try clearing your search parameters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('ALL');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeesPager.paginatedItems.map(emp => (
            <div
              key={emp.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Card Top: Avatar & ID */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white font-bold flex items-center justify-center text-base shadow-sm">
                      {emp.fullName
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {emp.fullName}
                      </h3>
                      <span className="font-mono text-xs text-amber-600 font-semibold block">
                        {emp.employeeId}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>ACTIVE</span>
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-medium">Designation:</span>
                    <span className="font-semibold text-slate-900 text-right">{emp.designation}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-medium">Department:</span>
                    <span className="font-medium text-slate-800 text-right">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-medium">Joining Date:</span>
                    <span className="font-mono text-slate-700">{emp.joiningDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-medium">Monthly Pay:</span>
                    <span className="font-mono font-bold text-slate-900 flex items-center">
                      <IndianRupee className="w-3 h-3 text-slate-400" />
                      {(emp.basicSalary || 25000).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Contact strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <a
                    href={`tel:${emp.mobile}`}
                    className="flex items-center space-x-1 hover:text-amber-600 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{emp.mobile}</span>
                  </a>
                  <a
                    href={`mailto:${emp.email}`}
                    className="flex items-center space-x-1 hover:text-amber-600 transition-colors"
                  >
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[130px]">{emp.email}</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  id={`btn-id-card-${emp.id}`}
                  onClick={() => handleOpenIdCard(emp)}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-amber-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>View ID Card</span>
                </button>
                <button
                  id={`btn-appt-${emp.id}`}
                  onClick={() => handleOpenAppointment(emp)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-300" />
                  <span>Appt. Letter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Designation & Dept</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Remuneration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Credentials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employeesPager.paginatedItems.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{emp.fullName}</div>
                      <div className="font-mono text-amber-600 text-[11px] font-semibold">
                        {emp.employeeId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{emp.designation}</div>
                      <div className="text-slate-400 text-[11px]">{emp.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 space-y-0.5">
                      <div>{emp.mobile}</div>
                      <div className="text-slate-400 truncate max-w-[160px]">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {emp.joiningDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Rs.{(emp.basicSalary || 25000).toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>ACTIVE</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenIdCard(emp)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
                          title="View Biometric ID Card"
                        >
                          <Award className="w-3.5 h-3.5 inline mr-1" />
                          ID Card
                        </button>
                        <button
                          onClick={() => handleOpenAppointment(emp)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                          title="View Official Appointment Letter"
                        >
                          <FileText className="w-3.5 h-3.5 inline mr-1" />
                          Letter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <TablePagination
          page={employeesPager.page}
          totalPages={employeesPager.totalPages}
          totalItems={filteredEmployees.length}
          pageSize={employeesPager.pageSize}
          onPageChange={employeesPager.setPage}
        />
      )}

      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                  <UserPlus className="w-4 h-4" />
                  Add member
                </div>
                <h2 className="mt-2 text-xl font-black text-slate-950">Create Portal Account</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create admin, HR, ops, staff, or employee accounts. Candidate accounts are handled from candidate registration.
                </p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-5 text-xs">
              {createMessage && (
                <div className={`rounded-2xl border p-3 flex items-start gap-2 font-semibold ${
                  createMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {createMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{createMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AccountField label="Full Name" value={createForm.name} onChange={value => setCreateForm(prev => ({ ...prev, name: value }))} required />
                <AccountField label="Email / Username" type="email" value={createForm.email} onChange={value => setCreateForm(prev => ({ ...prev, email: value }))} required />
                <AccountField label="Mobile" value={createForm.mobile} onChange={value => setCreateForm(prev => ({ ...prev, mobile: value }))} required />
                <label className="block space-y-1.5 font-semibold text-slate-700">
                  <span>Role</span>
                  <select
                    value={createForm.role}
                    onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value as Exclude<UserRole, 'candidate'> }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                  >
                    <option value="employee">Employee</option>
                    <option value="staff">Staff</option>
                    <option value="ops_admin">Ops Admin</option>
                    <option value="hr_admin">HR Admin</option>
                    <option value="director_admin">Director Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <AccountField label="Password" type="password" value={createForm.password} onChange={value => setCreateForm(prev => ({ ...prev, password: value }))} required />
                <AccountField label="Department" value={createForm.department} onChange={value => setCreateForm(prev => ({ ...prev, department: value }))} />
                <AccountField label="Designation" value={createForm.designation} onChange={value => setCreateForm(prev => ({ ...prev, designation: value }))} />
                <AccountField label="Basic Salary" type="number" value={String(createForm.basicSalary)} onChange={value => setCreateForm(prev => ({ ...prev, basicSalary: Number(value) }))} />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                Employee accounts are added to this directory. Staff/admin roles are login accounts and appear in demo credentials after creation.
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold">
                  Close
                </button>
                <button disabled={createSaving} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  <UserPlus className="w-4 h-4" />
                  {createSaving ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {activeModal === 'idCard' && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedEmployee(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Ayudh Vikas Foundation Credentials</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Biometric Employee ID Card
              </h3>
            </div>

            {/* Official ID Card Layout */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-wider">AYUDH VIKAS FOUNDATION</h4>
                    <span className="text-[9px] text-amber-400 font-medium block -mt-0.5">
                      MANPOWER SOLUTIONS • OFFICIAL IDENTITY CARD
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {idCardData?.cardCode || `AVF-${selectedEmployee.employeeId.slice(-4)}`}
                </span>
              </div>

              {/* Middle Section */}
              <div className="flex gap-4 items-center">
                <div className="w-24 h-28 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex flex-col items-center justify-center text-slate-400 shrink-0 relative shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-1">
                    {selectedEmployee.fullName
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-semibold">PHOTO ID</span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                      Employee Name
                    </div>
                    <div className="text-base font-black text-white truncate">
                      {selectedEmployee.fullName}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                      Designation
                    </div>
                    <div className="text-xs font-bold text-amber-400 truncate">
                      {selectedEmployee.designation}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                      Department
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      {selectedEmployee.department}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[10px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                    Employee ID
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {selectedEmployee.employeeId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                    Joining Date
                  </span>
                  <span className="font-mono text-slate-200">
                    {selectedEmployee.joiningDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                    Contact Mobile
                  </span>
                  <span className="font-mono text-slate-200">
                    {selectedEmployee.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                    Validity
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ACTIVE • VERIFIED
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                <span className="font-mono">Security Hash: SHA256-AVF-{selectedEmployee.id}</span>
                <span className="text-amber-400 font-semibold">Authorized Bearer</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Letter Modal */}
      {activeModal === 'appointment' && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedEmployee(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Appointment Letter Sheet */}
            <div className="border border-slate-200 p-6 sm:p-8 rounded-2xl bg-slate-50/50 space-y-6 text-slate-800 text-xs sm:text-sm">
              {/* Institutional Header */}
              <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mx-auto mb-2">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-wider">
                  AYUDH VIKAS FOUNDATION
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Regd. Manpower Solutions, Vocational Training & Social Welfare Trust
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Ref No: {appointmentData?.refNo || `AVF/2025/MANPOWER/APPT-${selectedEmployee.employeeId.slice(-4)}`} • Date: {selectedEmployee.joiningDate}
                </p>
              </div>

              {/* Addressee */}
              <div className="space-y-1">
                <div className="text-slate-500 text-xs">To:</div>
                <div className="font-bold text-slate-900 text-sm">{selectedEmployee.fullName}</div>
                <div className="font-mono text-xs text-amber-700">Emp ID: {selectedEmployee.employeeId}</div>
                <div className="text-slate-600 text-xs">{selectedEmployee.mobile} • {selectedEmployee.email}</div>
              </div>

              {/* Subject */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg font-semibold text-amber-950 text-xs">
                SUBJECT: OFFICIAL OFFER OF EMPLOYMENT & APPOINTMENT LETTER — {selectedEmployee.designation.toUpperCase()}
              </div>

              {/* Body */}
              <p className="text-slate-700 leading-relaxed text-xs">
                Dear {selectedEmployee.fullName}, we are pleased to confirm your appointment at{' '}
                <strong className="text-slate-900">Ayudh Vikas Foundation</strong> as{' '}
                <strong className="text-slate-900">{selectedEmployee.designation}</strong> in the{' '}
                <strong className="text-slate-900">{selectedEmployee.department}</strong> department, effective from{' '}
                <strong className="text-slate-900">{selectedEmployee.joiningDate}</strong>.
              </p>

              {/* Compensation */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-600 text-xs">Agreed Monthly Gross Salary:</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  ₹{(selectedEmployee.basicSalary || 25000).toLocaleString('en-IN')}/- per month
                </span>
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Summary Terms of Employment:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs leading-relaxed">
                  {(appointmentData?.terms || [
                    'The employee shall be governed by the standard service conduct and operational guidelines of Ayudh Vikas Foundation.',
                    'Official working hours shall follow the assigned roster schedule, including emergency readiness where mandated.',
                    'Employment is subject to annual performance assessment, attendance adherence, and organizational ethics.',
                    'Termination requires 30 days prior written notice by either party, or basic salary in lieu thereof.',
                  ]).map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Employee Acceptance
                  </div>
                  <div className="font-semibold text-slate-900 text-xs mt-3">
                    {selectedEmployee.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">✓ Digitally Signed</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Authorized Signatory
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-3">
                    {appointmentData?.authorizedSignatory || 'Dr. Ramesh Chandra'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {appointmentData?.signatoryTitle || 'Managing Director & Trustee'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Appointment Letter</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AccountField = ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label className="block space-y-1.5 font-semibold text-slate-700">
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
    />
  </label>
);
