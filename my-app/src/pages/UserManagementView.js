import React, { useEffect } from 'react';
import UserManagementPanel from '../components/UserManagementPanel';
import { useUserContext } from '../contexts/UserManagementContext';

const UserManagementView = () => {
  const { 
    fetchUsers, 
    showEditPanel, 
    handleClosePanel, 
    editingUser,
    loading,
    error
  } = useUserContext();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <UserManagementPanel />
      </div>
    </div>
  );
};

export default UserManagementView;