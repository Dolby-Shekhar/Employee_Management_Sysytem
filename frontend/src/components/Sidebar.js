import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, onDrawerToggle, onNavigate }) => {
  const { user, logout, isAdmin, isManager, isEmployee } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const items = [];
    if (isAdmin) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Employees', icon: <PeopleIcon />, path: '/dashboard/employees' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/dashboard/attendance' },
        { text: 'Payroll', icon: <PaymentIcon />, path: '/dashboard/payroll' },
        { text: 'Performance', icon: <AssessmentIcon />, path: '/dashboard/performance' },
        { text: 'Leave Requests', icon: <EventNoteIcon />, path: '/dashboard/leaves' },
      );
    } else if (isManager) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager-dashboard' },
        { text: 'My Team', icon: <PeopleIcon />, path: '/manager-dashboard' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/manager-dashboard' },
        { text: 'Leave Approvals', icon: <EventNoteIcon />, path: '/manager-dashboard' },
        { text: 'Performance', icon: <AssessmentIcon />, path: '/manager-dashboard' },
      );
    } else if (isEmployee) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/employee-dashboard' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/employee-dashboard' },
        { text: 'Leave', icon: <EventNoteIcon />, path: '/employee-dashboard' },
        { text: 'Payroll', icon: <PaymentIcon />, path: '/employee-dashboard' },
        { text: 'Performance', icon: <AssessmentIcon />, path: '/employee-dashboard' },
        { text: 'Profile', icon: <AccountCircleIcon />, path: '/employee-dashboard' },
      );
    }
    return items;
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            EMS
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
              EMS
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {user?.role || 'User'}
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    onDrawerToggle();
                  }}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box> // ✅ properly closed
  );

  return (
    <Box component="nav">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
