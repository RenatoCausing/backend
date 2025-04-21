import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

// Create context
const UserContext = createContext();

// Custom hook to use the context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserManagementProvider');
  }
  return context;
};

export const UserManagementProvider = ({ children }) => {
  // State management for users and filtering
  const [faculties, setFaculties] = useState([
    { id: 1, name: 'BSCS' },
    { id: 2, name: 'BSAP' },
    { id: 3, name: 'BSBC' }
  ]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  
  // State for adding/editing user
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Edit form data
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    role: '',
    facultyId: '',
    imagePath: '',
    description: ''
  });
  
  // State for profile image handling
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  
  // State for delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Refresh trigger for data updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/advisers');
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Apply filters whenever filter states change
  useEffect(() => {
    if (users.length > 0) {
      let results = [...users];
      
      // Apply faculty filter
      if (selectedFaculty) {
        results = results.filter(user => 
          user.facultyId === parseInt(selectedFaculty)
        );
      }
      
      // Apply role filter
      if (selectedRole) {
        if (selectedRole === 'student') {
          // If role is student, check for null or empty role
          results = results.filter(user => !user.role || user.role === '');
        } else {
          results = results.filter(user => user.role === selectedRole);
        }
      }
      
      // Apply search term filter
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        results = results.filter(user => 
          (user.firstName && user.firstName.toLowerCase().includes(term)) ||
          (user.lastName && user.lastName.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
        );
        
        setSearchResults({
          term: debouncedSearchTerm,
          count: results.length
        });
      } else {
        setSearchResults(null);
      }
      
      setFilteredUsers(results);
    }
  }, [selectedFaculty, selectedRole, debouncedSearchTerm, users]);

  // Implement debouncing for search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);
  
  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };
  
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
  };
  
  const handleAddUser = () => {
    const newUser = {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      role: '',
      facultyId: '',
      imagePath: '',
      description: '',
      isNew: true
    };
    
    setEditingUser(newUser);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      role: '',
      facultyId: '',
      imagePath: '',
      description: ''
    });
    setShowEditPanel(true);
    setImagePreviewFailed(false);
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || '',
      facultyId: user.facultyId || '',
      imagePath: user.imagePath || '',
      description: user.description || ''
    });
    setShowEditPanel(true);
    setImagePreviewFailed(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create updated user object with editable fields
    const updatedUserData = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role === '' ? null : formData.role,
      facultyId: formData.facultyId ? parseInt(formData.facultyId) : null,
      imagePath: formData.imagePath,
      description: formData.description
    };
    
    try {
      if (editingUser.isNew) {
        // Call API to create new user
        const response = await axios.post(
          'http://localhost:8080/api/advisers/admin/create', 
          updatedUserData
        );
        
        // Add the new user to our state
        setUsers(prevUsers => [...prevUsers, response.data]);
        
      } else {
        // Call API to update existing user
        const response = await axios.put(
          `http://localhost:8080/api/advisers/admin/${editingUser.adminId}/update`, 
          updatedUserData
        );
        
        // Update the user in our state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.adminId === editingUser.adminId ? response.data : user
          )
        );
      }
      
      // Close the edit panel
      setShowEditPanel(false);
      setEditingUser(null);
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Failed to save user. Please try again.");
    }
  };
  
  const handleClosePanel = () => {
    setShowEditPanel(false);
    setEditingUser(null);
  };
  
  const handleConfirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/advisers/admin/${userToDelete}`);
      
      // Remove user from state
      setUsers(prevUsers => prevUsers.filter(user => user.adminId !== userToDelete));
      
      // Close the delete confirmation dialog
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
      setShowDeleteConfirm(false);
    }
  };

  const handleUserRoleChange = async (user, newRole) => {
    try {
      const updatedUser = { ...user, role: newRole === '' ? null : newRole };
      
      // Call API to update user role
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser
      );
      
      // Update the user in state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.adminId === user.adminId ? response.data : u
        )
      );
      
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    }
  };
  
  const handleUserFacultyChange = async (user, newFacultyId) => {
    try {
      const updatedUser = { 
        ...user, 
        facultyId: newFacultyId ? parseInt(newFacultyId) : null 
      };
      
      // Call API to update user faculty
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser
      );
      
      // Update the user in state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.adminId === user.adminId ? response.data : u
        )
      );
      
    } catch (error) {
      console.error("Error updating user faculty:", error);
      setError("Failed to update user faculty. Please try again.");
    }
  };
  
  const extractImageFileId = (url) => {
    if (!url) return null;
    
    // Handle direct file IDs
    if (!url.includes('/') && !url.includes('drive.google.com')) {
      return url;
    }
    
    // Extract from standard Drive URLs
    const fileIdMatch = url.match(/\/d\/([^\/]+)/) || 
                       url.match(/id=([^&]+)/) ||
                       url.match(/file\/d\/([^\/]+)/);
                      
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    return null;
  };

  const getImagePreviewUrl = (imageUrl) => {
    const fileId = extractImageFileId(imageUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  const handleImageError = () => {
    setImagePreviewFailed(true);
  };
  
  // Format utility functions
  const formatFullName = (user) => {
    if (!user) return '';
    
    const nameParts = [];
    if (user.lastName) nameParts.push(user.lastName);
    if (user.firstName) nameParts.push(user.firstName);
    
    return nameParts.join(', ');
  };
  
  const getRoleDisplayName = (role) => {
    if (!role) return 'Student';
    switch (role) {
      case 'faculty':
        return 'Faculty';
      case 'staff':
        return 'Staff';
      default:
        return 'Student';
    }
  };
  
  const getFacultyName = (facultyId) => {
    if (!facultyId) return 'No Faculty';
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : `Faculty ${facultyId}`;
  };

  const contextValue = {
    faculties,
    users,
    filteredUsers,
    loading,
    error,
    selectedFaculty,
    selectedRole,
    searchTerm,
    searchResults,
    showEditPanel,
    editingUser,
    formData,
    imagePreviewFailed,
    showDeleteConfirm,
    userToDelete,
    refreshTrigger,
    fetchUsers,
    handleFacultyChange,
    handleRoleChange,
    handleSearchChange,
    handleSearch,
    handleAddUser,
    handleEditUser,
    handleFormChange,
    handleSubmit,
    handleClosePanel,
    handleConfirmDelete,
    handleDeleteUser,
    handleUserRoleChange,
    handleUserFacultyChange,
    getImagePreviewUrl,
    handleImageError,
    formatFullName,
    getRoleDisplayName,
    getFacultyName,
    setSearchTerm
  };
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};