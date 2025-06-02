import { ProjectProvider } from './contexts/ProjectContext';
 
import React from 'react';
 
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
import LeaderboardPage from './pages/LeaderboardPage';
import ProjectsLeaderboardPage from './pages/ProjectsLeaderboardPage';
import SPDashboard from './pages/SPDashboard';

 
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
   
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
     
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

 
const PublicOrAuth = ({ children }) => {
  const { loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

   
  return children;
};

 
const RequireNoAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
   
   

  if (loading) {
    return <div>Loading...</div>;
  }

   
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

 
const RequireStaff = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
   
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

   
  if (!isAuthenticated || !currentUser || currentUser.role !== 'staff') {
     
    console.log("Access Denied: Not authenticated or not staff");
     
     
     
    return <Navigate to="/" state={{ from: location.pathname }} replace />;  
  }

  return children;
};

 
const RequireFaculty = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
   
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

   
  if (!isAuthenticated || !currentUser || currentUser.role !== 'faculty') {
     console.log("Access Denied: Not authenticated or not faculty");
      
    return <Navigate to="/" state={{ from: location.pathname }} replace />;  
  }

  return children;
};

 
const RequireFacultyOrStaff = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useUser();
   
  const location = useLocation();


  if (loading) {
    return <div>Loading...</div>;
  }

   
  if (!isAuthenticated || !currentUser || (currentUser.role !== 'faculty' && currentUser.role !== 'staff')) {
    console.log("Access Denied: Not authenticated or not faculty/staff");
     
    return <Navigate to="/" state={{ from: location.pathname }} replace />;  
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

        {/* Home page - accessible to everyone */}
        <Route
          path="/"
          element={
            <PublicOrAuth>
              <HomePage />
            </PublicOrAuth>
          }
        />

        {/* Student accessible routes - for search and viewing SP details */}
        <Route
          path="/search"
          element={
            <PublicOrAuth>
              <SPFilterSystem/>
            </PublicOrAuth>
          }
        />
        <Route
          path="/project/:spId"
          element={
            <PublicOrAuth>
              <SPDetails/>
            </PublicOrAuth>
          }
        />

        {/* Protected routes requiring ANY authenticated user */}
        {/* Adviser Profile, All Advisers */}
        <Route
          path="/adviser/:adviserId"
          element={
            <PublicOrAuth>
              <AdviserProfile />
            </PublicOrAuth>
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

        {/* Leaderboard routes */}
        <Route
          path="/leaderboard"
          element={
            <PublicOrAuth>
              <ProjectsLeaderboardPage/>
            </PublicOrAuth>
          }
        />
        <Route
          path="/leaderboard/sp"
          element={
            <PublicOrAuth>
              <ProjectsLeaderboardPage/>
            </PublicOrAuth>
          }
        />
        <Route
          path="/leaderboard/adviser"
          element={
            <PublicOrAuth>
              <LeaderboardPage/>
            </PublicOrAuth>
          }
        />

        {/* Protected routes requiring specific roles */}

        {/* General Dashboard route - Requires Faculty OR Staff */}
         <Route
           path="/dashboard/home"
           element={
             <RequireFacultyOrStaff>
                 <SPDashboard/> 
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
        <Route
          path="/dashboard/sp"
          element={
            <RequireFacultyOrStaff>
              <ProjectProvider>
                <SPProjectView/>
              </ProjectProvider>
            </RequireFacultyOrStaff>
          }
        />

        {/* Profile route - Requires Faculty ONLY */}
         <Route
           path="/profile"
           element={
             <RequireFaculty>
                <AdviserProfile />
             </RequireFaculty>
           }
         />

        {/* Catch all - redirect to home for any unmatched route */}
        {/* Routes defined above will be matched first */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;