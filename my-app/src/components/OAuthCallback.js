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
                // Call your backend endpoint to get the authenticated user data
                const response = await fetch('http://localhost:8080/api/advisers/process-oauth', {
                    method: 'GET', // Ensure it's a GET request as per your controller
                    credentials: 'include' // Important for sending cookies
                });

                if (response.ok) {
                    const userDataFromBackend = await response.json();
                    console.log("OAuth callback: User data received from backend:", userDataFromBackend); // Log received data from backend

                    // *** FIX: Explicitly include adminId and other necessary fields ***
                    // Create the user object that will be stored in the context
                    const userToStoreInContext = {
                        adminId: userDataFromBackend.adminId, // <-- Make sure this is taken from the backend response
                        firstName: userDataFromBackend.firstName,
                        lastName: userDataFromBackend.lastName,
                        middleName: userDataFromBackend.middleName,
                        email: userDataFromBackend.email,
                        imagePath: userDataFromBackend.imagePath,
                        role: userDataFromBackend.role,
                        facultyId: userDataFromBackend.facultyId, // Include facultyId if your DTO has it
                        isGuest: false // Explicitly set this for logged-in users
                        // Include any other fields from AdviserDTO that you need in the frontend
                    };

                    console.log("OAuth callback: Storing user data in context:", userToStoreInContext); // Log the object being stored
                    login(userToStoreInContext); // Store the complete user object in context

                    navigate('/'); // Redirect to home page
                } else {
                    console.error('Authentication failed', response.status);
                    // Attempt to read error body if available for more details
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
    }, [login, navigate]); // Added login and navigate to dependency array

    if (loading) {
        return (
            <div className="loading-container">
                <h2>Processing authentication...</h2>
                <p>Please wait while we complete your login</p>
                {/* Corrected: Removed extra closing brace here */}
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
