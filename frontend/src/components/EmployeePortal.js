import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import Payroll from "./Payroll";
import LeaveRequest from "./LeaveRequest";
import { Box, Paper, Typography, Tabs, Tab, Stack, CircularProgress, Card, CardContent, Divider, Button, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
const AttendanceCard = ({ status, todayRecord, handleClock, loading }) => (

  <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', borderRadius: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Today's Attendance</Typography>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" color="primary">
          {loading ? <CircularProgress size={32} /> : status}
        </Typography>
        {todayRecord && todayRecord.late && (
          <Typography color="error" fontWeight={600}>Late Arrival</Typography>
        )}
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => handleClock(status === "Clocked in" ? "clock-out" : "clock-in")}
            disabled={loading || status === "Clocked out"}
            fullWidth
            color={status === "Clocked in" ? "warning" : "success"}
          >
            {status === "Clocked in" ? "Clock Out" : "Clock In"}
          </Button>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);



const EmployeePortal = () => {
  const { user, logout } = useContext(AuthContext);
const [activeTab, setActiveTab] = useState("attendance");
  const [status, setStatus] = useState("Not clocked in");
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
// const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);

  useEffect(() => {
    fetchStatus();
    fetchLeaves();
    fetchPayroll();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/my");
      const today = new Date();
      today.setHours(0,0,0,0);
      const record = res.data.find(r => new Date(r.date).getTime() === today.getTime());
      setTodayRecord(record);
      if (record) {
        if (record.clockOut) setStatus("Clocked out");
        else if (record.clockIn) setStatus("Clocked in");
        else setStatus("Not clocked in");
      } else {
        setStatus("Not clocked in");
      }
    } catch {
      setStatus("Not clocked in");
    }
    setLoading(false);
  };

  const handleClock = async (type) => {
    setLoading(true);
    try {
      await api.post(`/attendance/${type}`);
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Clock failed");
    }
    setLoading(false);
  };

  const [leaves, setLeaves] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const fetchLeaves = async () => {
    setLeaveLoading(true);
    try {
      const res = await api.get("/leaves/my-leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error('Fetch leaves error:', err);
    }
    setLeaveLoading(false);
  };

  const fetchPayroll = async () => {
    try {
      const res = await api.get("/payroll/my");
      setPayroll(res.data);
    } catch {}
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', py: 4, px: 2 }}>
      <Paper sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" fontWeight={700} color="primary">
              Welcome Back
            </Typography>
            <Typography variant="h5" color="text.secondary">
              {user?.name} | {user?.role.toUpperCase()}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            size="large"
            color="secondary"
          >
            Profile Settings
          </Button>
        </Stack>

        <AttendanceCard 
          status={status} 
          todayRecord={todayRecord}
          handleClock={handleClock}
          loading={loading}
        />


        <Divider sx={{ my: 4 }} />

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="fullWidth" sx={{ mb: 4, mx: -3, px: 3 }}>
          <Tab label="🕐 Attendance" value="attendance" />
          <Tab label="📅 Leaves" value="leaves" />
          <Tab label="💰 Payroll" value="payroll" />
          <Tab label="👤 Profile" value="profile" />
        </Tabs>

        {activeTab === "attendance" && (
          <Box>
            <Typography variant="h6" gutterBottom>Attendance History</Typography>
            {/* Attendance table goes here */}
          </Box>
        )}

        {activeTab === "leaves" && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Leave Requests</Typography>
              <Button variant="contained" onClick={() => setLeaveOpen(true)}>
                + New Request
              </Button>
            </Box>
            {leaveLoading ? (
              <CircularProgress />
            ) : leaves.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No leave requests</Typography>
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {leaves.slice(0, 5).map((leave) => (
                    <Paper key={leave._id} sx={{ p: 3 }}>
                      <Typography variant="body1"><strong>{leave.type}</strong> | {leave.status.toUpperCase()}</Typography>
                      <Typography>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)</Typography>
                      <Typography variant="body2" color="text.secondary">{leave.reason}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            )}
            <LeaveRequest open={leaveOpen} onClose={() => { setLeaveOpen(false); fetchLeaves(); }} />
          </Box>
        )}


        {activeTab === "payroll" && (
          <Payroll payrolls={payroll} />
        )}

{activeTab === "profile" && (
          <Box>
            <Typography variant="h6" gutterBottom>Profile Settings</Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body1" fontWeight={500}>Current Profile:</Typography>
                </Stack>
                <Stack spacing={2}>
                  <Typography><strong>Name:</strong> {user?.name}</Typography>
                  <Typography><strong>Email:</strong> {user?.email}</Typography>
                  <Typography><strong>Role:</strong> {user?.role}</Typography>
                </Stack>
                <Divider />
                <Typography variant="h6">Update Profile</Typography>
                <Stack spacing={2}>
                  <TextField
                    label="New Name"
                    name="name"
                    defaultValue={user?.name}
                    fullWidth
                  />
                  <TextField
                    label="New Email"
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    fullWidth
                  />
                  <TextField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    fullWidth
                  />
                  <TextField
                    label="New Password (optional)"
                    name="newPassword"
                    type="password"
                    fullWidth
                  />
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={async () => {
                      const formData = new FormData();
                      const nameInput = document.querySelector('input[name="name"]');
                      const emailInput = document.querySelector('input[name="email"]');
                      const currentPwInput = document.querySelector('input[name="currentPassword"]');
                      const newPwInput = document.querySelector('input[name="newPassword"]');
                      
                      if (nameInput.value !== user.name) formData.append('name', nameInput.value);
                      if (emailInput.value !== user.email) formData.append('email', emailInput.value);
                      if (currentPwInput.value) formData.append('currentPassword', currentPwInput.value);
                      if (newPwInput.value) formData.append('newPassword', newPwInput.value);
                      
                      if (formData.entries().next().done) {
                        alert('No changes made');
                        return;
                      }
                      
                      try {
                        const res = await api.put('/profile', Object.fromEntries(formData));
                        alert('Profile updated!');
                        // Update context
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                        window.location.reload();
                      } catch (err) {
                        alert(err.response?.data?.message || 'Update failed');
                      }
                    }}
                  >
                    Update Profile
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeePortal;

