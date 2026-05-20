import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { EventNote, AccessTime, Payment, CheckCircle } from '@mui/icons-material';

import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import Layout from './Layout';
import LoadingScreen from './common/LoadingScreen';
import EmptyState from './common/EmptyState';
import ClockInOutCard from './ClockInOutCard';

const TabPanel = ({ children, value, index }) => (
  value === index && <Box sx={{ py: 2 }}>{children}</Box>
);

const StatsCard = ({ title, value, icon, color }) => (
  <Card sx={{
    transition: 'all 0.28s ease',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: 8,
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
            background: color === 'primary' ? 'linear-gradient(135deg,#4f46e5 0%,#60a5fa 100%)' :
                        color === 'warning' ? 'linear-gradient(135deg,#f97316 0%,#fb923c 100%)' :
                        color === 'success' ? 'linear-gradient(135deg,#16a34a 0%,#4ade80 100%)' :
                        'linear-gradient(135deg,#0288d1 0%,#03a9f4 100%)'
          }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const pathToTab = {
  '/employee-dashboard': 0,
  '/employee-dashboard/attendance': 1,
  '/employee-dashboard/clock': 2,
  '/employee-dashboard/leave': 3,
  '/employee-dashboard/payroll': 4,
  '/employee-dashboard/performance': 5,
  '/employee-dashboard/profile': 6,
  '/employee-dashboard/reports': 7,
};

const tabToPath = [
  '/employee-dashboard',
  '/employee-dashboard/attendance',
  '/employee-dashboard/clock',
  '/employee-dashboard/leave',
  '/employee-dashboard/payroll',
  '/employee-dashboard/performance',
  '/employee-dashboard/profile',
  '/employee-dashboard/reports',
];

const EmployeePortal = () => {
  useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(pathToTab[location.pathname] ?? 0);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalLeaves: 0, approvedLeaves: 0, totalPayroll: 0, avgScore: 0 });

  useEffect(() => {
    const newTab = pathToTab[location.pathname];
    if (newTab !== undefined) setTab(newTab);
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, leavesRes, payRes, perfRes, profRes, reportsRes] = await Promise.all([
        axiosInstance.get('/attendance/my'),
        axiosInstance.get('/leaves/my'),
        axiosInstance.get('/payroll/my'),
        axiosInstance.get('/performance/my'),
        axiosInstance.get('/profile'),
        axiosInstance.get('/reports/my'),
      ]);

      setAttendance(attRes.data || []);
      setLeaves(leavesRes.data || []);
      setPayrolls(payRes.data || []);
      setPerformances(perfRes.data || []);
      setProfile(profRes.data || {});
      setReports(reportsRes.data || []);

      setStats({
        totalLeaves: (leavesRes.data || []).length,
        approvedLeaves: (leavesRes.data || []).filter(l => l.status === 'approved').length,
        totalPayroll: (payRes.data || []).reduce((s, p) => s + (p.netPay || 0), 0),
        avgScore: (perfRes.data || []).reduce((s, p) => s + (p.score || 0), 0) / Math.max(1, (perfRes.data || []).length)
      });
    } catch (err) {
      console.warn('Failed to fetch employee data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <LoadingScreen message="Loading your data..." />
    </Layout>
  );

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 2 }}>Employee Portal</Typography>

      <Tabs value={tab} onChange={(e, v) => navigate(tabToPath[v])}>
        <Tab label="Overview" />
        <Tab label="Attendance" />
        <Tab label="Clock In/Out" />
        <Tab label="Leave" />
        <Tab label="Payroll" />
        <Tab label="Performance" />
        <Tab label="Profile" />
        <Tab label="Reports" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="My Leaves" value={stats.totalLeaves} icon={<EventNote />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Approved" value={stats.approvedLeaves} icon={<CheckCircle />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Attendance" value={attendance.length} icon={<AccessTime />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard title="Payroll" value={`$${stats.totalPayroll.toLocaleString()}`} icon={<Payment />} color="info" />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {attendance.length === 0 ? <EmptyState message="No attendance records" /> : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Clock In</TableCell>
                  <TableCell>Clock Out</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map(a => (
                  <TableRow key={a._id}>
                    <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{a.clockIn?.time ? new Date(a.clockIn.time).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{a.clockOut?.time ? new Date(a.clockOut.time).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{a.clockIn?.address || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <ClockInOutCard
          axiosInstance={axiosInstance}
          onDone={() => fetchData()}
          EmptyStateComponent={EmptyState}
        />
      </TabPanel>

      <TabPanel value={tab} index={3}>
        {leaves.length === 0 ? <EmptyState message="No leave requests" /> : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map(l => (
                  <TableRow key={l._id}>
                    <TableCell>{l.type}</TableCell>
                    <TableCell>{l.startDate ? new Date(l.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{l.endDate ? new Date(l.endDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{l.days}</TableCell>
                    <TableCell><Chip label={l.status} size="small" color={l.status === 'approved' ? 'success' : 'warning'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tab} index={4}>
        {payrolls.length === 0 ? <EmptyState message="No payroll records" /> : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Net Pay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrolls.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.period?.month}</TableCell>
                    <TableCell>{p.period?.year}</TableCell>
                    <TableCell>{p.netPay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tab} index={5}>
        {performances.length === 0 ? <EmptyState message="No performance reviews" /> : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Review Date</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performances.map(r => (
                  <TableRow key={r._id}>
                    <TableCell>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{r.score}</TableCell>
                    <TableCell>{r.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tab} index={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.6rem' }}>{profile?.name?.charAt(0)?.toUpperCase()}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name}</Typography>
                <Typography color="text.secondary">{profile?.email}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">Department: {profile?.department || 'N/A'}</Typography>
            <Typography variant="body2">Position: {profile?.position || 'N/A'}</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={7}>
        {reports.length === 0 ? <EmptyState message="No reports" /> : (

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map(r => (
                  <TableRow key={r._id}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.priority}</TableCell>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Layout>
  );
};

export default EmployeePortal;
