import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} onNavigate={(path) => navigate(path)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 260px)` },
          ml: { sm: "260px" },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Header onDrawerToggle={handleDrawerToggle} />
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
