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
  Rating,
} from '@mui/material';
import {
  People, PersonAdd,
  AccessTime,
  EventNote,
  Assessment,
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

const ManagerDashboard = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [stats, setStats] = useState({ teamSize: 0, pendingLeaves: 0, todayAttendance: 0, avgPerformance: 0 });

    const [perfDialog, setPerfDialog] = useState(false);
  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", password: "", department: "", position: "", salary: "" });
  const [employeeFormLoading, setEmployeeFormLoading] = useState(false);
  const [perfData, setPerfData] = useState({
    employeeId: '', quarter: 'Q1', year: new Date().getFullYear(),
    productivity: 5, teamwork: 5, quality: 5, initiative: 5,
    comments: '', goals: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [teamRes, attRes, leaveRes, perfRes] = await Promise.all([
        axiosInstance.get('/employees'),
        axiosInstance.get('/attendance/all'),
        axiosInstance.get('/leaves/approval'),
        axiosInstance.get('/performance/team'),
      ]);
      setTeam(teamRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPerformances(perfRes.data);

      const today = new Date().toISOString().split('T')[0];
      setStats({
        teamSize: teamRes.data.length,
        pendingLeaves: leaveRes.data.filter(l => l.status === 'pending').length,
        todayAttendance: attRes.data.filter(a => a.date?.startsWith(today)).length,
        avgPerformance: perfRes.data.length > 0
          ? (perfRes.data.reduce((sum, p) => sum + (p.averageScore || 0), 0) / perfRes.data.length).toFixed(1)
          : 0,
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleApproveLeave = async (id, status) => {
    try {
      await axiosInstance.patch(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}`);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update leave status');
    }
  };

  const handleAddEmployee = async () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setEmployeeFormLoading(true);
    try {
      await axiosInstance.post("/employees", {
        name: employeeForm.name,
        email: employeeForm.email,
        password: employeeForm.password,
        role: "employee",
        department: employeeForm.department,
        position: employeeForm.position,
        salary: employeeForm.salary || 0,
      });
      toast.success("Employee added and pending admin approval");
      setAddEmployeeDialog(false);
      setEmployeeForm({ name: "", email: "", password: "", department: "", position: "", salary: "" });
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setEmployeeFormLoading(false);
    }
  };

  const handleCreatePerformance = async () => {
    try {
      await axiosInstance.post('/performance', perfData);
      toast.success('Performance review created');
      setPerfDialog(false);
      setPerfData({ employeeId: '', quarter: 'Q1', year: new Date().getFullYear(), productivity: 5, teamwork: 5, quality: 5, initiative: 5, comments: '', goals: '' });
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create review');
    }
  };

  const teamColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'position', headerName: 'Position', width: 130 },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => (
      <Chip label={p?.value} color={p?.value === 'approved' ? 'success' : 'warning'} size="small" />
    )},
  ];

  const attendanceColumns = [
    { field: 'user.name', headerName: 'Employee', width: 150, valueGetter: (p) => p?.row?.user?.name || "-" },
    { field: 'date', headerName: 'Date', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleDateString() : "-" },
    { field: 'clockIn', headerName: 'Clock In', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'clockOut', headerName: 'Clock Out', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'late', headerName: 'Late', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'error' : 'success'} size="small" /> },
  ];

  const performanceColumns = [
    { field: 'employeeId.name', headerName: 'Employee', width: 150, valueGetter: (p) => p?.row?.employeeId?.name || "-" },
    { field: 'period.quarter', headerName: 'Quarter', width: 80, valueGetter: (p) => p?.row?.period?.quarter || "-" },
    { field: 'period.year', headerName: 'Year', width: 80, valueGetter: (p) => p?.row?.period?.year || "-" },
    { field: 'averageScore', headerName: 'Score', width: 80 },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => <Chip label={p?.value} size="small" /> },
  ];

  if (loading && team.length === 0) {
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
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Manager Dashboard</Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="My Team" />
        <Tab label="Attendance" />
        <Tab label="Leave Approvals" />
        <Tab label="Performance" />
      </Tabs>

      {/* Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Team Size" value={stats.teamSize} icon={<People />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Pending Leaves" value={stats.pendingLeaves} icon={<EventNote />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Today's Attendance" value={stats.todayAttendance} icon={<AccessTime />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Avg Performance" value={stats.avgPerformance} icon={<Assessment />} color="info" />
          </Grid>
        </Grid>
      </TabPanel>

      {/* My Team */}
      <TabPanel value={tab} index={1}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" color="primary" startIcon={<PersonAdd />} onClick={() => setAddEmployeeDialog(true)}>Add Employee</Button>
          </Box>
        <DataGrid rows={team} columns={teamColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={2}>
        <DataGrid rows={attendance} columns={attendanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Leave Approvals */}
      <TabPanel value={tab} index={3}>
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
                  <TableCell>{leave.employeeId?.name}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Chip label={leave.status} color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'} size="small" />
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
      </TabPanel>

      {/* Performance */}
      <TabPanel value={tab} index={4}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => setPerfDialog(true)}>Add Review</Button>
        </Box>
        <DataGrid rows={performances} columns={performanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Performance Dialog */}
      <Dialog open={perfDialog} onClose={() => setPerfDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Performance Review</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Employee"
            value={perfData.employeeId}
            onChange={(e) => setPerfData({ ...perfData, employeeId: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">Select Employee</option>
            {team.filter(e => e.status === 'approved').map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </TextField>
          <TextField select fullWidth label="Quarter" value={perfData.quarter} onChange={(e) => setPerfData({ ...perfData, quarter: e.target.value })} margin="normal" SelectProps={{ native: true }}>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
          </TextField>
          <TextField fullWidth label="Year" type="number" value={perfData.year} onChange={(e) => setPerfData({ ...perfData, year: e.target.value })} margin="normal" />
          <Box sx={{ mt: 2 }}>
            <Typography>Productivity</Typography>
            <Rating value={perfData.productivity} onChange={(e, v) => setPerfData({ ...perfData, productivity: v })} max={10} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography>Teamwork</Typography>
            <Rating value={perfData.teamwork} onChange={(e, v) => setPerfData({ ...perfData, teamwork: v })} max={10} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography>Quality</Typography>
            <Rating value={perfData.quality} onChange={(e, v) => setPerfData({ ...perfData, quality: v })} max={10} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography>Initiative</Typography>
            <Rating value={perfData.initiative} onChange={(e, v) => setPerfData({ ...perfData, initiative: v })} max={10} />
          </Box>
          <TextField fullWidth label="Comments" multiline rows={3} value={perfData.comments} onChange={(e) => setPerfData({ ...perfData, comments: e.target.value })} margin="normal" />
          <TextField fullWidth label="Goals" multiline rows={2} value={perfData.goals} onChange={(e) => setPerfData({ ...perfData, goals: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerfDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePerformance}>Create</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ManagerDashboard;

