import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthContext } from './context/AuthContext';
import { setNavigate } from './utils/navigate';
import ErrorBoundary from './components/common/ErrorBoundary';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeePortal from './components/EmployeePortal';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user.role === 'manager') return <Navigate to="/manager-dashboard" replace />;
  return <Navigate to="/employee-dashboard" replace />;
};

const NavigationSetter = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <NavigationSetter />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/redirect" element={<RoleBasedRedirect />} />

        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager-dashboard/*"
          element={
            <PrivateRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee-dashboard/*"
          element={
            <PrivateRoute allowedRoles={['employee']}>
              <EmployeePortal />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
