import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Note: This component no longer enforces wallet connection
// Users can access dashboard pages without connecting their wallet
// Individual features (like tipping, claiming) will prompt for wallet connection when needed
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
