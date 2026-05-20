import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, IconButton, Alert, InputAdornment,
  Avatar, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  People, PersonAdd, AccessTime, Payment,
  Search, Delete as DeleteIcon, Edit as EditIcon,
  AccountCircle
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import Layout from './Layout';
import LoadingScreen from './common/LoadingScreen';
import ConfirmDialog from './common/ConfirmDialog';
import EmptyState from './common/EmptyState';
import { exportToCSV } from '../utils/exportUtils';

const TabPanel = ({ children, value, index }) => (
  value === index && <Box sx={{ py: 2 }}>{children}</Box>
);

const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{
    transition: 'all 0.28s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: 8,
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
            background: color === 'primary' ? 'linear-gradient(135deg,#4f46e5 0%,#60a5fa 100%)' :
                        color === 'warning' ? 'linear-gradient(135deg,#f97316 0%,#fb923c 100%)' :
                        color === 'success' ? 'linear-gradient(135deg,#16a34a 0%,#4ade80 100%)' :
                        'linear-gradient(135deg,#0288d1 0%,#03a9f4 100%)'
          }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const pathToTab = {
  '/dashboard': 0,
  '/dashboard/employees': 1,
  '/dashboard/pending-approvals': 2,
  '/dashboard/attendance': 3,
  '/dashboard/leaves': 4,
  '/dashboard/payroll': 5,
  '/dashboard/profile': 6,
};

