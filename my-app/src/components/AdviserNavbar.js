import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/AdviserNavbar.css';
import { useUser } from '../contexts/UserContext';

function AdviserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useUser();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    // You might want to redirect to homepage after logout
  };

  // Check if the current path is the root path '/'
  const isAtRoot = location.pathname === '/';

  // Determine the profile link based on the current user
  const profileLink = currentUser?.adminId ? `/adviser/${currentUser.adminId}` : '/profile';

  // Determine dashboard link based on role
  const dashboardLink = currentUser?.role === 'faculty' ? '/dashboard/sp' : '/dashboard/user';

  return (
    <nav className="adviser-navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          {!isAtRoot && (
            <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          )}
          <Link to="/search" className="mobile-link" onClick={toggleMenu}>Search</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={toggleMenu}>Leaderboard</Link>
        </div>

        <div className="navbar-buttons">
          {!isAuthenticated ? (
            <Link to="/login" className="signin-button">Login</Link>
          ) : (
            <div className="user-menu-container">
              <button onClick={toggleUserMenu} className="avatar-button">
                <div className="user-avatar">
                  {/* You can replace with an actual image if available */}
                  {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
                </div>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  {/* Profile option */}
                  {currentUser.role === 'faculty' && (
                    <Link to={profileLink} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Profile
                    </Link>
                  )}
                  
                  {/* Dashboard option */}
                  {(currentUser.role === 'staff' || currentUser.role === 'faculty') && (
                    <Link to={dashboardLink} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  
                  {/* Logout option */}
                  <Link to="/" onClick={handleLogout} className="dropdown-item">
                    Logout
                  </Link>
                </div>
              )}
            </div>
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

          {/* Conditionally render auth-related links in mobile menu */}
          {!isAuthenticated ? (
            <Link to="/login" className="mobile-link signin-link" onClick={toggleMenu}>Login</Link>
          ) : (
            <>
              {/* Profile option for faculty */}
              {currentUser.role === 'faculty' && (
                <Link to={profileLink} className="mobile-link" onClick={toggleMenu}>
                  Profile
                </Link>
              )}
              
              {/* Dashboard option */}
              {(currentUser.role === 'staff' || currentUser.role === 'faculty') && (
                <Link to={dashboardLink} className="mobile-link" onClick={toggleMenu}>
                  Dashboard
                </Link>
              )}
              
              {/* Logout option */}
              <Link to="/" className="mobile-link logout-link" onClick={() => { handleLogout(); toggleMenu(); }}>
                Logout
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default AdviserNavbar;