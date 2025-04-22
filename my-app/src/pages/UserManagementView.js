import React, { useEffect } from 'react';
import { UserManagementProvider, useUserContext } from '../contexts/UserManagementContext';
import UserManagementPanel from '../components/UserManagementPanel';
import Dashboard from '../components/Dashboard';
import AdviserNavbar from '../components/AdviserNavbar';

// This component will be wrapped by the provider
const UserManagementContent = () => {
  const { fetchUsers } = useUserContext();
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return <UserManagementPanel />;
};

// Main component that provides the context
const UserManagementView = () => {
  // Get navbar height - using the same value as SPProjectView

  return (
    <UserManagementProvider>
      <div className="flex flex-col min-h-screen">
        <AdviserNavbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Dashboard - Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Dashboard />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <UserManagementContent />
          </div>
        </div>
      </div>
    </UserManagementProvider>
  );
};

export default UserManagementView;