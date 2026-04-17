import React, { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AddEmployee from "./AddEmployee";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import EditEmployee from "./EditEmployee";
import api from "../utils/axiosInstance";
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Divider, TextField, Stack, Alert } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
    const handleAdminChange = (e) => {
      setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    };

    const handleAddAdmin = async (e) => {
      e.preventDefault();
      setAdminLoading(true);
      setAdminError("");
      setAdminSuccess("");
      try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:5000/api/employees/add-admin", adminForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminSuccess("Admin added successfully");
        setAdminForm({ name: "", email: "", password: "" });
        fetchData();
      } catch (err) {
        setAdminError(err.response?.data?.error || "Error adding admin");
      }
      setAdminLoading(false);
    };
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, pendingRes] = await Promise.all([
        api.get("/employees"),
        api.get("/attendance/all"),
        api.get("/employees")
      ]);
      setEmployees(empRes.data.filter(e => e.status === 'approved'));
      setPendingEmployees(pendingRes.data.filter(e => e.status === 'pending'));
      setAttendance(attRes.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      alert("Error loading data");
    }
    setLoading(false);
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = async (form) => {
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${form._id}`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Error updating employee");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchData();
    } catch (err) {
      alert("Error deleting employee");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Button variant="outlined" color="secondary" onClick={logout}>Logout</Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Typography variant="h6">Employees ({employees.length}) | Pending ({pendingEmployees.length})</Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={() => setAddOpen(true)} sx={{ mr: 2 }}>
            Add Employee
          </Button>
          <Button variant="contained" color="warning" onClick={() => setPendingOpen(true)} sx={{ mr: 2 }}>
            Review Pending
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setAddAdminOpen(true)}>
            Add Admin
          </Button>
        </Box>
      </Box>
        <Dialog open={addAdminOpen} onClose={() => setAddAdminOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Add Admin (max 2)</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddAdmin} sx={{ mt: 1 }}>
              {adminError && <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert>}
              {adminSuccess && <Alert severity="success" sx={{ mb: 2 }}>{adminSuccess}</Alert>}
              <Stack spacing={2}>
                <TextField name="name" label="Name" value={adminForm.name} onChange={handleAdminChange} required fullWidth />
                <TextField name="email" label="Email" value={adminForm.email} onChange={handleAdminChange} required fullWidth />
                <TextField name="password" label="Password" value={adminForm.password} onChange={handleAdminChange} required fullWidth type="password" />
                <Button type="submit" variant="contained" color="secondary" disabled={adminLoading}>
                  {adminLoading ? "Adding..." : "Add Admin"}
                </Button>
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent>
            <AddEmployee onAdded={() => { setAddOpen(false); fetchData(); }} />
          </DialogContent>
        </Dialog>
        <Dialog open={pendingOpen} onClose={() => setPendingOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Pending Employee Approvals ({pendingEmployees.length})</DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ mb: 2 }}>Review and approve new team members added by managers.</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Added By</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingEmployees.map(emp => (
                    <TableRow key={emp._id}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.role}</TableCell>
                      <TableCell>{emp.department || '-'}</TableCell>
                      <TableCell>{emp.position || '-'}</TableCell>
                      <TableCell>{emp.managerId?.name || 'Direct'}</TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={async () => {
                            try {
                              await api.put(`/employees/${emp._id}/approve`);
                              fetchData();
                              setPendingOpen(false);
                            } catch (err) {
                              alert('Approval failed');
                            }
                          }}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {pendingEmployees.length === 0 && (
              <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                No pending approvals
              </Typography>
            )}
          </DialogContent>
        </Dialog>
        {/* Employee Table */}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp._id}>
                  {editingId === emp._id ? (
                    <TableCell colSpan={6}>
                      <EditEmployee
                        employee={emp}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.salary}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleEdit(emp._id)}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(emp._id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Attendance Table */}
        <Typography variant="h6" sx={{ mt: 2 }}>Attendance Records</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Late</TableCell>
                <TableCell>Early Leave</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((rec, idx) => (
                <TableRow key={idx}>
                  <TableCell>{rec.user?.name}</TableCell>
                  <TableCell>{rec.user?.email}</TableCell>
                  <TableCell>{rec.date ? new Date(rec.date).toLocaleDateString() : ""}</TableCell>
                  <TableCell>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{rec.late ? <span style={{color: 'red'}}>Late</span> : "-"}</TableCell>
                  <TableCell>{rec.earlyLeave ? <span style={{color: 'orange'}}>Early Leave</span> : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
