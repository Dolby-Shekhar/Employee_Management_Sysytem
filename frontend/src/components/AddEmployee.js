import React, { useState } from "react";
import api from "../utils/axiosInstance";
import { Button, TextField, Paper, Stack, MenuItem } from "@mui/material";

const AddEmployee = ({ onAdded }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    position: "",
    salary: "",
    role: "employee"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/employees", form);
      setForm({ name: "", email: "", password: "", department: "", position: "", salary: "", role: "employee" });
      if (onAdded) onAdded();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding employee");
    }
    setLoading(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <TextField name="name" label="Name" value={form.name} onChange={handleChange} required fullWidth />
          <TextField name="email" label="Email" value={form.email} onChange={handleChange} required fullWidth />
          <TextField name="password" label="Password" value={form.password} onChange={handleChange} required fullWidth type="password" />
        </Stack>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mt: 2 }}>
          <TextField name="department" label="Department" value={form.department} onChange={handleChange} fullWidth />
          <TextField name="position" label="Position" value={form.position} onChange={handleChange} fullWidth />
          <TextField name="salary" label="Salary" value={form.salary} onChange={handleChange} type="number" fullWidth />
          <TextField
            select
            name="role"
            label="Role"
            value={form.role}
            onChange={handleChange}
            required
            fullWidth
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="leader">Leader</MenuItem>
          </TextField>
        </Stack>
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
          {loading ? "Adding..." : "Add Employee"}
        </Button>
      </form>
    </Paper>
  );
};

export default AddEmployee;
