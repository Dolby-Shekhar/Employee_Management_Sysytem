import React, { useState, useContext } from "react";
import api from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { 
  Box, Button, TextField, Typography, Paper, Stack, MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";

const LeaveRequest = ({ open, onClose }) => {
  const [form, setForm] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/leaves", {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        days: calculateDays()
      });
      setSuccess("Leave request submitted successfully!");
      setForm({ type: "Annual", startDate: "", endDate: "", reason: "" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Leave</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Stack spacing={3}>
          <TextField
            select
            name="type"
            label="Leave Type"
            value={form.type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="Sick">Sick Leave</MenuItem>
            <MenuItem value="Casual">Casual Leave</MenuItem>
            <MenuItem value="Annual">Annual Leave</MenuItem>
            <MenuItem value="Emergency">Emergency Leave</MenuItem>
          </TextField>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="endDate"
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="body2" color="text.secondary">
            Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
          </Typography>
          <TextField
            name="reason"
            label="Reason"
            multiline
            rows={3}
            value={form.reason}
            onChange={handleChange}
            fullWidth
            placeholder="Provide details for your leave request..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !form.startDate || !form.endDate || calculateDays() === 0}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequest;
