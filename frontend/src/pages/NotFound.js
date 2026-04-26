import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { ErrorOutline, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorOutline sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h1" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          size="large"
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;

