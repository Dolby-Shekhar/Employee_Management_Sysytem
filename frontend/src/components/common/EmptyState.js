import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There are no records to display at the moment.',
  icon: Icon = InboxIcon,
  actionLabel,
  onAction,
  searchTerm
}) => {
  const DisplayIcon = searchTerm ? SearchOffIcon : Icon;
  const displayTitle = searchTerm ? `No results for "${searchTerm}"` : title;
  const displayDescription = searchTerm 
    ? 'Try adjusting your search or filters to find what you are looking for.' 
    : description;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <DisplayIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {displayTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionLabel ? 2 : 0 }}>
        {displayDescription}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

