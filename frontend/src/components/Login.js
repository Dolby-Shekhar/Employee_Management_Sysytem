import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Box, Button, TextField, Typography, Paper, Link } from "@mui/material";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );
      login(res.data.user, res.data.token);
      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 340 }}>
        <Typography variant="h5" align="center" gutterBottom>Employee Login</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            onChange={e => setData({ ...data, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            onChange={e => setData({ ...data, password: e.target.value })}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>Login</Button>
          <Typography align="center" sx={{ mt: 1 }}>
            Don't have an account?{' '}
            <Link component="button" onClick={() => navigate('/register')} underline="hover">
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;