import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirect unauthenticated users to the login page
    return <Navigate to='/' state={{ from: location }} replace />;
  }

  // If token exists, render nested routes
  return <Outlet />;
};

export default RequireAuth;

 