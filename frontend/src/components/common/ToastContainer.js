import React from 'react';
import { ToastContainer as RTToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = () => (
  <RTToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="colored"
  />
);

export default ToastContainer;

