import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Alert,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  People, PersonAdd,
  AccessTime,
  EventNote,
  Assessment,
  AccountCircle,
  Description
} from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import Layout from './Layout';
import LoadingScreen from './common/LoadingScreen';
import EmptyState from './common/EmptyState';
import { exportToCSV } from '../utils/exportUtils';

const TabPanel = ({ children, value, index }) => (
  value === index && <Box sx={{ py: 2 }}>{children}</Box>
);

const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
        </Box>
        <Box sx={{
          color: '#fff',
          bgcolor: color === 'primary' ? '#1976d2' : color === 'warning' ? '#ed6c02' : color === 'success' ? '#2e7d32' : '#0288d1',
          p: 1.5,
          borderRadius: 2,
          background: color === 'primary' ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' :
                     color === 'warning' ? 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)' :
                     color === 'success' ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' :
                     'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const pathToTab = {
  '/manager-dashboard': 0,
  '/manager-dashboard/team': 1,
  '/manager-dashboard/attendance': 2,
  '/manager-dashboard/leave-approvals': 3,
  '/manager-dashboard/performance': 4,
  '/manager-dashboard/reports': 5,
  '/manager-dashboard/profile': 6,
};

const tabToPath = [
  '/manager-dashboard',
  '/manager-dashboard/team',
  '/manager-dashboard/attendance',
  '/manager-dashboard/leave-approvals',
  '/manager-dashboard/performance',
  '/manager-dashboard/reports',
  '/manager-dashboard/profile',
];

const ManagerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(pathToTab[location.pathname] ?? 0);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ teamSize: 0, pendingLeaves: 0, todayAttendance: 0, avgPerformance: 0 });

  const [perfDialog, setPerfDialog] = useState(false);
  const [addEmployeeDialog, setAddEmployeeDialog] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", password: "", department: "", position: "", salary: "" });
  const [employeeFormLoading, setEmployeeFormLoading] = useState(false);
  const [perfLoading, setPerfLoading] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', department: '', position: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [leaveActionLoading, setLeaveActionLoading] = useState({});
  const [perfData, setPerfData] = useState({
    employeeId: '', quarter: 'Q1', year: new Date().getFullYear(),
    productivity: 5, teamwork: 5, quality: 5, initiative: 5,
    comments: '', goals: ''
  });

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
      const [teamRes, attRes, leaveRes, perfRes, reportRes, profRes] = await Promise.all([
        axiosInstance.get('/employees'),
        axiosInstance.get('/attendance/all'),
        axiosInstance.get('/leaves/approval'),
        axiosInstance.get('/performance/team'),
        axiosInstance.get('/reports/team'),
        axiosInstance.get('/profile'),
      ]);
      setTeam(teamRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPerformances(perfRes.data);
      setReports(reportRes.data?.data || []);
      setProfileData({
        name: profRes.data?.name || '',
        email: profRes.data?.email || '',
        department: profRes.data?.department || '',
        position: profRes.data?.position || ''
      });

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

  const handleTabChange = (e, newValue) => navigate(tabToPath[newValue]);

  const handleApproveLeave = async (id, status) => {
    setLeaveActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axiosInstance.patch(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}`);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update leave status');
    } finally {
      setLeaveActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRespondToReport = async () => {
    if (!selectedReport) return;
    setRespondLoading(true);
    try {
      await axiosInstance.put(`/reports/${selectedReport._id}/respond`, { response: responseText });
      toast.success('Response sent');
      setResponseDialog(false);
      setSelectedReport(null);
      setResponseText('');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    } finally {
      setRespondLoading(false);
    }
  };

  const openRespondDialog = (report) => {
    setSelectedReport(report);
    setResponseText(report.response || '');
    setResponseDialog(true);
  };

  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    try {
      await axiosInstance.put('/profile', profileData);
      toast.success('Profile updated');
      setProfileDialog(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.put('/auth/password', passwordData);
      toast.success('Password changed');
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const [employeeFormError, setEmployeeFormError] = useState('');

  const validateManagerEmployeeForm = () => {
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
    return '';
  };

  const handleAddEmployee = async () => {
    const error = validateManagerEmployeeForm();
    if (error) {
      setEmployeeFormError(error);
      return;
    }
    setEmployeeFormError('');
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
    setPerfLoading(true);
    try {
      await axiosInstance.post('/performance', perfData);
      toast.success('Performance review created');
      setPerfDialog(false);
      setPerfData({ employeeId: '', quarter: 'Q1', year: new Date().getFullYear(), productivity: 5, teamwork: 5, quality: 5, initiative: 5, comments: '', goals: '' });
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create review');
    } finally {
      setPerfLoading(false);
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
    { field: 'user', headerName: 'Employee', width: 150, renderCell: (p) => p?.row?.user?.name || p?.row?.employeeId?.name || '-' },
    { field: 'date', headerName: 'Date', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleDateString() : "-" },
    { field: 'clockIn', headerName: 'Clock In', width: 160, renderCell: (p) => p?.row?.clockIn?.time ? new Date(p?.row?.clockIn?.time).toLocaleString() : '-' },
    { field: 'clockOut', headerName: 'Clock Out', width: 160, renderCell: (p) => p?.row?.clockOut?.time ? new Date(p?.row?.clockOut?.time).toLocaleString() : '-' },
    { field: 'late', headerName: 'Late', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'error' : 'success'} size="small" /> },
    { field: 'earlyLeave', headerName: 'Early Leave', width: 100, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'warning' : 'success'} size="small" /> },
    { field: 'clockInLoc', headerName: 'Clock In Location', width: 220, renderCell: (p) => p?.row?.clockIn?.address || (p?.row?.clockIn?.location ? `${p?.row?.clockIn?.location?.lat?.toFixed(6)}, ${p?.row?.clockIn?.location?.lng?.toFixed(6)}` : '-') },
    { field: 'clockOutLoc', headerName: 'Clock Out Location', width: 220, renderCell: (p) => p?.row?.clockOut?.address || (p?.row?.clockOut?.location ? `${p?.row?.clockOut?.location?.lat?.toFixed(6)}, ${p?.row?.clockOut?.location?.lng?.toFixed(6)}` : '-') },
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
        <LoadingScreen message="Loading dashboard data..." />
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
        <Tab label="Reports" />
        <Tab label="Profile" icon={<AccountCircle sx={{ fontSize: 18 }} />} iconPosition="end" />
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
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportToCSV(team, teamColumns, 'team')}
            disabled={team.length === 0}
          >
            Export
          </Button>
          <Button variant="contained" color="primary" startIcon={<PersonAdd />} onClick={() => setAddEmployeeDialog(true)}>Add Employee</Button>
        </Box>
        {team.length === 0 ? (
          <EmptyState message="No team members found" />
        ) : (
          <DataGrid rows={team} columns={teamColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
        )}
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={2}>
        {attendance.length === 0 ? (
          <EmptyState message="No attendance records found" />
        ) : (
          <DataGrid rows={attendance} columns={attendanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
        )}
      </TabPanel>

      {/* Leave Approvals */}
      <TabPanel value={tab} index={3}>
        {leaves.length === 0 ? (
          <EmptyState message="No leave requests found" />
        ) : (
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
                          <Button size="small" color="success" onClick={() => handleApproveLeave(leave._id, 'approved')} disabled={leaveActionLoading[leave._id]}>
                            {leaveActionLoading[leave._id] ? <CircularProgress size={16} /> : 'Approve'}
                          </Button>
                          <Button size="small" color="error" onClick={() => handleApproveLeave(leave._id, 'rejected')} disabled={leaveActionLoading[leave._id]}>
                            {leaveActionLoading[leave._id] ? <CircularProgress size={16} /> : 'Reject'}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Performance */}
      <TabPanel value={tab} index={4}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => setPerfDialog(true)}>Add Review</Button>
        </Box>
        {performances.length === 0 ? (
          <EmptyState message="No performance reviews found" />
        ) : (
          <DataGrid rows={performances} columns={performanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
        )}
      </TabPanel>

      {/* Reports */}
      <TabPanel value={tab} index={5}>
        {reports.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No reports received from team members yet.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.employeeId?.name || 'Unknown'}</TableCell>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.priority}
                        color={report.priority === 'high' ? 'error' : report.priority === 'medium' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={report.status === 'sent' ? 'info' : report.status === 'read' ? 'success' : report.status === 'actioned' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.response || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {report.status !== 'actioned' && (
                        <Button size="small" variant="outlined" onClick={() => openRespondDialog(report)}>
                          {report.status === 'sent' ? 'Mark Read' : 'Respond'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
          <Button variant="contained" onClick={handleCreatePerformance} disabled={perfLoading}>
            {perfLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Employee Dialog */}
      <Dialog open={addEmployeeDialog} onClose={() => setAddEmployeeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent>
          {employeeFormError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {employeeFormError}
            </Alert>
          )}
          <TextField fullWidth label="Name" value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} margin="normal" />
          <TextField fullWidth label="Password" type="password" value={employeeForm.password} onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })} margin="normal" />
          <TextField fullWidth label="Department" value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Position" value={employeeForm.position} onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })} margin="normal" />
          <TextField fullWidth label="Salary" type="number" value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEmployeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEmployee} disabled={employeeFormLoading}>
            {employeeFormLoading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile TabPanel */}
      <TabPanel value={tab} index={6}>
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3 }}>My Profile</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="h6">{profileData.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="h6">{profileData.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="h6">{profileData.department || 'Not set'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Position</Typography>
                <Typography variant="h6">{profileData.position || 'Not set'}</Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => setProfileDialog(true)}>Edit Profile</Button>
              <Button variant="outlined" onClick={() => setPasswordDialog(true)}>Change Password</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>From:</strong> {selectedReport?.employeeId?.name}<br />
            <strong>Title:</strong> {selectedReport?.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            {selectedReport?.content}
          </Typography>
          <TextField
            fullWidth
            label="Your Response"
            multiline
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            margin="normal"
            placeholder="Write your response to this report..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRespondToReport} disabled={respondLoading}>
            {respondLoading ? <CircularProgress size={24} /> : 'Send Response'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="Email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} margin="normal" disabled />
          <TextField fullWidth label="Department" value={profileData.department} onChange={(e) => setProfileData({ ...profileData, department: e.target.value })} margin="normal" />
          <TextField fullWidth label="Position" value={profileData.position} onChange={(e) => setProfileData({ ...profileData, position: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProfile} disabled={profileLoading}>
            {profileLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} margin="normal" />
          <TextField fullWidth label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} margin="normal" />
          <TextField fullWidth label="Confirm Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={passwordLoading}>
            {passwordLoading ? <CircularProgress size={24} /> : 'Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ManagerDashboard;
