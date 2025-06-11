import Swal from 'sweetalert2';

// Reusable notification function
export const showNotification = (type, message, options = {}) => {
  const defaultOptions = {
    text: message,
    icon: type, // 'success', 'error', 'warning', 'info'
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    position: 'top-right',
    toast: true,
    ...options // Allow custom options to override defaults
  };

  return Swal.fire(defaultOptions);
};

// Specific notification functions for convenience
export const showSuccess = (message, options = {}) => {
  return showNotification('success', message, options);
};

export const showError = (message, options = {}) => {
  return showNotification('error', message, options);
};

export const showWarning = (message, options = {}) => {
  return showNotification('warning', message, options);
};

export const showInfo = (message, options = {}) => {
  return showNotification('info', message, options);
};

// Confirmation dialog
export const showConfirmation = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'No') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText
  });
};

// Loading notification
export const showLoading = (message = 'Loading...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close any open Swal
export const closeSwal = () => {
  Swal.close();
}; 