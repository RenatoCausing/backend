import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdviserNavbar.css';

function AdviserNavbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <Link to="/profile" className="mobile-link profile-link" onClick={toggleMenu}>Profile</Link>
        </div>
      )}
    </nav>
  );
}

export default AdviserNavbar;