import React, { useState } from 'react';
import '../styles/Dashboard.css';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState('SP');
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  const renderContent = () => {
    switch (activePanel) {
      case 'Home':
        return <div className="home-panel">Home Content</div>;
      case 'User':
        return <div className="user-panel">User Content</div>;
      case 'SP':
        return <div className="sp-panel">SP panel is rendered in the main content area</div>;
      default:
        return <div className="home-panel">Home Content</div>;
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend to invalidate the session (if needed)
      await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear local user data
      logout();
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - still logout locally even if server request fails
      logout();
      navigate('/login');
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return "Guest User";
    if (currentUser.isGuest) return "Guest User";
    return `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || "User";
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
            {currentUser?.imagePath ? (
              <img src={currentUser.imagePath} alt="Profile" />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div className="user-info">
            <h3>{getUserDisplayName()}</h3>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;