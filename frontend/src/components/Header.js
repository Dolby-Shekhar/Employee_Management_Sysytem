import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ onDrawerToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    if (user?.role === 'employee') navigate('/employee-dashboard/profile');
    else if (user?.role === 'manager') navigate('/manager-dashboard');
    else navigate('/dashboard');
  };

  // Build breadcrumb from pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Login', path: '/' }];

    const crumbs = [];
    let currentPath = '';

    parts.forEach((part, idx) => {
      currentPath += `/${part}`;
      let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      if (part === 'dashboard' && idx === 0) label = 'Admin Dashboard';
      if (part === 'manager-dashboard') label = 'Manager Dashboard';
      if (part === 'employee-dashboard') label = 'Employee Portal';
      crumbs.push({ label, path: currentPath });
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <DashboardIcon color="primary" sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
            EMS
          </Typography>
        </Box>

        {/* Breadcrumb */}
        <Box sx={{ flexGrow: 1, mx: 2, display: { xs: 'none', md: 'flex' } }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}>
            {breadcrumbs.map((crumb, idx) => (
              idx === breadcrumbs.length - 1 ? (
                <Typography key={idx} color="text.primary" sx={{ fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              ) : (
                <MuiLink
                  key={idx}
                  underline="hover"
                  color="inherit"
                  href={crumb.path}
                  onClick={(e) => { e.preventDefault(); navigate(crumb.path); }}
                  sx={{ cursor: 'pointer' }}
                >
                  {crumb.label}
                </MuiLink>
              )
            ))}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Dark Mode Toggle */}
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notification Bell */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            </MenuItem>
          </Menu>

          {/* User Chip + Avatar */}
          <Chip
            label={user?.role?.toUpperCase()}
            color="primary"
            size="small"
            sx={{ fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              borderRadius: 2,
              px: 1,
              py: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || 'User'}
            </Typography>
          </Box>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ sx: { width: 200 } }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || ''}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: 'error.main' }} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

