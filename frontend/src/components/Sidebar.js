import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Typography, Box, Paper } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttendanceIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LeaveIcon from '@mui/icons-material/Event';
import PayrollIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';

const SidebarPaper = styled(Paper)(({ theme }) => ({
  width: 280,
  height: '100vh',
  background: 'linear-gradient(180deg, rgba(30,58,138,0.95) 0%, rgba(59,130,246,0.95) 100%)',
  backdropFilter: 'blur(20px)',
  color: 'white',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }
}));

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const { user, logout } = useContext(AuthContext);

  const drawer = (
    <SidebarPaper elevation={24}>
      <Box sx={{ p: 3, pt: 8, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mx: 'auto', 
            mb: 2,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '1.5rem'
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight={700}>
          {user?.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {user?.role.toUpperCase()}
        </Typography>
      </Box>
      
      <Divider sx={{ mx: 2, my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <List>
        <ListItem button onClick={() => window.location.href = '/dashboard'}>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <Divider sx={{ mx: 2, my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <ListItem button onClick={() => window.location.href = '/employee-dashboard'}>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <AttendanceIcon />
          </ListItemIcon>
          <ListItemText primary="Attendance" />
        </ListItem>
        
        <ListItem button>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Team" />
        </ListItem>
        
        <ListItem button>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <LeaveIcon />
          </ListItemIcon>
          <ListItemText primary="Leaves" />
        </ListItem>
        
        <ListItem button>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <PayrollIcon />
          </ListItemIcon>
          <ListItemText primary="Payroll" />
        </ListItem>
      </List>
      
      <Divider sx={{ mx: 2, mt: 'auto', borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ mt: 'auto' }}>
        <ListItem button onClick={logout}>
          <ListItemIcon sx={{ color: 'white', minWidth: 48 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </SidebarPaper>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            position: 'static'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

