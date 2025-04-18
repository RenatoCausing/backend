import React from 'react';
import './Editbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faFolder, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const EditBarSP = ({ activeSection, onSectionChange, currentUser }) => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/University_of_the_Philippines_Manila_Seal.svg/640px-University_of_the_Philippines_Manila_Seal.svg.png" 
          alt="University Logo" 
          className="logo"
        />
      </div>
      
      <div className="navigation">
        <button 
          className={`nav-button ${activeSection === 'Home' ? 'active' : ''}`}
          onClick={() => onSectionChange('Home')}
        >
          <FontAwesomeIcon icon={faHome} className="nav-icon" />
          <span>Home</span>
        </button>
        
        <button 
          className={`nav-button ${activeSection === 'User' ? 'active' : ''}`}
          onClick={() => onSectionChange('User')}
        >
          <FontAwesomeIcon icon={faUser} className="nav-icon" />
          <span>User</span>
        </button>
        
        <button 
          className={`nav-button ${activeSection === 'SP' ? 'active' : ''}`}
          onClick={() => onSectionChange('SP')}
        >
          <FontAwesomeIcon icon={faFolder} className="nav-icon" />
          <span>SP</span>
        </button>
      </div>
      
      <div className="user-profile">
        <div className="profile-pic">
          <img 
            src={currentUser.profilePic || "https://via.placeholder.com/50"} 
            alt="User Profile" 
          />
        </div>
        <div className="user-info">
          <div className="user-name">{currentUser.name}</div>
          <a href="/logout" className="logout-link">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export default EditBarSP;