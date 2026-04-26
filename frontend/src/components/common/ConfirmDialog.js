import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="inherit">
        {cancelText}
      </Button>
      <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
