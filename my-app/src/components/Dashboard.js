import React, { useState } from 'react';
import '../styles/Dashboard.css';
import { useUser } from '../contexts/UserContext';

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState('SP');
  const { currentUser, logout } = useUser();
  
  const renderContent = () => {
    switch (activePanel) {
      case 'Home':
        return <div className="home-panel">Home Content</div>;
      case 'User':
        return <div className="user-panel">User Content</div>;
      case 'SP':
        // No longer rendering SPFilterPanel directly
        return <div className="sp-panel">SP panel is rendered in the main content area</div>;
      default:
        return <div className="home-panel">Home Content</div>;
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/University_of_the_Philippines_Manila_Seal.svg/640px-University_of_the_Philippines_Manila_Seal.svg.png" 
            alt="University Logo" 
            className="university-logo" 
          />
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-button ${activePanel === 'Home' ? 'active' : ''}`} 
            onClick={() => setActivePanel('Home')}
          >
            <i className="fas fa-home"></i> Home
          </button>
          
          <button 
            className={`nav-button ${activePanel === 'User' ? 'active' : ''}`} 
            onClick={() => setActivePanel('User')}
          >
            <i className="fas fa-user"></i> User
          </button>
          
          <button 
            className={`nav-button ${activePanel === 'SP' ? 'active' : ''}`} 
            onClick={() => setActivePanel('SP')}
          >
            <i className="fas fa-file-alt"></i> SP
          </button>
        </div>
        
        {/* User profile at bottom */}
        <div className="user-profile">
          <div className="profile-circle">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div className="user-info">
            <h3>{currentUser?.displayName || "Guest User"}</h3>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default Dashboard;