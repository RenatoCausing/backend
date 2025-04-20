import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
          
          // Make sure the user object has the needed properties
          if (!userData.firstName || !userData.lastName) {
            console.warn("Warning: User data missing name properties:", userData);
          }
          
          login(userData); // Store user in context
          navigate('/'); // Redirect to home page
        } else {
          console.error('Authentication failed', response.status);
          setError(`Authentication failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error during OAuth callback:', error);
        setError(`Error during OAuth callback: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [login, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Processing authentication...</h2>
        <p>Please wait while we complete your login</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return null; // This shouldn't render as we navigate away in the useEffect
};

export default OAuthCallback;