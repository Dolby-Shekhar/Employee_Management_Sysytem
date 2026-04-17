import React, { useContext, useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { Box, Button, Typography, Paper, CircularProgress, Stack, Chip } from "@mui/material";

const ManagerClock = () => {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchStatus();
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
        if (record.clockIn && record.clockOut) setStatus("Clocked Out");
        else if (record.clockIn) setStatus("Clocked In");
      } else {
        setStatus("Not Clocked");
      }
    } catch {
      setStatus("Not Clocked");
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
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        Personal Attendance
      </Typography>
      <Stack spacing={2} alignItems="center">
        <Chip 
          label={status} 
          color={status === "Clocked In" ? "success" : status === "Clocked Out" ? "default" : "warning"}
          variant="filled"
          size="large"
        />
        {todayRecord && todayRecord.late && (
          <Chip label="Late" color="error" />
        )}
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Button 
              variant="contained" 
              color="success" 
              onClick={() => handleClock("clock-in")}
              disabled={status === "Clocked In" || status === "Clocked Out"}
              fullWidth
              size="large"
            >
              Clock In
            </Button>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={() => handleClock("clock-out")}
              disabled={status !== "Clocked In"}
              fullWidth
              size="large"
            >
              Clock Out
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default ManagerClock;
