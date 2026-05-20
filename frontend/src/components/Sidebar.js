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
  PersonAdd as PersonAddIcon,
  AccessTime as AccessTimeIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
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
        { text: 'Pending Approvals', icon: <PersonAddIcon />, path: '/dashboard/pending-approvals' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/dashboard/attendance' },
        { text: 'Leaves', icon: <EventNoteIcon />, path: '/dashboard/leaves' },
        { text: 'Payroll', icon: <PaymentIcon />, path: '/dashboard/payroll' },
        { text: 'Profile', icon: <AccountCircleIcon />, path: '/dashboard/profile' },
      );
    } else if (isManager) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager-dashboard' },
        { text: 'My Team', icon: <PeopleIcon />, path: '/manager-dashboard/team' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/manager-dashboard/attendance' },
        { text: 'Leave Approvals', icon: <EventNoteIcon />, path: '/manager-dashboard/leave-approvals' },
        { text: 'Performance', icon: <AssessmentIcon />, path: '/manager-dashboard/performance' },
        { text: 'Reports', icon: <DescriptionIcon />, path: '/manager-dashboard/reports' },
        { text: 'Profile', icon: <AccountCircleIcon />, path: '/manager-dashboard/profile' },
      );
    } else if (isEmployee) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/employee-dashboard' },
        { text: 'Attendance', icon: <AccessTimeIcon />, path: '/employee-dashboard/attendance' },
        { text: 'Leave', icon: <EventNoteIcon />, path: '/employee-dashboard/leave' },
        { text: 'Payroll', icon: <PaymentIcon />, path: '/employee-dashboard/payroll' },
        { text: 'Performance', icon: <AssessmentIcon />, path: '/employee-dashboard/performance' },
        { text: 'Profile', icon: <AccountCircleIcon />, path: '/employee-dashboard/profile' },
        { text: 'Reports', icon: <DescriptionIcon />, path: '/employee-dashboard/reports' },
      );
    }
    return items;
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 3, background: 'linear-gradient(180deg, rgba(79,70,229,0.12), transparent)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontWeight: 700 }}>
            EMS
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              EMS Portal
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
                    my: 0.5,
                    borderRadius: 2,
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

      <Box sx={{ p: 3, background: 'rgba(79,70,229,0.04)' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
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
    </Box>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: 'linear-gradient(180deg, #111827 0%, #0b1220 100%)' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: 'linear-gradient(180deg, #111827 0%, #0b1220 100%)' },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
