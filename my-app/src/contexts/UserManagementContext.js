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
    { id: 1, name: 'BSBC' },
    { id: 2, name: 'BSCS' },
    { id: 3, name: 'BSAP' }
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Call the correct endpoint to get ALL users
      const response = await axios.get('http://localhost:8080/api/advisers/users/all');
      setUsers(response.data || []);
      setFilteredUsers(response.data || []); // Initialize filteredUsers with all users
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
    } else {
       // If users array is empty, clear filteredUsers as well
       setFilteredUsers([]);
       setSearchResults(null);
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

  // ✅ EDITED: Reset selectedFaculty if the new role is not 'faculty'
  const handleRoleChange = useCallback((e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);

    // If the newly selected role is anything other than 'faculty', reset the faculty filter
    if (newRole !== 'faculty') {
      setSelectedFaculty(''); // Reset selectedFaculty state to default empty value
    }
  }, [setSelectedRole, setSelectedFaculty]); // Add state setters to dependency array


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect hook handles applying the search filter when debouncedSearchTerm changes
  };

  const handleAddUser = () => {
    const newUser = {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      role: '', // Default to empty/student role
      facultyId: '', // Default to empty
      imagePath: '',
      description: '',
      isNew: true // Flag for a new user
    };

    setEditingUser(newUser);
    setFormData({ ...newUser }); // Initialize form data with new user structure
    setShowEditPanel(true);
    setImagePreviewFailed(false); // Reset image preview state
  };


  const handleEditUser = (user) => {
    setEditingUser(user);
    // Populate form data from the user object, handling potential nulls
    setFormData({
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || '', // Ensure empty string if null
      facultyId: user.facultyId || '', // Ensure empty string if null
      imagePath: user.imagePath || '',
      description: user.description || ''
    });
    setShowEditPanel(true);
    setImagePreviewFailed(false); // Reset image preview state
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

    // Prepare data for backend, handle null for empty role/facultyId
    const dataToSend = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      // Convert empty string role to null for backend if necessary
      role: formData.role === '' ? null : formData.role,
      // Convert empty string facultyId to null for backend if necessary, and parse to int
      facultyId: formData.facultyId === '' ? null : parseInt(formData.facultyId),
      imagePath: formData.imagePath,
      description: formData.description
    };


    try {
      let response;
      if (editingUser.isNew) {
        // Call API to create new user
        response = await axios.post(
          'http://localhost:8080/api/advisers/admin/create',
          dataToSend // Use prepared dataToSend
        );
        // Add the new user to our state
        // Assuming the backend response is the saved DTO with adminId etc.
        setUsers(prevUsers => [...prevUsers, response.data]);

      } else {
        // Call API to update existing user
        response = await axios.put(
          `http://localhost:8080/api/advisers/admin/${editingUser.adminId}/update`,
          dataToSend // Use prepared dataToSend
        );
        // Update the user in our state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.adminId === editingUser.adminId ? response.data : user // Use the updated data from response
          )
        );
      }

      // Close the edit panel and reset editing state
      setShowEditPanel(false);
      setEditingUser(null);
      // Trigger a potential re-fetch or re-filter if needed, or rely on state update
      // setRefreshTrigger(prev => prev + 1); // If you need to explicitly trigger fetch
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Failed to save user. Please check the data and try again.");
      // Consider showing a more user-friendly error message in the UI
    }
  };


  const handleClosePanel = () => {
    setShowEditPanel(false);
    setEditingUser(null);
    // Reset form data when closing the panel
    setFormData({
      firstName: '', middleName: '', lastName: '', email: '',
      role: '', facultyId: '', imagePath: '', description: ''
    });
    setImagePreviewFailed(false); // Reset image preview state
    // Also close delete confirmation if it's open
    setShowDeleteConfirm(false);
    setUserToDelete(null);
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
      setError(null); // Clear any previous errors

    } catch (error) {
      console.error("Error deleting user:", error);
      // Check for specific error message from backend if available
      if (error.response && error.response.data) {
        setError(`Failed to delete user: ${error.response.data}`);
      } else {
        setError("Failed to delete user. It might be associated with other data.");
      }
      setShowDeleteConfirm(false); // Close modal even on error
    }
  };

// Handler for changing role within an individual user item
  const handleUserRoleChange = async (user, newRole) => {
    try {
      // Prepare updated user data, converting empty string to null for backend
      const updatedUser = { 
        ...user, 
        role: newRole === '' ? null : newRole,
        // If changing role *from* faculty to something else, clear facultyId in the data sent to backend
        facultyId: (user.role === 'faculty' && newRole !== 'faculty') ? null : user.facultyId || null
      };

      // Call API to update user role
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser // Send the updated data
      );

      // Update the user in state with the response data (includes updated fields)
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


  // Handler for changing faculty within an individual user item
  const handleUserFacultyChange = async (user, newFacultyId) => {
    try {
      // Prepare updated user data, handling null for empty facultyId
      const updatedUser = {
        ...user,
        facultyId: newFacultyId === '' ? null : parseInt(newFacultyId)
      };

      // Call API to update user faculty
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser // Send the updated data
      );

      // Update the user in state with the response data
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

  // Helper function to extract Google Drive File ID
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
    const faculty = faculties.find(f => f.id === facultyId); // Assuming faculty objects in state have 'id'
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
    refreshTrigger, // Include refreshTrigger if used elsewhere
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
    setSearchTerm,
    // ... include any other values you want to expose
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};