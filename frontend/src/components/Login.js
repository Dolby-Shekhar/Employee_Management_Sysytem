import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box className="login-container" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'transparent' }}>
      <Paper 
        elevation={3} 
        className="login-paper" 
        sx={{ 
          p: 6, 
          minWidth: 380, 
          background: 'rgba(255, 255, 255, 0.95) !important',
          backdropFilter: 'blur(20px) !important',
          borderRadius: 24
        }}
      >
        <Typography variant="h4" className="login-title" align="center" gutterBottom>
          Employee Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Secure management system
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            className="login-field"
            label="Email Address"
            type="email"
            variant="outlined"
            onChange={e => setData({ ...data, email: e.target.value })}
            fullWidth
            size="large"
          />
          <TextField
            className="login-field"
            label="Password"
            type="password"
            variant="outlined"
            onChange={e => setData({ ...data, password: e.target.value })}
            fullWidth
            size="large"
          />
          <Button className="login-button" variant="contained" color="primary" onClick={handleLogin} fullWidth size="large">
            Sign In
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

