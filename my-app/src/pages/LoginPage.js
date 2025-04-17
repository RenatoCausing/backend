// src/pages/LoginPage.js
import React from 'react';
import universityLogo from '../images/university-logo.png';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useUser();
// In src/pages/LoginPage.js, update the handleGuestLogin function:
const handleGuestLogin = () => {
    // Create a guest user object
    const guestUser = {
      adminId: null,
      firstName: "Guest",
      lastName: "User",
      isGuest: true
    };  
    
    // Use the login function from context to set this guest user
    login(guestUser);
    
    // Navigate to home page
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // Redirect to your backend's OAuth endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="login-page">
      <div className="login-container">
      <img 
  src={universityLogo} 
  alt="University Logo" 
  className="logo"
/>
        <h1>Sign in to WorkOS</h1>
        <p>This workspace allows you to sign in with your<br />@workos.com Google account.</p>
        
        <button 
          className="google-btn" 
          onClick={handleGoogleLogin}
        >
          <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login with Google
        </button>
        
        <div className="divider">
          <span className="divider-text">or</span>
        </div>
        
        <button 
          className="guest-btn" 
          onClick={handleGuestLogin}
        >
          Continue as Guest
        </button>
        
        <p className="guest-text">
          Continue browsing SPIS as a guest if you are a student exploring SPs from DFPW Department.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;