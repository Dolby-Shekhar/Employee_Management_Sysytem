import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1976d2' : '#90caf9',
      light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
      dark: mode === 'light' ? '#1565c0' : '#42a5f5',
    },
    secondary: {
      main: mode === 'light' ? '#dc004e' : '#f48fb1',
      light: mode === 'light' ? '#ff5983' : '#fce4ec',
      dark: mode === 'light' ? '#9a0036' : '#c2185b',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    success: {
      main: mode === 'light' ? '#2e7d32' : '#66bb6a',
      light: mode === 'light' ? '#4caf50' : '#81c784',
      dark: mode === 'light' ? '#1b5e20' : '#388e3c',
    },
    warning: {
      main: mode === 'light' ? '#ed6c02' : '#ffa726',
      light: mode === 'light' ? '#ff9800' : '#ffb74d',
      dark: mode === 'light' ? '#e65100' : '#f57c00',
    },
    error: {
      main: mode === 'light' ? '#d32f2f' : '#ef5350',
      light: mode === 'light' ? '#ef5350' : '#e57373',
      dark: mode === 'light' ? '#c62828' : '#d32f2f',
    },
    info: {
      main: mode === 'light' ? '#0288d1' : '#29b6f6',
      light: mode === 'light' ? '#03a9f4' : '#4fc3f7',
      dark: mode === 'light' ? '#01579b' : '#0288d1',
    },
    text: {
      primary: mode === 'light' ? 'rgba(0,0,0,0.87)' : '#ffffff',
      secondary: mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#121212' : '#f5f5f5';
  }, [mode]);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

