import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../contexts/UserManagementContext';
import '../styles/SPFilterSystem.css'; // Using the same CSS file as SPFilterPanel

// Import Pagination and Select/FormControl/InputLabel from MUI
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
// You might also need InputLabel if you use it with FormControl for the Select
// import InputLabel from '@mui/material/InputLabel';


const UserManagementPanel = () => {
  const {
    faculties,
    filteredUsers, // We will paginate this list
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
    fetchUsers,
    handleFacultyChange,
    handleRoleChange,
    handleSearchChange, // Note: handleSearchChange from context is not directly used in the input onChange below, only setSearchTerm. Ensure your context handles search filtering on searchTerm change or form submit appropriately.
    handleSearch, // This is for the form submit, which should trigger filtering based on debounced searchTerm.
    handleAddUser,
    handleEditUser, // This should likely be used to open the edit panel with the user data
    handleFormChange,
    handleSubmit,
    handleClosePanel, // This handles closing both edit panel and delete confirm modal
    handleConfirmDelete, // This should set userToDelete and showDeleteConfirm
    handleDeleteUser, // This performs the actual deletion after confirmation
    handleUserRoleChange,
    handleUserFacultyChange,
    getImagePreviewUrl,
    handleImageError,
    formatFullName,
    getRoleDisplayName,
    getFacultyName,
    setSearchTerm, // Used directly in input onChange
  } = useUserContext();

  // --- Pagination State and Logic ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default items per page

  // Ensure filteredUsers is an array before calculating length
  const totalItems = filteredUsers ? filteredUsers.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Ensure filteredUsers is an array before slicing
  const currentItems = filteredUsers && Array.isArray(filteredUsers)
    ? filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
    : [];


  // --- Pagination Handlers ---
  const handlePageChange = (event, value) => {
    setCurrentPage(value); // value is the 1-indexed page number from Pagination
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page when rows per page changes
  };

  // Fetch users when the component mounts (and potentially when dependencies in useUserContext trigger fetchUsers)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Dependency includes fetchUsers from context

  // Reset pagination when filters change and filteredUsers is updated
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers]); // Reset page when the filtered list changes


  return (
    <div className="sp-filter-panel-container">
      <div className="flex w-full max-w-6xl mx-auto" style={{backgroundColor: 'white'}}>

        {/* Right Panel - Users List (Occupies the main content area) */}
        <div className="w-34 p-4" style={{backgroundColor: 'white'}}>
          {/* Search and Filter Row */}
          <div className="mb-4">
            {/* Note: Search filtering is likely handled by the useUserContext hook
                triggering an update to filteredUsers when searchTerm, selectedRole, or selectedFaculty changes.
                The form onSubmit here can be kept, but ensure it doesn't interfere with the context's filtering.
            */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-9">
              {/* Add User Button */}
              <button
                type="button"
                className="bg-red-800 text-white rounded p-2 flex items-center justify-center gap-1"
                onClick={handleAddUser}
              >
                <i className="fa fa-plus"></i> ADD USER
              </button>

              {/* Role filter dropdown - Always visible */}
              {/* Consider replacing with MUI Select/FormControl if migrating styling */}
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

              {/* Faculty filter dropdown - Only visible when Role filter is 'Faculty' */}
              {selectedRole === 'faculty' && (
                 /* Consider replacing with MUI Select/FormControl if migrating styling */
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
              )}

              {/* Search input and button */}
              <div className="flex flex-1">
                 {/* Consider replacing with MUI TextField if migrating styling */}
                <input
                  type="text"
                  placeholder="Search users"
                  className="flex-1 border border-gray-300 rounded-l p-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Assuming setSearchTerm triggers filtering in context
                />
                 {/* Consider replacing with MUI Button if migrating styling */}
                <button
                  type="submit"
                  className="bg-red-800 text-white px-4 rounded-r"
                >
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </form>

            {/* Search Results Message */}
            {searchResults && (
              <div className="bg-green-100 p-3 rounded">
                Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
              </div>
            )}
          </div>

          {/* --- Custom Pagination using MUI Pagination and Select (Top) --- */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', width: '100%', margin: '20px 0' }}>
             {/* Placeholder or alignment div */}
              <div style={{ width: '33%', flexShrink: 0, display: 'none', md: 'block' }}></div> {/* Hide on small screens */}
              <div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '0 16px', 
  width: '100%',
  margin: '10px 0',
}}>
  
  <div style={{ width: '150px' }}></div>
            {/* Pagination Numbers (Center/Bottom) */}
             {totalPages > 1 && ( // Only show pagination if more than 1 page
               <Pagination
                 count={totalPages}
                 page={currentPage}
                 onChange={handlePageChange}
                 size="medium"
                 shape="rounded"
                 color="primary"
                 sx={{
                   '& .MuiPaginationItem-root': {
                     color: '#333',
                     borderColor: '#e4e4e4',
                   },
                   '& .Mui-selected': {
                     backgroundColor: '#800000 !important', // Customize the selected color
                     color: '#fff',
                   }
                 }}
               />
             )}

              {/* Rows per page control with label (Right/Bottom) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                  Show rows:
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}> {/* Adjusted minWidth */}
                  <Select
                    id="rows-per-page-select"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </div>
           </div>
           </div>
          {/* --- End Custom Pagination (Top) --- */}


          {/* Loading and Error States */}
          {loading && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}

          {/* User Results List - Map through currentItems */}
          <div style={{width: '100%'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {/* No Results Found Message */}
            {!loading && filteredUsers && filteredUsers.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No users found. Try adjusting your filters.
              </div>
            )}

            {/* Map through currentItems for the current page */}
            {currentItems.map((user, index) => (
              <div key={user.adminId} className="relative">
                <div className="mb-6">
                  {/* Header with user name and action buttons */}
                  <div className="flex mb-2">
                    <h3 className="text-lg font-semibold flex-1">
                      {formatFullName(user)}
                    </h3>

                    {/* Action buttons aligned to the right */}
                    <div className="flex ml-auto gap-3">
                      {/* Role selection dropdown for individual user - Always visible */}
                      {/* Consider replacing with MUI Select/FormControl if migrating styling */}
                      <select
                        className="border border-gray-300 rounded p-1 text-dm mr-2"
                        value={user.role || ""}
                        onChange={(e) => handleUserRoleChange(user, e.target.value)}
                      >
                        <option value="">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                      </select>

                      {/* Faculty selection dropdown for individual user - Only visible if user's role is 'faculty' */}
                      {user.role === 'faculty' && (
                         /* Consider replacing with MUI Select/FormControl if migrating styling */
                        <select
                          className="border border-gray-300 rounded p-1 text-dm mr-2"
                          value={user.facultyId || ""}
                          onChange={(e) => handleUserFacultyChange(user, e.target.value)}
                        >
                          <option value="">No Faculty</option>
                          {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                          ))}
                        </select>
                      )}

                       {/* Edit Button */}
                       {/* Consider replacing with MUI IconButton if migrating styling */}
                       <button
                         onClick={() => handleEditUser(user)} // Assuming this function exists in your context
                         className="text-gray-500 hover:text-gray-700 p-2"
                         aria-label="Edit user"
                       >
                         <i className="fa-solid fa-pen"></i>
                       </button>
                       {/* Delete Button */}
                       {/* Consider replacing with MUI IconButton if migrating styling */}
                       <button
                         onClick={() => handleConfirmDelete(user)} // Assuming this sets userToDelete and shows the modal
                         className="text-red-600 hover:text-red-800 p-2"
                         aria-label="Delete user"
                       >
                         <i className="fa fa-trash"></i>
                       </button>

                    </div>
                  </div>

                  {/* User info display (email, role, faculty) */}
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4"><i className="fa-solid fa-envelope"></i> {user.email || 'No email'}</span>
                    <span className="mr-4"><i className="fa-solid fa-user-tag"></i> {getRoleDisplayName(user.role)}</span>
                    {user.role === 'faculty' && (
                        <span><i className="fa-solid fa-building"></i> {getFacultyName(user.facultyId)}</span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-sm mb-3">{user.description || 'No description available.'}</div>
                </div>

                {/* Divider between users (except the last one on the current page) */}
                {index < currentItems.length - 1 && (
                  <div
                    className="sp-divider"
                    style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* --- Custom Pagination using MUI Pagination and Select (Bottom) --- */}
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', width: '100%', margin: '20px 0' }}>
             {/* Placeholder or alignment div */}
              <div style={{ width: '33%', flexShrink: 0, display: 'none', md: 'block' }}></div> {/* Hide on small screens */}
              <div style={{ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '0 16px', 
  width: '100%',
  margin: '10px 0',
}}>
  
  <div style={{ width: '150px' }}></div>
            {/* Pagination Numbers (Center/Bottom) */}
             {totalPages > 1 && ( // Only show pagination if more than 1 page
               <Pagination
                 count={totalPages}
                 page={currentPage}
                 onChange={handlePageChange}
                 size="medium"
                 shape="rounded"
                 color="primary"
                 sx={{
                   '& .MuiPaginationItem-root': {
                     color: '#333',
                     borderColor: '#e4e4e4',
                   },
                   '& .Mui-selected': {
                     backgroundColor: '#800000 !important', // Customize the selected color
                     color: '#fff',
                   }
                 }}
               />
             )}

              {/* Rows per page control with label (Right/Bottom) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                  Show rows:
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}> {/* Adjusted minWidth */}
                  <Select
                    id="rows-per-page-select"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </div>
           </div>
           </div>
          {/* --- End Custom Pagination (Bottom) --- */}

        </div>

         {/* Edit Panel (Slide in from right) - Keep outside the main flex layout for fixed positioning */}
         {showEditPanel && (
           <div className="panel-container fixed inset-y-0 right-0 max-w-md w-full"
                style={{
                 transform: showEditPanel ? 'translateX(0)' : 'translateX(100%)',
                 transition: 'transform 0.3s ease-in-out'
                }}>
             {/* Panel header */}
             <div className="panel-header plain-header">
               <h2 className="panel-title">
                 {editingUser?.isNew ? 'Add New User' : 'Edit User'}
               </h2>
               <button
                 onClick={handleClosePanel}
                 className="close-button"
                 aria-label="Close panel"
               >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
             </div>

             {/* Panel content (Edit Form) */}
             <div className="panel-content">
                 {/* Image Preview */}
                {formData.imagePath && (
                  <div className="document-thumbnail-container">
                    {!imagePreviewFailed ? (
                      <img
                        src={getImagePreviewUrl(formData.imagePath)}
                        alt="Profile"
                        className="document-thumbnail"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="document-thumbnail-placeholder">
                        <p>No preview available. Check image URL.</p>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Form fields - Consider replacing with MUI TextField, Select, etc. */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required-field" htmlFor="firstName">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="middleName">
                        Middle Name
                      </label>
                      <input
                        id="middleName"
                        name="middleName"
                        type="text"
                        className="form-control"
                        value={formData.middleName}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required-field" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required-field" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="role">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="form-control"
                        value={formData.role || ""}
                        onChange={handleFormChange}
                      >
                        <option value="">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>

                    {/* Faculty dropdown in Edit Panel - Only visible if the role in the form data is 'faculty' */}
                    {formData.role === 'faculty' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="facultyId">
                          Faculty
                        </label>
                        <select
                          id="facultyId"
                          name="facultyId"
                          className="form-control"
                          value={formData.facultyId || ""}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map(faculty => (
                            <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="imagePath">
                      Profile Image Link
                    </label>
                    <input
                      id="imagePath"
                      name="imagePath"
                      type="text"
                      className="form-control"
                      value={formData.imagePath}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control textarea"
                      value={formData.description}
                      onChange={handleFormChange}
                    />
                  </div>
                </form>
             </div>

             {/* Panel footer */}
             <div className="panel-footer">
               <button
                 type="button"
                 className="btn btn-secondary"
                 onClick={handleClosePanel}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 onClick={handleSubmit}
                 className="btn btn-primary"
               >
                 {editingUser?.isNew ? 'Create User' : 'Save Changes'}
               </button>
             </div>
           </div>
         )}

         {/* Delete Confirmation Modal - Keep outside the main flex layout */}
         {showDeleteConfirm && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
               <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
               <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>

               <div className="flex justify-end gap-2">
                 <button
                   className="btn btn-secondary"
                   onClick={() => handleClosePanel()} // Assuming handleClosePanel also handles closing the modal
                 >
                   Cancel
                 </button>
                 <button
                   className="btn btn-primary"
                   onClick={handleDeleteUser} // This should perform the deletion and close the modal
                 >
                   Delete
                 </button>
               </div>

                {/* This div seems unnecessary based on the layout structure */}
               <div className="w-14 p-4 hidden-layout-panel" style={{backgroundColor: 'white'}}>
                {/* You can optionally add a placeholder div or comment here */}
              </div>
             </div>
           </div>
         )}

      </div>
    </div>
  );
};

export default UserManagementPanel;