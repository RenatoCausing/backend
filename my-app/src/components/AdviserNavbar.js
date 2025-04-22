import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdviserNavbar.css';
import { useUser } from '../contexts/UserContext'; // Import the useUser hook

function AdviserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAuthenticated } = useUser(); // Use the useUser hook

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="adviser-navbar">
      <div className="navbar-container">

        <div className="navbar-links">
          <Link to="/search" className="mobile-link" onClick={toggleMenu}>Search</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={toggleMenu}>Leaderboard</Link>
          <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          {/* Conditionally render Dashboard link */}
          {isAuthenticated && currentUser && currentUser.role === 'staff' && (
            <Link to="/dashboard/user" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/dashboard/sp" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
        </div>

        <div className="navbar-buttons">
          <Link to="/profile" className="profile-button">Profile</Link>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      {isOpen && (
        <div className="mobile-menu">
          <Link to="/search" className="mobile-link" onClick={toggleMenu}>Search</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={toggleMenu}>Leaderboard</Link>
          <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
           {/* Conditionally render Dashboard link in mobile menu */}
           {isAuthenticated && currentUser && currentUser.role === 'staff' && (
            <Link to="/dashboard/user" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
          {isAuthenticated && currentUser && currentUser.role === 'faculty' && (
            <Link to="/dashboard/sp" className="mobile-link" onClick={toggleMenu}>Dashboard</Link>
          )}
          <Link to="/profile" className="mobile-link profile-link" onClick={toggleMenu}>Profile</Link>
        </div>
      )}
    </nav>
  );
}

export default AdviserNavbar;