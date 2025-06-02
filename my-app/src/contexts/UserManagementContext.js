import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

 
const UserContext = createContext();

 
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserManagementProvider');
  }
  return context;
};

export const UserManagementProvider = ({ children }) => {
   
  const [faculties, setFaculties] = useState([
    { id: 1, name: 'BSBC' },
    { id: 2, name: 'BSCS' },
    { id: 3, name: 'BSAP' }
  ]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);

   
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

   
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

   
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

   
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

   
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
       
      const response = await axios.get('http://localhost:8080/api/advisers/users/all');
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

   
  useEffect(() => {
    if (users.length > 0) {
      let results = [...users];

       
      if (selectedFaculty) {
        results = results.filter(user =>
          user.facultyId === parseInt(selectedFaculty)
        );
      }

       
      if (selectedRole) {
        if (selectedRole === 'student') {
           
          results = results.filter(user => !user.role || user.role === '');
        } else {
          results = results.filter(user => user.role === selectedRole);
        }
      }

       
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
        
       setFilteredUsers([]);
       setSearchResults(null);
    }
  }, [selectedFaculty, selectedRole, debouncedSearchTerm, users]);

   
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

   
  const handleRoleChange = useCallback((e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);

     
    if (newRole !== 'faculty') {
      setSelectedFaculty('');  
    }
  }, [setSelectedRole, setSelectedFaculty]);  


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
    setFormData({ ...newUser });  
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

     
    const dataToSend = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
       
      role: formData.role === '' ? null : formData.role,
       
      facultyId: formData.facultyId === '' ? null : parseInt(formData.facultyId),
      imagePath: formData.imagePath,
      description: formData.description
    };


    try {
      let response;
      if (editingUser.isNew) {
         
        response = await axios.post(
          'http://localhost:8080/api/advisers/admin/create',
          dataToSend  
        );
         
         
        setUsers(prevUsers => [...prevUsers, response.data]);

      } else {
         
        response = await axios.put(
          `http://localhost:8080/api/advisers/admin/${editingUser.adminId}/update`,
          dataToSend  
        );
         
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.adminId === editingUser.adminId ? response.data : user  
          )
        );
      }

       
      setShowEditPanel(false);
      setEditingUser(null);
       
       
      setError(null);  
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Failed to save user. Please check the data and try again.");
       
    }
  };


  const handleClosePanel = () => {
    setShowEditPanel(false);
    setEditingUser(null);
     
    setFormData({
      firstName: '', middleName: '', lastName: '', email: '',
      role: '', facultyId: '', imagePath: '', description: ''
    });
    setImagePreviewFailed(false);  
     
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

       
      setUsers(prevUsers => prevUsers.filter(user => user.adminId !== userToDelete));

       
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setError(null);  

    } catch (error) {
      console.error("Error deleting user:", error);
       
      if (error.response && error.response.data) {
        setError(`Failed to delete user: ${error.response.data}`);
      } else {
        setError("Failed to delete user. It might be associated with other data.");
      }
      setShowDeleteConfirm(false);  
    }
  };

 
  const handleUserRoleChange = async (user, newRole) => {
    try {
       
      const updatedUser = { 
        ...user, 
        role: newRole === '' ? null : newRole,
         
        facultyId: (user.role === 'faculty' && newRole !== 'faculty') ? null : user.facultyId || null
      };

       
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser  
      );

       
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
        facultyId: newFacultyId === '' ? null : parseInt(newFacultyId)
      };

       
      const response = await axios.put(
        `http://localhost:8080/api/advisers/admin/${user.adminId}/update`,
        updatedUser  
      );

       
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

     
    if (!url.includes('/') && !url.includes('drive.google.com')) {
      return url;
    }

     
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
    setSearchTerm,
     
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};