import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Divider, Stack, Grid, Chip } from "@mui/material";
import ManagerClock from "./ManagerClock";
import AddEmployee from "./AddEmployee";
import Payroll from "./Payroll";
import LeaveManagement from "./LeaveManagement";

const ManagerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [teamPayroll, setTeamPayroll] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leavesRes, payrollRes] = await Promise.all([
        api.get("/employees"),
        api.get("/attendance/all"),
        api.get("/leaves/pending"),
        api.get("/payroll/team")
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setLeaves(leavesRes.data);
      setTeamPayroll(payrollRes.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
      alert("Error loading data");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Manager Dashboard - Welcome, {user?.name}</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="secondary" onClick={logout}>Logout</Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ManagerClock />
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Add Team Member</Typography>
              <AddEmployee onAdded={fetchData} />
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <LeaveManagement leaves={leaves} loading={leavesLoading} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Payroll payrolls={teamPayroll} loading={payrollLoading} type="team" />
          </Box>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* Employees Table */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Team Members ({employees.length})</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={emp.status.toUpperCase()} 
                        color={emp.status === 'approved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{emp.position || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Attendance Table */}
        <Typography variant="h6">Team Attendance Records</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((rec, idx) => (
                <TableRow key={idx}>
                  <TableCell>{rec.user?.name || '-'}</TableCell>
                  <TableCell>{rec.date ? new Date(rec.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>
                    {rec.late && <span style={{color: 'red'}}>Late</span>}
                    {rec.earlyLeave && <span style={{color: 'orange'}}>Early Leave</span>}
                    {!rec.late && !rec.earlyLeave && (rec.clockIn ? 'Active' : 'Absent')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ManagerDashboard;

