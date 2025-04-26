import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/AdviserNavbar.css';
import { useUser } from '../contexts/UserContext';

function AdviserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useUser();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    // You might want to redirect to homepage after logout
    // If you're using react-router-dom v6, you'd typically use useNavigate for this
  };

  // Check if the current path is the root path '/'
  const isAtRoot = location.pathname === '/';

  // Determine the profile link based on the current user
  const profileLink = currentUser?.adminId ? `/adviser/${currentUser.adminId}` : '/profile';

  return (
    <nav className="adviser-navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          {!isAtRoot && (
            <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          )}
          <Link to="/search" className="mobile-link" onClick={toggleMenu}>Search</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={toggleMenu}>Leaderboard</Link>

          {/* Conditionally render Dashboard link */}
          {isAuthenticated && currentUser && currentUser.role === 'staff' && (
            <Link to="/dashboard/user" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/dashboard/sp" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
        </div>

        <div className="navbar-buttons">
          {!isAuthenticated ? (
            <Link to="/login" className="signin-button">Login</Link>
          ) : currentUser.role === 'faculty' ? (
            // Updated to use dynamic profile link
            <Link to={profileLink} className="profile-button">Profile</Link>
          ) : (
            <Link to="/" onClick={handleLogout} className="profile-button">Logout</Link>
          )}
          {/* Add Logout button for Faculty role as well, if you want both Profile and Logout */}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/" onClick={handleLogout} className="logout-button">Logout</Link>
          )}
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      {/* Mobile menu content */}
      {isOpen && (
        <div className="mobile-menu">
          {!isAtRoot && (
            <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          )}
          <Link to="/search" className="mobile-link" onClick={toggleMenu}>Search</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={toggleMenu}>Leaderboard</Link>

          {/* Conditionally render Dashboard link in mobile menu */}
          {isAuthenticated && currentUser && currentUser.role === 'staff' && (
            <Link to="/dashboard/user" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/dashboard/sp" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}

          {/* Conditionally render auth-related links in mobile menu */}
          {!isAuthenticated ? (
            <Link to="/login" className="mobile-link signin-link" onClick={toggleMenu}>Login</Link>
          ) : currentUser.role === 'faculty' ? (
            // Updated to use dynamic profile link in mobile menu
            <Link to={profileLink} className="mobile-link profile-link" onClick={toggleMenu}>Profile</Link>
          ) : (
            <Link to="/" className="mobile-link logout-link" onClick={() => { handleLogout(); toggleMenu(); }}>Logout</Link>
          )}
          {/* Add Logout button for Faculty role in mobile as well */}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/" className="mobile-link logout-link" onClick={() => { handleLogout(); toggleMenu(); }}>Logout</Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default AdviserNavbar;