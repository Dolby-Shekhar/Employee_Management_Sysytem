import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import Register from "./components/Register";
import EmployeePortal from "./components/EmployeePortal";
import ManagerDashboard from "./components/ManagerDashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Box, Typography, Paper, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

function PrivateRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
        <Header toggleDrawer={() => {}} />
        {children}
      </Box>
    </Box>
  );
}

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="container"
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: 'grey.50',
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute roles={["employee"]}>
                  <EmployeePortal />
                </PrivateRoute>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <PrivateRoute roles={["manager"]}>
                  <ManagerDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;

