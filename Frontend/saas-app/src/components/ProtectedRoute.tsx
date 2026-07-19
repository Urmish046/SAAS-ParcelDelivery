import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectPath?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectPath = '/login',
}: ProtectedRouteProps) => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token || !user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};