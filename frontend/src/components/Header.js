import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AuthContext } from '../context/AuthContext';

const Header = ({ onDrawerToggle }) => {
  const { user } = useContext(AuthContext);

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
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Employee Management System
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={user?.role?.toUpperCase()}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
              {user?.name || 'User'}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

