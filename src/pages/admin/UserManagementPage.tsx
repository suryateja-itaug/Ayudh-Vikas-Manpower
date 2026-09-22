import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { api } from '../../services/api';
import { ManpowerEmployee, User, UserRole } from '../../types';
import { TablePagination, usePaginatedRows } from '../../components/TablePagination';

type PortalUser = User & { employeeRecord?: ManpowerEmployee };
type ManagedRole = Exclude<UserRole, 'candidate'>;

const managedRoles: ManagedRole[] = ['admin', 'director_admin', 'hr_admin', 'ops_admin', 'staff', 'employee'];

const emptyForm = {
  name: '',
  email: '',
  mobile: '',
  role: 'staff' as ManagedRole,
  password: 'Password@123',
  department: 'Operations',
  designation: 'Operations Associate',
  basicSalary: 18000,
};

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getPortalUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load portal users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return users.filter(item => {
      const text = `${item.name} ${item.email} ${item.mobile} ${item.role} ${item.employeeRecord?.department || ''}`.toLowerCase();
      return (!search || text.includes(search)) && (!roleFilter || item.role === roleFilter);
    });
  }, [users, searchTerm, roleFilter]);

  const pager = usePaginatedRows(filteredUsers, 10);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters with one uppercase letter and one number.' });
      return;
    }
    try {
      setSaving(true);
      const res = await api.createPortalAccount(form);
      setMessage({ type: 'success', text: `${res.user.name} created successfully as ${res.user.role.replace('_', ' ')}.` });
      setForm(emptyForm);
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create user.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: PortalUser) => {
    try {
      const res = await api.updatePortalUser(item.id, { isActive: item.isActive === false });
      setMessage({ type: 'success', text: res.message });
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update user.' });
    }
  };

  const handleSaveSelected = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const res = await api.updatePortalUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        mobile: selectedUser.mobile,
        role: selectedUser.role as ManagedRole,
        isActive: selectedUser.isActive !== false,
        password: resetPassword || undefined,
      });
      setMessage({ type: 'success', text: res.message });
      setSelectedUser(null);
      setResetPassword('');
      await fetchUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save user.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            Admin Access Control
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Users & Roles</h1>
          <p className="mt-1 text-sm text-slate-500">Create staff, HR admin, ops admin, employee, and admin accounts. Candidate accounts stay on candidate registration.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <Metric label="Portal Users" value={users.length} />
          <Metric label="Active" value={users.filter(u => u.isActive !== false).length} />
          <Metric label="Admins" value={users.filter(u => u.role.includes('admin')).length} />
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          Add Member
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          <Field label="Full Name" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} required />
          <Field label="Email / Username" type="email" value={form.email} onChange={value => setForm(prev => ({ ...prev, email: value }))} required />
          <Field label="Mobile" value={form.mobile} onChange={value => setForm(prev => ({ ...prev, mobile: value }))} required />
          <label className="space-y-1.5 font-semibold text-slate-700">
            <span>Role</span>
            <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value as ManagedRole }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
              {managedRoles.map(role => <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </label>
          <Field label="Password" type="password" value={form.password} onChange={value => setForm(prev => ({ ...prev, password: value }))} required />
          <Field label="Department" value={form.department} onChange={value => setForm(prev => ({ ...prev, department: value }))} />
          <Field label="Designation" value={form.designation} onChange={value => setForm(prev => ({ ...prev, designation: value }))} />
          <Field label="Basic Salary" type="number" value={String(form.basicSalary)} onChange={value => setForm(prev => ({ ...prev, basicSalary: Number(value) }))} />
          <div className="xl:col-span-4 flex justify-end">
            <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Create Account'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, role..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700">
            <option value="">All Roles</option>
            {managedRoles.map(role => <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">Loading users...</td></tr>
              ) : pager.paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-black text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">{item.email} | {item.mobile}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-800">{item.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.employeeRecord?.department || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${item.isActive === false ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {item.isActive === false ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggleActive(item)} className="rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700">
                        {item.isActive === false ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => setSelectedUser(item)} className="rounded-xl bg-slate-900 px-3 py-2 font-bold text-white">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={pager.page} totalPages={pager.totalPages} totalItems={filteredUsers.length} pageSize={pager.pageSize} onPageChange={pager.setPage} />
      </section>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Edit Portal User</h2>
                <p className="text-xs text-slate-500">Update login identity, role, password, and account status.</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">Close</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Field label="Full Name" value={selectedUser.name} onChange={value => setSelectedUser(prev => prev ? { ...prev, name: value } : prev)} />
              <Field label="Email" type="email" value={selectedUser.email} onChange={value => setSelectedUser(prev => prev ? { ...prev, email: value } : prev)} />
              <Field label="Mobile" value={selectedUser.mobile} onChange={value => setSelectedUser(prev => prev ? { ...prev, mobile: value } : prev)} />
              <label className="space-y-1.5 font-semibold text-slate-700">
                <span>Role</span>
                <select value={selectedUser.role} onChange={e => setSelectedUser(prev => prev ? { ...prev, role: e.target.value as ManagedRole } : prev)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
                  {managedRoles.map(role => <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 font-semibold text-slate-700 sm:col-span-2">
                <span className="inline-flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Optional Password Reset</span>
                <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Leave blank to keep existing password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setSelectedUser(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700">Cancel</button>
              <button onClick={handleSaveSelected} disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
    <div className="text-xl font-black text-slate-950">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) => (
  <label className="space-y-1.5 font-semibold text-slate-700">
    <span>{label}</span>
    <input type={type} value={value} required={required} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
  </label>
);