const tabToPath = [
  '/dashboard',
  '/dashboard/employees',
  '/dashboard/pending-approvals',
  '/dashboard/attendance',
  '/dashboard/leaves',
  '/dashboard/payroll',
  '/dashboard/profile',
];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(pathToTab[location.pathname] ?? 0);
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingApprovals: 0,
    todayAttendance: 0,
    totalPayroll: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  const [employeeForm, setEmployeeForm] = useState({
    name: '', email: '', password: '', department: '', position: '', salary: '', managerId: '', role: 'employee'
  });

  const [editForm, setEditForm] = useState({});

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [approveLoading, setApproveLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  // Bulk selection state
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', department: '', position: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [, setProfileLoading] = useState(false);
  const [, setPasswordLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const newTab = pathToTab[location.pathname];
    if (newTab !== undefined) setTab(newTab);
  }, [location.pathname]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes, payRes, profRes] = await Promise.all([
        axiosInstance.get('/employees'),
        axiosInstance.get('/attendance/all'),
        axiosInstance.get('/leaves/all'),
        axiosInstance.get('/payroll/all'),
        axiosInstance.get('/profile'),
      ]);

      const empList = empRes.data.data || empRes.data;
      const attList = attRes.data.data || attRes.data;
      const leaveList = leaveRes.data.data || leaveRes.data;
      const payList = payRes.data.data || payRes.data;

      setEmployees(empList);
      setAttendance(attList);
      setLeaves(leaveList);
      setPayrolls(payList);
      setProfile(profRes.data || {});

      const today = new Date().toISOString().split('T')[0];

      setStats({
        totalEmployees: empList.length,
        pendingApprovals: empList.filter(e => e.status === 'pending').length,
        todayAttendance: attList.filter(a =>
          a.date && new Date(a.date).toISOString().split('T')[0] === today
        ).length,
        totalPayroll: payList.reduce((sum, p) => sum + (p.netPay || 0), 0),
      });

    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const employeeColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'position', headerName: 'Position', width: 130 },
    { field: 'role', headerName: 'Role', width: 100 },
    { field: 'salary', headerName: 'Salary', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => (
        <Chip
          label={p.value}
          color={p.value === 'approved' ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (p) => (
        <>
          <IconButton onClick={() => {
            setEditForm(p.row);
            setEditDialog(true);
          }}>
            <EditIcon />
          </IconButton>

          <IconButton color="error" onClick={() => openDeleteConfirm(p.row._id)} disabled={deleteLoading[p.row._id]}>
            {deleteLoading[p.row._id] ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          </IconButton>
        </>
      )
    }
  ];

  const validateEmployeeForm = () => {
    if (!employeeForm.name.trim() || !employeeForm.email.trim() || !employeeForm.password) {
      return 'Name, email, and password are required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeForm.email)) {
      return 'Please enter a valid email address';
    }
    if (employeeForm.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (employeeForm.salary && Number(employeeForm.salary) < 0) {
      return 'Salary cannot be negative';
    }
    if (!emailRegex.test(employeeForm.email)) {
      return 'Please enter a valid email address';
    }
    if (employeeForm.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (employeeForm.salary && Number(employeeForm.salary) < 0) {
      return 'Salary cannot be negative';
    }
    return '';
  };

  const handleAddEmployee = async () => {
    const error = validateEmployeeForm();
    if (error) {
      return setFormError(error);
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        name: employeeForm.name,
        email: employeeForm.email,
        password: employeeForm.password,
        department: employeeForm.department,
        position: employeeForm.position,
        salary: Number(employeeForm.salary) || 0,
      };

      if (employeeForm.role === 'manager') {
        await axiosInstance.post('/employees/add-manager', payload);
        toast.success('Manager / Team Leader added');
      } else {
        await axiosInstance.post('/employees', {
          ...payload,
          managerId: employeeForm.managerId || undefined
        });
        toast.success('Employee / Team Member added');
      }

      setAddEmployeeDialog(false);
      setEmployeeForm({ name: '', email: '', password: '', department: '', position: '', salary: '', managerId: '', role: 'employee' });
      fetchAllData();

    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This action cannot be undone.',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        handleDeleteEmployee(id);
      }
    });
  };

  const handleDeleteEmployee = async (id) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axiosInstance.delete(`/employees/${id}`);
      toast.success('Deleted');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateEmployee = async () => {
    setFormLoading(true);

    try {
      await axiosInstance.put(`/employees/${editForm._id}`, editForm);
      toast.success('Updated');
      setEditDialog(false);
      fetchAllData();

    } catch {
      toast.error('Update failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveEmployee = async (id) => {
    setApproveLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axiosInstance.put(`/employees/${id}/approve`);
      toast.success('Employee approved');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve employee');
    } finally {
      setApproveLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Profile handlers
  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    try {
      await axiosInstance.put('/profile', profileData);
      toast.success('Profile updated');
      setProfileDialog(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedEmployees.map(id => axiosInstance.delete(`/employees/${id}`)));
      toast.success(`${selectedEmployees.length} employees deleted`);
      setSelectedEmployees([]);
      fetchAllData();
    } catch (err) {
      toast.error('Bulk delete failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    const pendingSelected = selectedEmployees.filter(id => {
      const emp = employees.find(e => e._id === id);
      return emp && emp.status === 'pending';
    });
    if (pendingSelected.length === 0) {
      toast.warning('No pending employees selected');
      return;
    }
    setBulkActionLoading(true);
    try {
      await Promise.all(pendingSelected.map(id => axiosInstance.put(`/employees/${id}/approve`)));
      toast.success(`${pendingSelected.length} employees approved`);
      setSelectedEmployees([]);
      fetchAllData();
    } catch (err) {
      toast.error('Bulk approve failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingScreen message="Loading dashboard data..." />
      </Layout>
    );
  }

  const pendingEmployees = employees.filter(e => e.status === 'pending');

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={(e, v) => navigate(tabToPath[v])}>
        <Tab label="Overview" />
        <Tab label="Employees" />
        <Tab label="Pending Approvals" />
        <Tab label="Attendance" />
        <Tab label="Leaves" />
        <Tab label="Payroll" />
        <Tab label="Profile" icon={<AccountCircle sx={{ fontSize: 18 }} />} iconPosition="start" />
      </Tabs>

      {/* OVERVIEW */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Employees" value={stats.totalEmployees} icon={<People />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Pending" value={stats.pendingApprovals} icon={<PersonAdd />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Attendance" value={stats.todayAttendance} icon={<AccessTime />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Payroll" value={`$${stats.totalPayroll.toLocaleString()}`} icon={<Payment />} color="info" />
          </Grid>
        </Grid>
      </TabPanel>

      {/* EMPLOYEES */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <TextField
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedEmployees.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      title: 'Bulk Delete',
                      message: `Delete ${selectedEmployees.length} selected employees? This cannot be undone.`,
                      onConfirm: () => {
                        setConfirmDialog(prev => ({ ...prev, open: false }));
                        handleBulkDelete();
                      }
                    });
                  }}
                  disabled={bulkActionLoading}
                >
                  Delete ({selectedEmployees.length})
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleBulkApprove}
                  disabled={bulkActionLoading}
                >
                  Approve ({selectedEmployees.length})
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => exportToCSV(filteredEmployees, employeeColumns.filter(c => c.field !== 'actions'), 'employees')}
              disabled={filteredEmployees.length === 0}
            >
              Export
            </Button>
            <Button variant="contained" onClick={() => setAddEmployeeDialog(true)}>
              Add Employee
            </Button>
          </Box>
        </Box>

        {filteredEmployees.length === 0 ? (
          <EmptyState message={debouncedSearch ? 'No employees match your search' : 'No employees found'} />
        ) : (
          <DataGrid
            rows={filteredEmployees}
            columns={employeeColumns}
            getRowId={(r) => r._id}
            autoHeight
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            onRowSelectionModelChange={(ids) => setSelectedEmployees(ids)}
            selectionModel={selectedEmployees}
            loading={bulkActionLoading}
          />
        )}
      </TabPanel>

      {/* PENDING APPROVALS */}
      <TabPanel value={tab} index={2}>
        {pendingEmployees.length === 0 ? (
          <EmptyState message="No pending approvals" />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingEmployees.map(emp => (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Chip label={emp.role} color={emp.role === 'manager' ? 'info' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={emp.status} color="warning" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleApproveEmployee(emp._id)} disabled={approveLoading[emp._id]}>
                        {approveLoading[emp._id] ? <CircularProgress size={16} /> : 'Approve'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* ATTENDANCE */}
      <TabPanel value={tab} index={3}>
        {attendance.length === 0 ? (
          <EmptyState message="No attendance records found" />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Clock In</TableCell>
                  <TableCell>Clock Out</TableCell>
                  <TableCell>Late</TableCell>
                  <TableCell>Early Leave</TableCell>
                  <TableCell>Clock In Location</TableCell>
                  <TableCell>Clock Out Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map(a => (
                  <TableRow key={a._id}>
                    <TableCell>{a.user?.name}</TableCell>
                    <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{a.clockIn?.time ? new Date(a.clockIn.time).toLocaleString() : '-'}</TableCell>
                    <TableCell>{a.clockOut?.time ? new Date(a.clockOut.time).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Chip label={a.late ? 'Yes' : 'No'} color={a.late ? 'error' : 'success'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={a.earlyLeave ? 'Yes' : 'No'} color={a.earlyLeave ? 'warning' : 'success'} size="small" />
                    </TableCell>
                    <TableCell>{a.clockIn?.address || (a.clockIn?.location ? `${a.clockIn?.location?.lat?.toFixed(6)}, ${a.clockIn?.location?.lng?.toFixed(6)}` : '-')}</TableCell>
                    <TableCell>{a.clockOut?.address || (a.clockOut?.location ? `${a.clockOut?.location?.lat?.toFixed(6)}, ${a.clockOut?.location?.lng?.toFixed(6)}` : '-')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* LEAVES - Admin View Only (Manager handles approvals) */}
      <TabPanel value={tab} index={4}>
        {leaves.length === 0 ? (
          <EmptyState message="No leave requests found" />
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Leave approvals are handled by the assigned manager. This view is read-only for oversight.
            </Alert>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Manager</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map(l => (
                    <TableRow key={l._id}>
                      <TableCell>{l.employeeId?.name}</TableCell>
                      <TableCell>{l.type}</TableCell>
                      <TableCell>{l.startDate ? new Date(l.startDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{l.endDate ? new Date(l.endDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{l.days}</TableCell>
                      <TableCell>
                        <Chip label={l.status} color={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'error' : 'warning'} size="small" />
                      </TableCell>
                      <TableCell>
                        {l.managerId?.name || 'Not assigned'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>

      {/* PAYROLL */}
      <TabPanel value={tab} index={5}>
        {payrolls.length === 0 ? (
          <EmptyState message="No payroll records found" />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Base Salary</TableCell>
                  <TableCell>Net Pay</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrolls.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.employeeId?.name}</TableCell>
                    <TableCell>{p.period?.month}</TableCell>
                    <TableCell>{p.period?.year}</TableCell>
                    <TableCell>{p.baseSalary}</TableCell>
                    <TableCell>{p.netPay}</TableCell>
                    <TableCell>
                      <Chip label={p.status} color={p.status === 'paid' ? 'success' : 'info'} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* PROFILE */}
      <TabPanel value={tab} index={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.name}</Typography>
                <Typography color="text.secondary">{profile?.email}</Typography>
                <Chip label={profile?.role?.toUpperCase()} color="error" size="small" sx={{ mt: 0.5 }} />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{profile?.department || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Position</Typography>
                <Typography variant="body1">{profile?.position || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Salary</Typography>
                <Typography variant="body1">${profile?.salary || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={profile?.status} color={profile?.status === 'approved' ? 'success' : 'warning'} size="small" />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => setProfileDialog(true)}>Edit Profile</Button>
              <Button variant="outlined" onClick={() => setPasswordDialog(true)}>Change Password</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add Employee Dialog */}
      <Dialog open={addEmployeeDialog} onClose={() => setAddEmployeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={employeeForm.role}
              label="Role"
              onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value, managerId: '' })}
            >
              <MenuItem value="employee">Employee / Team Member</MenuItem>
              <MenuItem value="manager">Manager / Team Leader</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Name"
            value={employeeForm.name}
            onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={employeeForm.email}
            onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={employeeForm.password}
            onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Department"
            value={employeeForm.department}
            onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Position"
            value={employeeForm.position}
            onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={employeeForm.salary}
            onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEmployeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField fullWidth label="Name" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} margin="normal" disabled />
          <TextField fullWidth label="Department" value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Position" value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} margin="normal" />
          <TextField fullWidth label="Salary" type="number" value={editForm.salary || ''} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEmployee} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {/* Profile Dialog */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} margin="normal" />
          <TextField fullWidth label="Department" value={profileData.department} onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Position" value={profileData.position} onChange={(e) => setProfileData({ ...profileData, position: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProfile} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} margin="normal" />
          <TextField fullWidth label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} margin="normal" />
          <TextField fullWidth label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
