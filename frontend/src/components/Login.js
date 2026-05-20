import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('auth/login', formData);
      const { user, token } = res.data;
      // persist to localStorage if the user chose "remember me"
      if (remember) {
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
      }

      login(user, token);

      if (user.role === 'admin') navigate('/dashboard');
      else if (user.role === 'manager') navigate('/manager-dashboard');
      else navigate('/employee-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="fade-in"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 980, borderRadius: 4, overflow: 'hidden', boxShadow: '0 28px 80px rgba(15,23,42,0.12)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          <Box className="hero-cta"
            sx={{
              flex: 1,
              p: 5,
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 56, height: 56, fontWeight: 800 }}>EMS</Avatar>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>Employee Management</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.05 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 420 }}>
              Sign in to your account and manage employee attendance, payroll, performance, and approvals in one polished workflow.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                • Fast access to employee records
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                • Secure role-based access controls
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                • Responsive dashboards and actions
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ flex: 1, p: { xs: 4, md: 5 }, backgroundColor: 'background.paper' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Sign in to EMS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your credentials to continue.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                label="Remember me"
                sx={{ mt: 1 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.4,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Typography variant="body2" align="center">
                Don't have an account?{' '}
                <RouterLink to="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                  Register here
                </RouterLink>
              </Typography>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
