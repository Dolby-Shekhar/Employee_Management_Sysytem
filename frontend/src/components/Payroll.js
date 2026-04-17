import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance";
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Typography, Chip, Button, Stack, CircularProgress 
} from "@mui/material";
// import { format } from 'date-fns';

const Payroll = ({ payrolls, loading, type = "my" }) => {
  if (loading) return <CircularProgress />;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'generated': return 'primary';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {type === "my" ? "My Payroll History" : "Team Payroll"}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Worked Days</TableCell>
              <TableCell>Net Pay</TableCell>
              <TableCell>Status</TableCell>
              {type === "team" && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.map((payroll) => (
              <TableRow key={payroll._id} hover>
                <TableCell>
                  {`${payroll.period.monthName || new Intl.DateTimeFormat('en-US',{ month: 'short' }).format(new Date(payroll.period.year, payroll.period.month - 1, 1))} ${payroll.period.year}`}
                </TableCell>
                <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
                <TableCell>{payroll.workedDays}/{payroll.paidDays}</TableCell>
                <TableCell><strong>{formatCurrency(payroll.netPay)}</strong></TableCell>
                <TableCell>
                  <Chip 
                    label={payroll.status.toUpperCase()} 
                    color={getStatusColor(payroll.status)}
                    size="small"
                  />
                </TableCell>
                {type === "team" && (
                  <TableCell>
                    {payroll.status !== "paid" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={async () => {
                          try {
                            await api.patch(`/payroll/${payroll._id}/paid`);
                            window.location.reload();
                          } catch (err) {
                            alert("Payment failed");
                          }
                        }}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {payrolls.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No payroll records</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Payroll;
