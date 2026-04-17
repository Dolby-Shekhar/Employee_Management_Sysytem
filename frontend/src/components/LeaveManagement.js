import React, { useState, useEffect, useContext } from "react";
import api from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Button, Typography, Stack, CircularProgress 
} from "@mui/material";

const LeaveManagement = ({ leaves, loading, role }) => {
  const { user } = useContext(AuthContext);

  if (loading) return <CircularProgress />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {role === 'employee' ? 'My Leave Requests' : 'Pending Approvals'}
        {role !== 'employee' && ` (${leaves.length})`}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              {role !== 'employee' && <TableCell>Employee</TableCell>}
              <TableCell>Status</TableCell>
              {role !== 'employee' && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave._id} hover>
                <TableCell>{leave.type}</TableCell>
                <TableCell>
                  {new Date(leave.startDate).toLocaleDateString()} - 
                  {new Date(leave.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{leave.days}</TableCell>
                <TableCell>{leave.reason?.substring(0, 50)}...</TableCell>
                {role !== 'employee' && (
                  <TableCell>{leave.employeeId?.name || leave.employeeId?.email}</TableCell>
                )}
                <TableCell>
                  <Chip 
                    label={getStatusLabel(leave.status)} 
                    color={getStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                {role !== 'employee' && leave.status === 'pending' && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={async () => {
                          try {
                            await api.put(`/leaves/${leave._id}/status`, { status: 'approved' });
                            // Refresh leaves
                            window.location.reload();
                          } catch (err) {
                            alert('Approval failed');
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                          try {
                            await api.put(`/leaves/${leave._id}/status`, { status: 'rejected' });
                            window.location.reload();
                          } catch (err) {
                            alert('Rejection failed');
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {leaves.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No leave records</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaveManagement;
