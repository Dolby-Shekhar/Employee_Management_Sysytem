import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  People,
  PersonAdd,
  AccessTime,
  EventNote,
  Payment,
  Settings,
  Search,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import Layout from './Layout';

const TabPanel = ({ children, value, index }) => (
  value === index && <Box sx={{ py: 2 }}>{children}</Box>
);

const StatsCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
        </Box>
        <Box sx={{ color: `${color}.main`, bgcolor: `${color}.light`, p: 1.5, borderRadius: 2 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, pendingApprovals: 0, todayAttendance: 0, totalPayroll: 0 });

  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [addAdminDialog, setAddAdminDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', password: '', department: '', position: '', salary: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ _id: '', name: '', email: '', department: '', position: '', salary: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes, payRes] = await Promise.all([
        axiosInstance.get('/employees'),
        axiosInstance.get('/attendance/all'),
        axiosInstance.get('/leaves/all'),
        axiosInstance.get('/payroll/all'),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
      setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      setPayrolls(Array.isArray(payRes.data) ? payRes.data : []);

      const today = new Date().toISOString().split('T')[0];
      setStats({
        totalEmployees: empRes.data.length,
        pendingApprovals: empRes.data.filter(e => e.status === 'pending').length,
        todayAttendance: attRes.data.filter(a => a.date?.startsWith(today)).length,
        totalPayroll: payRes.data.reduce((sum, p) => sum + (p.netPay || 0), 0),
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleAddEmployee = async () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await axiosInstance.post('/employees', {
        ...employeeForm,
        role: 'employee',
        salary: Number(employeeForm.salary) || 0,
      });
      toast.success('Employee added successfully');
      setAddEmployeeDialog(false);
      setEmployeeForm({ name: '', email: '', password: '', department: '', position: '', salary: '' });
      fetchAllData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setFormError('Please fill in all required fields');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await axiosInstance.post('/employees/add-admin', adminForm);
      toast.success('Admin added successfully');
      setAddAdminDialog(false);
      setAdminForm({ name: '', email: '', password: '' });
      fetchAllData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add admin');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveEmployee = async (id) => {
    try {
      await axiosInstance.put(`/employees/${id}/approve`);
      toast.success('Employee approved');
      fetchAllData();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axiosInstance.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  const handleEditClick = (emp) => {
    setEditForm({ ...emp, salary: emp.salary || '' });
    setEditDialog(true);
  };

  const handleUpdateEmployee = async () => {
    setFormLoading(true);
    try {
      await axiosInstance.put(`/employees/${editForm._id}`, editForm);
      toast.success('Employee updated');
      setEditDialog(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveLeave = async (id, status) => {
    try {
      await axiosInstance.patch(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}`);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update leave status');
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const employeeColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role', headerName: 'Role', width: 100 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'position', headerName: 'Position', width: 130 },
    { field: 'salary', headerName: 'Salary', width: 100, renderCell: (p) => `$${p?.value || 0}` },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => (
      <Chip label={p?.value} color={p?.value === 'approved' ? 'success' : 'warning'} size="small" />
    )},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (p) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleEditClick(p.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteEmployee(p.row._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const attendanceColumns = [
    { field: 'user.name', headerName: 'Employee', width: 150, valueGetter: (p) => p?.row?.user?.name || '-' },
    { field: 'date', headerName: 'Date', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleDateString() : '-' },
    { field: 'clockIn', headerName: 'Clock In', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'clockOut', headerName: 'Clock Out', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'late', headerName: 'Late', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'error' : 'success'} size="small" /> },
    { field: 'earlyLeave', headerName: 'Early', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'warning' : 'success'} size="small" /> },
  ];

  const payrollColumns = [
    { field: 'employeeId.name', headerName: 'Employee', width: 150, valueGetter: (p) => p?.row?.employeeId?.name || '-' },
    { field: 'period.month', headerName: 'Month', width: 80, valueGetter: (p) => p?.row?.period?.month || '-' },
    { field: 'period.year', headerName: 'Year', width: 80, valueGetter: (p) => p?.row?.period?.year || '-' },
    { field: 'baseSalary', headerName: 'Base Salary', width: 110, renderCell: (p) => `$${p?.value || 0}` },
    { field: 'netPay', headerName: 'Net Pay', width: 100, renderCell: (p) => `$${p?.value || 0}` },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => (
      <Chip label={p?.value} color={p?.value === 'paid' ? 'success' : p?.value === 'generated' ? 'info' : 'default'} size="small" />
    )},
  ];

  if (loading && employees.length === 0) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Employees" />
        <Tab label="Pending Approvals" />
        <Tab label="Attendance" />
        <Tab label="Leaves" />
        <Tab label="Payroll" />
        <Tab label="Settings" />
      </Tabs>

      {/* Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Total Employees" value={stats.totalEmployees} icon={<People />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={<PersonAdd />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Today's Attendance" value={stats.todayAttendance} icon={<AccessTime />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Total Payroll" value={`$${stats.totalPayroll.toLocaleString()}`} icon={<Payment />} color="info" />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Employees */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setAddEmployeeDialog(true)}>
            Add Employee
          </Button>
        </Box>
        <DataGrid
          rows={filteredEmployees}
          columns={employeeColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(r) => r._id}
          autoHeight
          disableSelectionOnClick
        />
      </TabPanel>

      {/* Pending Approvals */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.filter(e => e.status === 'pending').map(emp => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.department || '-'}</TableCell>
                  <TableCell>{emp.position || '-'}</TableCell>
                  <TableCell>{emp.managerId?.name || 'Direct'}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleApproveEmployee(emp._id)}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {employees.filter(e => e.status === 'pending').length === 0 && (
          <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            No pending approvals
          </Typography>
        )}
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={3}>
        <DataGrid
          rows={attendance}
          columns={attendanceColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(r) => r._id}
          autoHeight
          disableSelectionOnClick
        />
      </TabPanel>

      {/* Leaves */}
      <TabPanel value={tab} index={4}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.employeeId?.name || '-'}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {leave.status === 'pending' && (
                      <>
                        <Button size="small" color="success" onClick={() => handleApproveLeave(leave._id, 'approved')}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleApproveLeave(leave._id, 'rejected')}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {leaves.length === 0 && (
          <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            No leave records
          </Typography>
        )}
      </TabPanel>

      {/* Payroll */}
      <TabPanel value={tab} index={5}>
        <DataGrid
          rows={payrolls}
          columns={payrollColumns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(r) => r._id}
          autoHeight
          disableSelectionOnClick
        />
      </TabPanel>

      {/* Settings */}
      <TabPanel value={tab} index={6}>
        <Card sx={{ maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Admin</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a new admin account. Maximum 2 admins allowed.
            </Typography>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                fullWidth
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddAdmin}
                disabled={formLoading}
              >
                {formLoading ? <CircularProgress size={24} /> : 'Add Admin'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add Employee Dialog */}
      <Dialog open={addEmployeeDialog} onClose={() => setAddEmployeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} />
            <TextField label="Email" fullWidth value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
            <TextField label="Password" type="password" fullWidth value={employeeForm.password} onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })} />
            <TextField label="Department" fullWidth value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} />
            <TextField label="Position" fullWidth value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} />
            <TextField label="Salary" type="number" fullWidth value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEmployeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Email" fullWidth value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <TextField label="Department" fullWidth value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
            <TextField label="Position" fullWidth value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} />
            <TextField label="Salary" type="number" fullWidth value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEmployee} disabled={formLoading}>
            {formLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;

