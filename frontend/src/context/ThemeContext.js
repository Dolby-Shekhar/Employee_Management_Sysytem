import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#4f46e5' : '#8b5cf6',
      light: mode === 'light' ? '#818cf8' : '#a78bfa',
      dark: mode === 'light' ? '#4338ca' : '#6366f1',
    },
    secondary: {
      main: mode === 'light' ? '#ec4899' : '#f9a8d4',
      light: mode === 'light' ? '#fb7185' : '#fda4af',
      dark: mode === 'light' ? '#be185d' : '#c026d3',
    },
    background: {
      default: mode === 'light' ? '#eef2ff' : '#0b1220',
      paper: mode === 'light' ? '#ffffff' : '#111827',
    },
    text: {
      primary: mode === 'light' ? 'rgba(15,23,42,0.92)' : '#f8fafc',
      secondary: mode === 'light' ? 'rgba(71,85,105,0.78)' : 'rgba(226,232,240,0.72)',
    },
    divider: mode === 'light' ? 'rgba(148,163,184,0.24)' : 'rgba(226,232,240,0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: mode === 'light' ? '#0f172a' : '#e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffffcc' : '#0f172aee',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${mode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          transition: 'all 0.2s ease',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow:
            mode === 'light'
              ? '0 20px 60px rgba(15,23,42,0.08)'
              : '0 20px 60px rgba(0,0,0,0.32)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow:
            mode === 'light'
              ? '0 14px 45px rgba(15,23,42,0.06)'
              : '0 14px 45px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: mode === 'light' ? '#ffffff' : '#161b2d',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? 'rgba(15,23,42,0.16)' : 'rgba(226,232,240,0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? 'rgba(79,70,229,0.35)' : 'rgba(139,92,246,0.32)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7c3aed',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? 'rgba(15,23,42,0.7)' : 'rgba(226,232,240,0.75)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          borderRadius: 4,
          background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 100%)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          minHeight: 48,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#f8fbff' : '#111827',
          borderRight: `1px solid ${mode === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)'}`,
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
    document.body.style.background =
      mode === 'dark'
        ? 'radial-gradient(circle at top, rgba(99,102,241,0.16), transparent 28%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.1), transparent 24%), #030712'
        : 'radial-gradient(circle at top, rgba(79,70,229,0.14), transparent 30%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.1), transparent 28%), #eff6ff';
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

