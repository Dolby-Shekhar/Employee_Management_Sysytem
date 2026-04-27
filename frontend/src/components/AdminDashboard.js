 import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, IconButton, Alert, InputAdornment
} from '@mui/material';

import {
  People, PersonAdd, AccessTime, Payment,
  Search, Delete as DeleteIcon, Edit as EditIcon
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
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

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingApprovals: 0,
    todayAttendance: 0,
    totalPayroll: 0
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  const [employeeForm, setEmployeeForm] = useState({
    name: '', email: '', password: '', department: '', position: '', salary: ''
  });

  const [editForm, setEditForm] = useState({});

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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

      const empList = empRes.data.data || empRes.data;
      const attList = attRes.data.data || attRes.data;
      const leaveList = leaveRes.data.data || leaveRes.data;
      const payList = payRes.data.data || payRes.data;

      setEmployees(empList);
      setAttendance(attList);
      setLeaves(leaveList);
      setPayrolls(payList);

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
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const employeeColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'position', headerName: 'Position', width: 130 },
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

          <IconButton color="error" onClick={() => handleDeleteEmployee(p.row._id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  const handleAddEmployee = async () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password) {
      return setFormError('Fill required fields');
    }

    setFormLoading(true);
    setFormError('');

    try {
      await axiosInstance.post('/employees', {
        ...employeeForm,
        salary: Number(employeeForm.salary)
      });

      toast.success('Employee added');
      setAddEmployeeDialog(false);
      setEmployeeForm({ name: '', email: '', password: '', department: '', position: '', salary: '' });
      fetchAllData();

    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Delete employee?')) return;

    await axiosInstance.delete(`/employees/${id}`);
    toast.success('Deleted');
    fetchAllData();
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
    try {
      await axiosInstance.put(`/employees/${id}/approve`);
      toast.success('Employee approved');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve employee');
    }
  };

  const handleApproveLeave = async (id, status) => {
    try {
      await axiosInstance.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}`);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  if (loading) {
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
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Employees" />
        <Tab label="Pending Approvals" />
        <Tab label="Attendance" />
        <Tab label="Leaves" />
        <Tab label="Payroll" />
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
            <StatsCard title="Payroll" value={`₹${stats.totalPayroll.toLocaleString()}`} icon={<Payment />} color="info" />
          </Grid>
        </Grid>
      </TabPanel>

      {/* EMPLOYEES */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
            }}
          />

          <Button variant="contained" onClick={() => setAddEmployeeDialog(true)}>
            Add
          </Button>
        </Box>

        <DataGrid
          rows={filteredEmployees}
          columns={employeeColumns}
          getRowId={(r) => r._id}
          autoHeight
        />
      </TabPanel>

      {/* PENDING APPROVALS */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.filter(e => e.status === 'pending').map(emp => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <Chip label={emp.status} color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleApproveEmployee(emp._id)}>
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* ATTENDANCE */}
      <TabPanel value={tab} index={3}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map(a => (
                <TableRow key={a._id}>
                  <TableCell>{a.user?.name}</TableCell>
                  <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>
                    <Chip label={a.late ? 'Yes' : 'No'} color={a.late ? 'error' : 'success'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={a.earlyLeave ? 'Yes' : 'No'} color={a.earlyLeave ? 'warning' : 'success'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* LEAVES */}
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
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
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
                    {l.status === 'pending' && (
                      <>
                        <Button size="small" onClick={() => handleApproveLeave(l._id, 'approved')}>Approve</Button>
                        <Button size="small" color="error" onClick={() => handleApproveLeave(l._id, 'rejected')}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* PAYROLL */}
      <TabPanel value={tab} index={5}>
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
            {formLoading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={editForm.email || ''}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Department"
            value={editForm.department || ''}
            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Position"
            value={editForm.position || ''}
            onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={editForm.salary || ''}
            onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
            margin="normal"
          />
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
