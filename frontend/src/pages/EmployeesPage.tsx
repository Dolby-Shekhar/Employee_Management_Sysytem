import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  approveEmployee,
  deleteEmployee,
  type Employee
} from '../services/employees';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const departments = ['Engineering', 'Product', 'Design', 'Security', 'Executive', 'IT', 'Operations', 'Sales'];

const EmployeesPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManage = isAdmin || isManager;

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [inspectingEmp, setInspectingEmp] = useState<Employee | null>(null);

  // Add form fields
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('company123');
  const [addRole, setAddRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [addDept, setAddDept] = useState('Engineering');
  const [addPosition, setAddPosition] = useState('');
  const [addSalary, setAddSalary] = useState(75000);
  const [addManagerId, setAddManagerId] = useState('');

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editSalary, setEditSalary] = useState(0);
  const [editRole, setEditRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved'>('approved');
  const [editManagerId, setEditManagerId] = useState('');

  const { data: employeesRes, isLoading } = useQuery({
    queryKey: ['employees-list', search, selectedDept, selectedStatus],
    queryFn: () =>
      listEmployees({
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
        department: selectedDept !== 'All' ? selectedDept : undefined,
        status: selectedStatus !== 'All' ? (selectedStatus as 'pending' | 'approved') : undefined
      })
  });

  const employees = employeesRes?.data ?? [];

  // Managers list for assigning manager
  const potentialManagers = employees.filter((e) => e.role === 'manager' || e.role === 'admin');

  // Mutations
  const addMutation = useMutation({
    mutationFn: () =>
      createEmployee({
        name: addName,
        email: addEmail,
        password: addPassword,
        role: addRole,
        department: addDept,
        position: addPosition,
        salary: addSalary,
        managerId: addManagerId || null
      }),
    onSuccess: () => {
      toast.success('Employee added successfully');
      setShowAddModal(false);
      resetAddForm();
      queryClient.invalidateQueries({ queryKey: ['employees-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateEmployee(editingEmp!._id, {
        name: editName,
        department: editDept,
        position: editPosition,
        salary: editSalary,
        role: editRole,
        status: editStatus,
        managerId: editManagerId || null
      }),
    onSuccess: () => {
      toast.success('Employee updated successfully');
      setEditingEmp(null);
      queryClient.invalidateQueries({ queryKey: ['employees-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveEmployee(id),
    onSuccess: () => {
      toast.success('Employee registration approved');
      queryClient.invalidateQueries({ queryKey: ['employees-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      toast.success('Employee record deleted');
      queryClient.invalidateQueries({ queryKey: ['employees-list'] });
    },
    onError: (err) => toast.error(getErrorMessage(err))
  });

  const resetAddForm = () => {
    setAddName('');
    setAddEmail('');
    setAddPassword('company123');
    setAddRole('employee');
    setAddDept('Engineering');
    setAddPosition('');
    setAddSalary(75000);
    setAddManagerId('');
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditDept(emp.department || 'Engineering');
    setEditPosition(emp.position || '');
    setEditSalary(emp.salary || 0);
    setEditRole(emp.role);
    setEditStatus(emp.status);
    setEditManagerId(emp.managerId ? (typeof emp.managerId === 'object' ? emp.managerId._id : emp.managerId) : '');
  };

  const pendingCount = employees.filter((e) => e.status === 'pending').length;
  const approvedCount = employees.filter((e) => e.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400">
              WORKFORCE DIRECTORY
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Employee Management</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage personnel profiles, compensation, departmental assignments, and pending registrations.
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400 sm:self-auto"
            >
              <span className="text-base font-bold">+</span>
              Add Employee
            </button>
          ) : null}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Headcount</p>
          <p className="mt-2 text-3xl font-bold text-white">{isLoading ? '…' : employeesRes?.total ?? 0}</p>
          <p className="mt-1 text-xs text-cyan-400">All registered members</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Active / Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{isLoading ? '…' : approvedCount}</p>
          <p className="mt-1 text-xs text-emerald-300/70">With console access</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Approval</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{isLoading ? '…' : pendingCount}</p>
          <p className="mt-1 text-xs text-amber-300/70">{pendingCount > 0 ? 'Action required' : 'Queue cleared'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Your Access Level</p>
          <p className="mt-2 text-3xl font-bold text-indigo-400">
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
          </p>
          <p className="mt-1 text-xs text-indigo-300/70">Role-scoped governance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or position…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Role & Dept</th>
                <th className="px-4 py-4">Position</th>
                <th className="px-4 py-4">Salary</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map((emp) => {
                const isPending = emp.status === 'pending';
                return (
                  <tr key={emp._id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setInspectingEmp(emp)}
                        className="text-left group"
                      >
                        <p className="font-semibold text-white group-hover:text-cyan-400 transition">
                          {emp.name}
                        </p>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            emp.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : emp.role === 'manager'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {emp.role.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">{emp.department || 'Unassigned'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-300">{emp.position || '—'}</td>

                    <td className="px-4 py-4 font-mono text-slate-300">
                      {emp.salary ? `$${Number(emp.salary).toLocaleString()}/yr` : '—'}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          emp.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            emp.status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {isPending && isAdmin ? (
                          <button
                            type="button"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(emp._id)}
                            className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            Approve
                          </button>
                        ) : null}

                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-cyan-500 hover:text-white"
                          >
                            Edit
                          </button>
                        ) : null}

                        {isAdmin && emp._id !== user?.id ? (
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
                                deleteMutation.mutate(emp._id);
                              }
                            }}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No employees found matching the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Add New Employee</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMutation.mutate();
              }}
              className="mt-4 space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as 'admin' | 'manager' | 'employee')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={addPosition}
                    onChange={(e) => setAddPosition(e.target.value)}
                    placeholder="e.g. Senior Backend Dev"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salary ($/yr)</label>
                  <input
                    type="number"
                    value={addSalary}
                    onChange={(e) => setAddSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Direct Manager</label>
                  <select
                    value={addManagerId}
                    onChange={(e) => setAddManagerId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="">None (Top Level)</option>
                    {potentialManagers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {addMutation.isPending ? 'Saving…' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Employee Modal */}
      {editingEmp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Edit Employee: {editingEmp.name}</h2>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="mt-4 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Position</label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Salary ($/yr)</label>
                  <input
                    type="number"
                    value={editSalary}
                    onChange={(e) => setEditSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'pending' | 'approved')}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {isAdmin ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">System Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as 'admin' | 'manager' | 'employee')}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Direct Manager</label>
                    <select
                      value={editManagerId}
                      onChange={(e) => setEditManagerId(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                    >
                      <option value="">None (Top Level)</option>
                      {potentialManagers
                        .filter((m) => m._id !== editingEmp._id)
                        .map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Updating…' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Inspect Employee Profile Modal */}
      {inspectingEmp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-base border border-cyan-500/40">
                  {inspectingEmp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{inspectingEmp.name}</h3>
                  <p className="text-xs text-slate-400">{inspectingEmp.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEmp(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Position</span>
                <span className="font-medium text-white">{inspectingEmp.position || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Department</span>
                <span className="font-medium text-white">{inspectingEmp.department || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">System Role</span>
                <span className="font-medium text-cyan-400 uppercase text-xs font-semibold">{inspectingEmp.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Status</span>
                <span className={`font-semibold text-xs ${inspectingEmp.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {inspectingEmp.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Annual Compensation</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {inspectingEmp.salary ? `$${Number(inspectingEmp.salary).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Reporting Line</span>
                <span className="font-medium text-slate-300">
                  {inspectingEmp.managerId && typeof inspectingEmp.managerId === 'object'
                    ? inspectingEmp.managerId.name
                    : 'Direct Executive'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingEmp(null)}
                className="w-full rounded-xl bg-slate-800 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EmployeesPage;
