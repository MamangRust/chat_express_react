import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/auth'; // Sesuaikan dengan path ke useAuthStore dari Zustand

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
