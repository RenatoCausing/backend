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
                console.log("OAuth callback: Fetching user data from backend...");
                const response = await fetch('http://localhost:8080/api/advisers/process-oauth', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const userDataFromBackend = await response.json();
                    console.log("OAuth callback: User data received from backend:", userDataFromBackend);

                    const userToStoreInContext = {
                        adminId: userDataFromBackend.adminId,
                        firstName: userDataFromBackend.firstName,
                        lastName: userDataFromBackend.lastName,
                        middleName: userDataFromBackend.middleName,
                        email: userDataFromBackend.email,
                        imagePath: userDataFromBackend.imagePath,
                        role: userDataFromBackend.role,
                        facultyId: userDataFromBackend.facultyId,
                        isGuest: false
                    };

                    console.log("OAuth callback: Storing user data in context:", userToStoreInContext);
                    login(userToStoreInContext);

                    navigate('/');
                } else {
                    console.error('Authentication failed', response.status);
                    const errorBody = await response.text();
                    console.error('Authentication failed error body:', errorBody);
                    setError(`Authentication failed with status: ${response.status}. Details: ${errorBody}`);
                }
            } catch (error) {
                console.error('Error during OAuth callback:', error);
                setError(`An error occurred during OAuth callback: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [login, navigate]);

    if (loading) {
        return <div className="loading-container"><h2>Processing authentication...</h2><p>Please wait while we complete your login</p></div>;
    }

    if (error) {
        return <div className="error-container"><h2>Authentication Error</h2><p>{error}</p><button onClick={() => navigate('/login')}>Back to Login</button></div>;
    }

    return null;
};

export default OAuthCallback;