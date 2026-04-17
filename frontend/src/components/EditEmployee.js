import React, { useState } from "react";
import { Box, Button, TextField, Stack, Paper } from "@mui/material";

const EditEmployee = ({ employee, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...employee });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <TextField name="name" label="Name" value={form.name} onChange={handleChange} required fullWidth />
          <TextField name="email" label="Email" value={form.email} onChange={handleChange} required fullWidth />
          <TextField name="department" label="Department" value={form.department || ''} onChange={handleChange} fullWidth />
          <TextField name="position" label="Position" value={form.position || ''} onChange={handleChange} fullWidth />
          <TextField name="salary" label="Salary" value={form.salary || ''} onChange={handleChange} type="number" fullWidth />
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mr: 1 }}>
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
        </Box>
      </form>
    </Paper>
  );
};

export default EditEmployee;
