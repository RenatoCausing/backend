import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/UserManagementPanel.css';

const UserManagementPanel = () => {
  // State management for users and filtering
  const [faculties, setFaculties] = useState([
    { id: 1, name: 'BSCS' },
    { id: 2, name: 'BSAP' },
    { id: 3, name: 'BSIT' }
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
  
  // State for adding new user
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
  
  // Refs
  const searchTimeoutRef = useRef(null);
  const panelContainerRef = useRef(null);

  // Implement debouncing for search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Update the endpoint to use the advisers API
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
    };
    
    fetchUsers();
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
  
  // Update form data when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        firstName: editingUser.firstName || '',
        middleName: editingUser.middleName || '',
        lastName: editingUser.lastName || '',
        email: editingUser.email || '',
        role: editingUser.role || '',
        facultyId: editingUser.facultyId || '',
        imagePath: editingUser.imagePath || '',
        description: editingUser.description || ''
      });
      setImagePreviewFailed(false);
    }
  }, [editingUser]);
  
  // Format full name for display
  const formatFullName = (user) => {
    if (!user) return '';
    
    const nameParts = [];
    if (user.lastName) nameParts.push(user.lastName);
    if (user.firstName) nameParts.push(user.firstName);
    
    return nameParts.join(', ');
  };
  
  // Handle faculty selection change
  const handleFacultyChange = (e) => {
    setSelectedFaculty(e.target.value);
  };
  
  // Handle role selection change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
  };
  
  // Get role display name
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
  
  // Get faculty name
  const getFacultyName = (facultyId) => {
    if (!facultyId) return 'No Faculty';
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : `Faculty ${facultyId}`;
  };
  
  // Handle adding new user
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
    setShowEditPanel(true);
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle form submission
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
      
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Failed to save user. Please try again.");
    }
  };
  
  // Handle panel close
  const handleClosePanel = () => {
    setShowEditPanel(false);
    setEditingUser(null);
  };
  
  // Handle delete confirmation dialog open
  const handleConfirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };
  
  // Handle user deletion after confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/advisers/admin/${userToDelete}`);
      
      // Remove user from state
      setUsers(prevUsers => prevUsers.filter(user => user.adminId !== userToDelete));
      
      // Close the delete confirmation dialog
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
      setShowDeleteConfirm(false);
    }
  };

  // Handle direct role change for a user
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
  
  // Handle direct faculty change for a user
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
  
  // Extract image ID from various URL formats
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

  // Get preview URL for image
  const getImagePreviewUrl = (imageUrl) => {
    const fileId = extractImageFileId(imageUrl);
    if (!fileId) return null;
    
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  const handleImageError = () => {
    setImagePreviewFailed(true);
  };

  return (
    <div className="user-management-container">
      <div className="flex w-full max-w-6xl mx-auto bg-white">
        {/* Main Container */}
        <div className="w-full p-4">
          {/* Search and Filter Row */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 mb-9">
              {/* Add User Button */}
              <button
                type="button"
                className="bg-red-800 text-white rounded p-2 flex items-center justify-center gap-1"
                onClick={handleAddUser}
              >
                <i className="fa fa-plus"></i> ADD USER
              </button>
              
              <select 
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleFacultyChange}
                value={selectedFaculty}
              >
                <option value="">All Faculties</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
              
              <select 
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleRoleChange}
                value={selectedRole}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </select>
              
              <div className="flex flex-1">
                <input 
                  type="text" 
                  placeholder="Search users" 
                  className="flex-1 border border-gray-300 rounded-l p-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-red-800 text-white px-4 rounded-r"
                >
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </form>
            
            {searchResults && (
              <div className="bg-green-100 p-3 rounded">
                Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
              </div>
            )}
          </div>
          
          {/* Loading and Error States */}
          {loading && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}
          
          {/* User Results */}
          <div style={{width: '100%'}}>
            {/* Top divider */}
            <div className="user-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>
            
            {!loading && filteredUsers.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No users found. Try adjusting your filters.
              </div>
            )}
            
            {filteredUsers.map((user, index) => (
              <div key={user.adminId} className="relative">
                <div className="mb-6">
                  {/* Header with action buttons */}
                  <div className="flex mb-2">
                    <h3 className="text-lg font-semibold flex-1">
                      {formatFullName(user)}
                    </h3>
                    
                    {/* Action buttons with edit dropdowns */}
                    <div className="flex ml-auto">
                      {/* Role selection dropdown */}
                      <select
                        className="border border-gray-300 rounded p-1 text-sm mr-2"
                        value={user.role || ""}
                        onChange={(e) => handleUserRoleChange(user, e.target.value)}
                      >
                        <option value="">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                      </select>
                      
                      {/* Faculty selection dropdown */}
                      <select
                        className="border border-gray-300 rounded p-1 text-sm mr-2"
                        value={user.facultyId || ""}
                        onChange={(e) => handleUserFacultyChange(user, e.target.value)}
                      >
                        <option value="">No Faculty</option>
                        {faculties.map(faculty => (
                          <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                      </select>
                      
                      <button 
                        onClick={() => handleConfirmDelete(user.adminId)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* User info */}
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4"><i className="fa-solid fa-envelope"></i> {user.email || 'No email'}</span>
                    <span className="mr-4"><i className="fa-solid fa-user-tag"></i> {getRoleDisplayName(user.role)}</span>
                    <span><i className="fa-solid fa-building"></i> {getFacultyName(user.facultyId)}</span>
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm mb-3">{user.description || 'No description available.'}</div>
                </div>
                
                {/* Divider between users */}
                {index < filteredUsers.length - 1 && (
                  <div 
                    className="user-divider"
                    style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Panel (Slide in from right) */}
        {showEditPanel && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50 transform transition-transform" 
               style={{ 
                 transform: showEditPanel ? 'translateX(0)' : 'translateX(100%)'
               }}>
            <div className="edit-panel-container h-full flex flex-col">
              {/* Panel header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {editingUser?.isNew ? 'Add New User' : 'Edit User'}
                </h2>
                <button
                  onClick={handleClosePanel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
              
              {/* Panel content */}
              <div className="flex-1 p-4 overflow-y-auto" ref={panelContainerRef}>
                {formData.imagePath && (
                  <div className="mb-4 flex justify-center">
                    {!imagePreviewFailed ? (
                      <img 
                        src={getImagePreviewUrl(formData.imagePath)}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-2">
                        No preview available
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                        First Name *
                      </label>
                      <input 
                        id="firstName"
                        name="firstName"
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="middleName">
                        Middle Name
                      </label>
                      <input 
                        id="middleName"
                        name="middleName"
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2"
                        value={formData.middleName}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                      Last Name *
                    </label>
                    <input 
                      id="lastName"
                      name="lastName"
                      type="text" 
                      className="w-full border border-gray-300 rounded p-2"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email *
                    </label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      className="w-full border border-gray-300 rounded p-2"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="w-full border border-gray-300 rounded p-2"
                        value={formData.role || ""}
                        onChange={handleFormChange}
                      >
                        <option value="">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="facultyId">
                        Faculty
                      </label>
                      <select
                        id="facultyId"
                        name="facultyId"
                        className="w-full border border-gray-300 rounded p-2"
                        value={formData.facultyId || ""}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(faculty => (
                          <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imagePath">
                      Profile Image Link
                    </label>
                    <input 
                      id="imagePath"
                      name="imagePath"
                      type="text" 
                      className="w-full border border-gray-300 rounded p-2"
                      value={formData.imagePath}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                      Description
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      className="w-full border border-gray-300 rounded p-2 h-24"
                      value={formData.description}
                      onChange={handleFormChange}
                    />
                  </div>
                </form>
              </div>
              
              {/* Panel footer with action buttons */}
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button 
                  type="button"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                  onClick={handleClosePanel}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="bg-red-800 text-white px-4 py-2 rounded"
                >
                  {editingUser?.isNew ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Right Sidebar - Help Section */}
        <div className="w-1/4 p-4 border-l border-gray-200 hidden lg:block">
          {/* Help section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2">User Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              This panel allows you to manage all users in the system. You can add new users, update roles and faculties directly, or filter users by various criteria.
            </p>
            
            <h4 className="text-md font-semibold mb-2">Available Roles</h4>
            <ul className="list-disc pl-5 mb-4 text-sm text-gray-600">
              <li>Student - Default role for registered users</li>
              <li>Faculty - For university professors and lecturers</li>
              <li>Staff - For administrative personnel</li>
            </ul>
            
            <h4 className="text-md font-semibold mb-2">Quick Tips</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Use the search box to find users by name or email</li>
              <li>Change roles and faculties directly using the dropdown menus</li>
              <li>Click "ADD USER" to create a new user</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;