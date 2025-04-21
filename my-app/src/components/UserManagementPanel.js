import React, { useEffect } from 'react';
import { useUserContext } from '../contexts/UserManagementContext'; // Adjust this path as needed
import '../styles/UserManagementPanel.css';

const UserManagementPanel = () => {
  const {
    // State values
    faculties,
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
    
    // Functions
    fetchUsers,
    handleFacultyChange,
    handleRoleChange,
    handleSearchChange,
    handleSearch,
    handleAddUser,
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
  } = useUserContext();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="user-management-container">
    <div className="flex w-full max-w-6xl mx-auto" style={{backgroundColor: 'white'}}>
      {/* Central User Results Container */}
      <div className="w-34 p-4" style={{backgroundColor: 'white'}}>
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
              <div className="flex-1 p-4 overflow-y-auto">
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
                    handleClosePanel();
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
      </div>
    </div>
  );
};

export default UserManagementPanel;