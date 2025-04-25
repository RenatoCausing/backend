import { ProjectProvider } from './contexts/ProjectContext';
// src/App.js
import React from 'react';
// Import useLocation
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdviserProfile from './pages/AdviserProfile';
import LoginPage from './pages/LoginPage';
import SPFilterSystem from './pages/SPFilterSystem';
import OAuthCallback from './components/OAuthCallback';
import { useUser } from './contexts/UserContext';
import './App.css';
import SPDetails from './pages/SPDetails';
import SPProjectView from './pages/SPProjectView';
import UserManagementView from './pages/UserManagementView';
import { UserManagementProvider } from './contexts/UserManagementContext';

// Component to check if user is authenticated (any logged-in user)
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  // Use the useLocation hook
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the current path in state for redirection back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Component to prevent authenticated users from seeing login page
const RequireNoAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  // Use the useLocation hook if you ever need the current location here
  // const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If authenticated, redirect to home or a default logged-in page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component to require authentication and staff role
const RequireStaff = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
  // Use the useLocation hook
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated OR not staff, redirect
  if (!isAuthenticated || !currentUser || currentUser.role !== 'staff') {
    // Redirect to home or a permission denied page, preserving the attempted path
    console.log("Access Denied: Not authenticated or not staff");
    // Using state={{ from: location.pathname }} allows you to potentially redirect back
    // after login, although the primary restriction here is role, not just auth.
    // Redirecting to '/' is a common pattern for permission denied.
    return <Navigate to="/" state={{ from: location.pathname }} replace />; // Or a custom permission denied route
  }

  return children;
};

// Component to require authentication and faculty role
const RequireFaculty = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
  // Use the useLocation hook
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated OR not faculty, redirect
  if (!isAuthenticated || !currentUser || currentUser.role !== 'faculty') {
     console.log("Access Denied: Not authenticated or not faculty");
     // Using state={{ from: location.pathname }}
    return <Navigate to="/" state={{ from: location.pathname }} replace />; // Or a custom permission denied route
  }

  return children;
};

// Component to require authentication and EITHER faculty or staff role
const RequireFacultyOrStaff = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
  // Use the useLocation hook
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated OR role is neither faculty nor staff, redirect
  if (!isAuthenticated || !currentUser || (currentUser.role !== 'faculty' && currentUser.role !== 'staff')) {
    console.log("Access Denied: Not authenticated or not faculty/staff");
    // Using state={{ from: location.pathname }}
    return <Navigate to="/" state={{ from: location.pathname }} replace />; // Or a custom permission denied route
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

        {/* Protected routes requiring ANY authenticated user */}
        {/* Home, Adviser Profile, All Advisers, Search, Project Details */}
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
              <SPDetails/>
            </RequireAuth>
          }
        />


        {/* Protected routes requiring specific roles */}

        {/* General Dashboard route - Requires Faculty OR Staff */}
         <Route
           path="/dashboard"
           element={
             <RequireFacultyOrStaff>
                {/* This route serves as a landing or redirect point */}
                 {/* You might place a component here that redirects based on role */}
               <SPProjectView/> {/* Or render a default dashboard view */}
             </RequireFacultyOrStaff>
           }
         />

        {/* User Management Dashboard - Requires Staff ONLY */}
        <Route
          path="/dashboard/user"
          element={
            <RequireStaff>
              <UserManagementProvider>
                <UserManagementView/>
              </UserManagementProvider>
            </RequireStaff>
          }
        />

        {/* SP Project Dashboard - Requires Faculty OR Staff */}
         {/* --- Start of Change --- */}
        <Route
          path="/dashboard/sp"
          element={
            <RequireFacultyOrStaff> {/* Changed from RequireFaculty */}
              <ProjectProvider>
                <SPProjectView/>
              </ProjectProvider>
            </RequireFacultyOrStaff>
          }
        />
         {/* --- End of Change --- */}

        {/* Profile route - Requires Faculty ONLY */}
         <Route
           path="/profile"
           element={
             <RequireFaculty> {/* Apply Faculty restriction */}
                <AdviserProfile /> {/* Assuming AdviserProfile is also the edit profile page */}
             </RequireFaculty>
           }
         />


        {/* Catch all - redirect to login for any unmatched route that isn't publicly accessible */}
        {/* Routes defined above will be matched first */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;