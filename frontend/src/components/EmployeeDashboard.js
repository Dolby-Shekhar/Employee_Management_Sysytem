import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import { Box, Button, Typography, Paper, CircularProgress, Stack, Tabs, Tab } from "@mui/material";
import LeaveRequest from "./LeaveRequest";
import LeaveManagement from "./LeaveManagement";
import Payroll from "./Payroll";

const EmployeeDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance/all");
      const today = new Date();
      today.setHours(0,0,0,0);
      const record = res.data.find(
        r => r.user._id === user.id && new Date(r.date).getTime() === today.getTime()
      );
      setTodayRecord(record);
      if (record) {
        if (record.clockIn && record.clockOut) setStatus("Clocked out");
        else if (record.clockIn) setStatus("Clocked in");
      } else {
        setStatus("Not clocked in");
      }
    } catch {
      setStatus("Not clocked in");
      setTodayRecord(null);
    }
    setLoading(false);
  };

  const handleClock = async (type) => {
    setLoading(true);
    try {
      await api.post(`/attendance/${type}`);
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Welcome, {user?.name}</Typography>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>Attendance</Typography>
        <Stack spacing={2} alignItems="center">
          <Typography>Status: {loading ? <CircularProgress size={18} /> : status}</Typography>
          {todayRecord && todayRecord.late && (
            <Typography color="error">Late</Typography>
          )}
          {todayRecord && todayRecord.earlyLeave && (
            <Typography color="warning.main">Early Leave</Typography>
          )}
          <Button variant="contained" color="success" onClick={() => handleClock("clock-in")}>Clock In</Button>
          <Button variant="contained" color="warning" onClick={() => handleClock("clock-out")}>Clock Out</Button>
          <Button variant="outlined" color="secondary" onClick={logout}>Logout</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default EmployeeDashboard;
