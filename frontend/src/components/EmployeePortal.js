import React, { useState, useEffect, useContext } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  EventNote,
  Payment,
  Assessment,
  AccountCircle,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';
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

const EmployeePortal = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [profile, setProfile] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ totalLeaves: 0, approvedLeaves: 0, totalPayroll: 0, avgScore: 0 });

  const [leaveDialog, setLeaveDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);

  const [leaveData, setLeaveData] = useState({
    type: 'Sick', startDate: '', endDate: '', days: '', reason: ''
  });
  const [profileData, setProfileData] = useState({ name: '', email: '', department: '', position: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [attRes, leaveRes, payRes, perfRes, profRes, todayRes] = await Promise.all([
        axiosInstance.get('/attendance/my'),
        axiosInstance.get('/leaves/my'),
        axiosInstance.get('/payroll/my'),
        axiosInstance.get('/performance/my'),
        axiosInstance.get('/profile'),
        axiosInstance.get('/attendance/today'),
      ]);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPayrolls(payRes.data);
      setPerformances(perfRes.data);
      setProfile(profRes.data);
      setTodayStatus(todayRes.data);
      setProfileData({
        name: profRes.data.name || '',
        email: profRes.data.email || '',
        department: profRes.data.department || '',
        position: profRes.data.position || ''
      });

      setStats({
        totalLeaves: leaveRes.data.length,
        approvedLeaves: leaveRes.data.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0),
        totalPayroll: payRes.data.reduce((sum, p) => sum + (p.netPay || 0), 0),
        avgScore: perfRes.data.length > 0
          ? (perfRes.data.reduce((sum, p) => sum + (p.averageScore || 0), 0) / perfRes.data.length).toFixed(1)
          : 0,
      });
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleClockIn = async () => {
    try {
      await axiosInstance.post('/attendance/clock-in');
      toast.success('Clocked in successfully');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock in failed');
    }
  };

  const handleClockOut = async () => {
    try {
      await axiosInstance.post('/attendance/clock-out');
      toast.success('Clocked out successfully');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock out failed');
    }
  };

  const handleApplyLeave = async () => {
    try {
      await axiosInstance.post('/leaves', leaveData);
      toast.success('Leave applied successfully');
      setLeaveDialog(false);
      setLeaveData({ type: 'Sick', startDate: '', endDate: '', days: '', reason: '' });
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await axiosInstance.put('/profile', profileData);
      toast.success('Profile updated');
      setProfileDialog(false);
      updateUser(res.data);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
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
    }
  };

  const attendanceColumns = [
    { field: 'date', headerName: 'Date', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleDateString() : "-" },
    { field: 'clockIn', headerName: 'Clock In', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'clockOut', headerName: 'Clock Out', width: 120, valueGetter: (p) => p?.value ? new Date(p?.value).toLocaleTimeString() : '-' },
    { field: 'late', headerName: 'Late', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'error' : 'success'} size="small" /> },
    { field: 'earlyLeave', headerName: 'Early', width: 80, renderCell: (p) => <Chip label={p?.value ? 'Yes' : 'No'} color={p?.value ? 'warning' : 'success'} size="small" /> },
  ];

  const payrollColumns = [
    { field: 'period.month', headerName: 'Month', width: 80, valueGetter: (p) => p?.row?.period?.month || "-" },
    { field: 'period.year', headerName: 'Year', width: 80, valueGetter: (p) => p?.row?.period?.year || "-" },
    { field: 'baseSalary', headerName: 'Base Salary', width: 110, renderCell: (p) => `$${p?.value}` },
    { field: 'netPay', headerName: 'Net Pay', width: 100, renderCell: (p) => `$${p?.value || 0}` },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => (
      <Chip label={p?.value} color={p?.value === 'paid' ? 'success' : p?.value === 'generated' ? 'info' : 'default'} size="small" />
    )},
  ];

  const performanceColumns = [
    { field: 'period.quarter', headerName: 'Quarter', width: 80, valueGetter: (p) => p.row.period?.quarter },
    { field: 'period.year', headerName: 'Year', width: 80, valueGetter: (p) => p?.row?.period?.year || "-" },
    { field: 'scores.productivity', headerName: 'Productivity', width: 100, valueGetter: (p) => p?.row?.scores?.productivity || 0 },
    { field: 'scores.teamwork', headerName: 'Teamwork', width: 100, valueGetter: (p) => p?.row?.scores?.teamwork || 0 },
    { field: 'scores.quality', headerName: 'Quality', width: 100, valueGetter: (p) => p?.row?.scores?.quality || 0 },
    { field: 'scores.initiative', headerName: 'Initiative', width: 100, valueGetter: (p) => p?.row?.scores?.initiative || 0 },
    { field: 'averageScore', headerName: 'Avg', width: 80 },
    { field: 'comments', headerName: 'Comments', width: 200 },
  ];

  if (loading && !profile) {
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
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Employee Portal</Typography>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Attendance" />
        <Tab label="Leave" />
        <Tab label="Payroll" />
        <Tab label="Performance" />
        <Tab label="Profile" />
      </Tabs>

      {/* Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Total Leaves" value={stats.totalLeaves} icon={<EventNote />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Leave Days Used" value={stats.approvedLeaves} icon={<Schedule />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Total Earnings" value={`$${stats.totalPayroll.toLocaleString()}`} icon={<Payment />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Avg Performance" value={stats.avgScore} icon={<Assessment />} color="info" />
          </Grid>
        </Grid>

        {/* Today's Attendance Status */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Today's Attendance</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<CheckCircle />}
                label={todayStatus?.clockIn ? `Clocked In: ${new Date(todayStatus.clockIn).toLocaleTimeString()}` : 'Not Clocked In'}
                color={todayStatus?.clockIn ? 'success' : 'default'}
              />
              <Chip
                icon={<Schedule />}
                label={todayStatus?.clockOut ? `Clocked Out: ${new Date(todayStatus.clockOut).toLocaleTimeString()}` : 'Not Clocked Out'}
                color={todayStatus?.clockOut ? 'success' : 'default'}
              />
              {todayStatus?.late && <Chip label="Late" color="error" size="small" />}
              {todayStatus?.earlyLeave && <Chip label="Early Leave" color="warning" size="small" />}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="success" onClick={handleClockIn} disabled={todayStatus?.clockIn}>
                Clock In
              </Button>
              <Button variant="contained" color="warning" onClick={handleClockOut} disabled={!todayStatus?.clockIn || todayStatus?.clockOut}>
                Clock Out
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={1}>
        <DataGrid rows={attendance} columns={attendanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Leave */}
      <TabPanel value={tab} index={2}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => setLeaveDialog(true)}>Apply Leave</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Chip label={leave.status} color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Payroll */}
      <TabPanel value={tab} index={3}>
        <DataGrid rows={payrolls} columns={payrollColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Performance */}
      <TabPanel value={tab} index={4}>
        <DataGrid rows={performances} columns={performanceColumns} pageSize={10} rowsPerPageOptions={[10, 25, 50]} getRowId={(r) => r._id} autoHeight />
      </TabPanel>

      {/* Profile */}
      <TabPanel value={tab} index={5}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.name}</Typography>
                <Typography color="text.secondary">{profile?.email}</Typography>
                <Chip label={profile?.role?.toUpperCase()} color="primary" size="small" sx={{ mt: 0.5 }} />
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

      {/* Leave Dialog */}
      <Dialog open={leaveDialog} onClose={() => setLeaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Leave Type</InputLabel>
            <Select value={leaveData.type} label="Leave Type" onChange={(e) => setLeaveData({ ...leaveData, type: e.target.value })}>
              <MenuItem value="Sick">Sick</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Annual">Annual</MenuItem>
              <MenuItem value="Emergency">Emergency</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Start Date" type="date" value={leaveData.startDate} onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="End Date" type="date" value={leaveData.endDate} onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Days" type="number" value={leaveData.days} onChange={(e) => setLeaveData({ ...leaveData, days: e.target.value })} margin="normal" />
          <TextField fullWidth label="Reason" multiline rows={3} value={leaveData.reason} onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyLeave}>Apply</Button>
        </DialogActions>
      </Dialog>

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
          <Button variant="contained" onClick={handleUpdateProfile}>Update</Button>
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
          <Button variant="contained" onClick={handleChangePassword}>Change</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default EmployeePortal;

