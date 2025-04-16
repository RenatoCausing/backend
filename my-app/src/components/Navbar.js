
// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/search" className="nav-link">Search</Link>
        <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>
    </nav>
  );
}

export default Navbar;