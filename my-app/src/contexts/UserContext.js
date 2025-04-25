import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // State to indicate if context is loading user from storage

    useEffect(() => {
        console.log("UserContext: useEffect checking localStorage...");
        // Check localStorage for existing user on initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("UserContext: Loaded user from localStorage:", parsedUser); // Log user loaded from storage
                setCurrentUser(parsedUser);
            } catch (e) {
                console.error("UserContext: Error parsing stored user data from localStorage:", e); // Log parsing errors
                localStorage.removeItem('user'); // Clear invalid data
            }
        }
        setLoading(false); // Loading is complete after checking storage
        console.log("UserContext: Loading finished.");
    }, []); // Empty dependency array means this runs once on mount

    const login = (userData) => {
        console.log("UserContext: login function called with userData:", userData); // Log data received by login
        setCurrentUser(userData); // Set the user state
        try {
            localStorage.setItem('user', JSON.stringify(userData)); // Store in local storage
            console.log("UserContext: Stored user in localStorage");
        } catch (e) {
            console.error("UserContext: Error storing user data in localStorage:", e); // Log storage errors
        }
    };

    const logout = () => {
        console.log("UserContext: Logging out user");
        setCurrentUser(null); // Clear user state
        localStorage.removeItem('user'); // Remove from local storage
    };

    // Determine if user is authenticated (not null and not a guest if you have guest logic)
    const isAuthenticated = !!currentUser && !currentUser.isGuest;

    return (
                <UserContext.Provider value={{ currentUser, isAuthenticated, login, logout, loading }}>{!loading && children}{loading && <div>Loading user session...</div>}</UserContext.Provider>
            );
};

export const useUser = () => useContext(UserContext);
