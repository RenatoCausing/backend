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
        <Link to="/" className="navbar-logo">
          SPIS
        </Link>
        
        <div className="navbar-links">
          <Link to="/home" className="navbar-link">Home</Link>
          <Link to="/browse" className="navbar-link">Browse</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
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
          <Link to="/home" className="mobile-link" onClick={toggleMenu}>Home</Link>
          <Link to="/browse" className="mobile-link" onClick={toggleMenu}>Browse</Link>
          <Link to="/about" className="mobile-link" onClick={toggleMenu}>About</Link>
          <Link to="/contact" className="mobile-link" onClick={toggleMenu}>Contact</Link>
          <Link to="/profile" className="mobile-link profile-link" onClick={toggleMenu}>Profile</Link>
        </div>
      )}
    </nav>
  );
}

export default AdviserNavbar;