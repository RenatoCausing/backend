// src/components/OAuthCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("OAuth callback: Fetching user data...");
        // Call your backend endpoint to get the authenticated user data
        const response = await fetch('http://localhost:8080/api/advisers/process-oauth', {
          credentials: 'include' // Important for sending cookies
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("OAuth callback: User data received:", userData);
          login(userData); // Store user in context
          navigate('/'); // Redirect to home page
        } else {
          console.error('Authentication failed', response.status);
          setError(`Authentication failed with status: ${response.status}`);
          // Don't redirect yet, show the error
        }
      } catch (error) {
        console.error('Error during OAuth callback:', error);
        setError(`Error during OAuth callback: ${error.message}`);
        // Don't redirect yet, show the error
      }
    };

    // We're already on the oauth-callback page
    fetchUserData();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <h2>Processing authentication...</h2>
      <p>Please wait while we complete your login</p>
    </div>
  );
};

export default OAuthCallback;