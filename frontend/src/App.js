import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import Register from "./components/Register";
import EmployeeDashboard from "./components/EmployeeDashboard";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Box, Typography, Paper, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          background: `linear-gradient(135deg, #e3eafc 0%, #f4f6fb 60%, #fff 100%)`,
          backgroundImage: `repeating-linear-gradient(135deg, rgba(0,87,184,0.03) 0px, rgba(0,87,184,0.03) 2px, transparent 2px, transparent 24px), repeating-linear-gradient(45deg, rgba(255,179,0,0.03) 0px, rgba(255,179,0,0.03) 2px, transparent 2px, transparent 24px)`
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute role="employee">
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/register"
              element={
                user && user.role === "admin" ? (
                  <Register />
                ) : (
                  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <Paper elevation={3} sx={{ p: 4, minWidth: 340 }}>
                      <Typography variant="h6" align="center">Only admins can register new employees.</Typography>
                    </Paper>
                  </Box>
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;