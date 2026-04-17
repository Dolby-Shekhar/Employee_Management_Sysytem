import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import Payroll from "./Payroll";
import { Box, Paper, Typography, Tabs, Tab, Stack, CircularProgress, Card, CardContent, Divider, Button } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
const AttendanceCard = ({ status, todayRecord, onClockIn, onClockOut, loading }) => (
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
            color="success" 
            size="large"
            onClick={onClockIn}
            disabled={loading || status === "Clocked in"}
            fullWidth
          >
            Clock In
          </Button>
          <Button 
            variant="contained" 
            color="warning" 
            size="large"
            onClick={onClockOut}
            disabled={loading || status === "Not clocked in"}
            fullWidth
          >
            Clock Out
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

  const fetchLeaves = async () => {
    // Leaves functionality coming soon
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
            onClick={logout}
            size="large"
            color="secondary"
          >
            Sign Out
          </Button>
        </Stack>

        <AttendanceCard 
          status={status} 
          todayRecord={todayRecord}
          onClockIn={() => handleClock('clock-in')}
          onClockOut={() => handleClock('clock-out')}
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
          <div>Leaves - Coming Soon</div>
        )}

        {activeTab === "payroll" && (
          <Payroll payrolls={payroll} />
        )}

        {activeTab === "profile" && (
          <Box>
            <Typography variant="h6" gutterBottom>Profile Settings</Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography>Edit personal information, password, notifications</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>Edit Profile</Button>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeePortal;

