import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import '../styles/Navbar.css';

function Navbar() {
  const { currentUser } = useUser();
  
  // Determine the profile link based on the current user
  const profileLink = currentUser?.adminId ? `/adviser/${currentUser.adminId}` : '/profile';

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/search" className="nav-link">Search</Link>
        <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
        <Link to="/" className="nav-link">Home</Link>
        <Link to={profileLink} className="nav-link">Profile</Link>
      </div>
    </nav>
  );
}

export default Navbar;