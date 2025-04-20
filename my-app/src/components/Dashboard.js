import React from 'react';
import '../styles/Dashboard.css';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active panel based on current path
  const getActivePanel = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/user')) return 'User';
    if (path.includes('/dashboard/sp')) return 'SP';
    return 'Home';
  };
  
  const activePanel = getActivePanel();
  
  // Navigation handlers
  const navigateToPanel = (panel) => {
    switch (panel) {
      case 'Home':
        navigate('/dashboard/home');
        break;
      case 'User':
        navigate('/dashboard/user');
        break;
      case 'SP':
        navigate('/dashboard/sp');
        break;
      default:
        navigate('/dashboard/home');
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend to invalidate the session
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
            onClick={() => navigateToPanel('Home')}
          >
            <i className="fas fa-home"></i> Home
          </button>
          
          <button 
            className={`nav-button ${activePanel === 'User' ? 'active' : ''}`} 
            onClick={() => navigateToPanel('User')}
          >
            <i className="fas fa-user"></i> User
          </button>
          
          <button 
            className={`nav-button ${activePanel === 'SP' ? 'active' : ''}`} 
            onClick={() => navigateToPanel('SP')}
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
      
      {/* No content area - content will be rendered by route components */}
    </div>
  );
};

export default Dashboard;