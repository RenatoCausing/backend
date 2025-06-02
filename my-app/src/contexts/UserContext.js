import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);  

    useEffect(() => {
        console.log("UserContext: useEffect checking localStorage...");
         
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("UserContext: Loaded user from localStorage:", parsedUser);  
                setCurrentUser(parsedUser);
            } catch (e) {
                console.error("UserContext: Error parsing stored user data from localStorage:", e);  
                localStorage.removeItem('user');  
            }
        }
        setLoading(false);  
        console.log("UserContext: Loading finished.");
    }, []);  

    const login = (userData) => {
        console.log("UserContext: login function called with userData:", userData);  
        setCurrentUser(userData);  
        try {
            localStorage.setItem('user', JSON.stringify(userData));  
            console.log("UserContext: Stored user in localStorage");
        } catch (e) {
            console.error("UserContext: Error storing user data in localStorage:", e);  
        }
    };

    const logout = () => {
        console.log("UserContext: Logging out user");
        setCurrentUser(null);  
        localStorage.removeItem('user');  
    };

     
    const isAuthenticated = !!currentUser && !currentUser.isGuest;

    return (
                <UserContext.Provider value={{ currentUser, isAuthenticated, login, logout, loading }}>{!loading && children}</UserContext.Provider>
            );
};

export const useUser = () => useContext(UserContext);
