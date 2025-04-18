// src/App.js 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdviserProfile from './pages/AdviserProfile';
import LoginPage from './pages/LoginPage';
import SPFilterSystem from './pages/SPFilterSystem';
import OAuthCallback from './components/OAuthCallback';
import { useUser } from './contexts/UserContext';
import './App.css';

// This component checks if user is authenticated
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  
  // If still checking localStorage, show loading
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, show the protected component
  return children;
};

// This component prevents authenticated users from seeing login page
const RequireNoAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/oauth-callback" element={<OAuthCallback />} />
  
        {/* Login route - only for non-authenticated users */}
        <Route 
          path="/login" 
          element={
            <RequireNoAuth>
              <LoginPage />
            </RequireNoAuth>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/adviser/:adviserId" 
          element={
            <RequireAuth>
              <AdviserProfile />
            </RequireAuth>
          } 
        />
        <Route 
          path="/advisers" 
          element={
            <RequireAuth>
              <div>All Advisers Page (To be implemented)</div>
            </RequireAuth>
          } 
        />
        <Route 
          path="/search" 
          element={
            <RequireAuth>
              <SPFilterSystem/>
            </RequireAuth>
          } 
        />
        <Route 
          path="/project/:spId" 
          element={
            <RequireAuth>
              <div>Project Details Page (To be implemented)</div>
            </RequireAuth>
          } 
        />
        


        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;