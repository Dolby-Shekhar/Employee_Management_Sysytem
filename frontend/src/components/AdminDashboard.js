import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, CircularProgress, IconButton, Stack, Alert, InputAdornment
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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

    try {
      await axiosInstance.post('/employees', {
        ...employeeForm,
        salary: Number(employeeForm.salary)
      });

      toast.success('Employee added');
      setAddEmployeeDialog(false);
      fetchAllData();

    } catch {
      toast.error('Failed');
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

  const handleApproveLeave = async (id, status) => {
    await axiosInstance.put(`/leaves/${id}`, { status });
    toast.success(`Leave ${status}`);
    fetchAllData();
  };

  if (loading) {
    return (
      <Layout>
        <CircularProgress />
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Employees" />
        <Tab label="Leaves" />
      </Tabs>

      {/* OVERVIEW */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <StatsCard title="Employees" value={stats.totalEmployees} icon={<People />} color="primary" />
          </Grid>
          <Grid item xs={3}>
            <StatsCard title="Pending" value={stats.pendingApprovals} icon={<PersonAdd />} color="warning" />
          </Grid>
          <Grid item xs={3}>
            <StatsCard title="Attendance" value={stats.todayAttendance} icon={<AccessTime />} color="success" />
          </Grid>
          <Grid item xs={3}>
            <StatsCard title="Payroll" value={`₹${stats.totalPayroll}`} icon={<Payment />} color="info" />
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

      {/* LEAVES */}
      <TabPanel value={tab} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {leaves.map(l => (
                <TableRow key={l._id}>
                  <TableCell>{l.employeeId?.name}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleApproveLeave(l._id, 'approved')}>Approve</Button>
                    <Button onClick={() => handleApproveLeave(l._id, 'rejected')}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Layout>
  );
};

export default AdminDashboard;