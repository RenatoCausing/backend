import React, { useState } from 'react';  
import AdviserNavbar from '../components/AdviserNavbar';
import SPFilterPanel from '../components/SPFilterPanel';
import SPEditPanel from '../components/SPEditPanel';
import Dashboard from '../components/Dashboard';
import UploadModal from '../components/UploadModal';  
import { useProjectContext } from '../contexts/ProjectContext';

const SPProjectView = () => {
  const {
    selectedProject,
    showDetailPanel,  
    showEditPanel,
    handleProjectSelect,
    closeDetailPanel,  
    openEditPanel,  
    closeEditPanel,
    updateProject,
     
    triggerDataRefresh  
  } = useProjectContext();

   
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

   
  const navbarHeight = 64;  

   
  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

   
   
  const handleCloseUploadModal = () => {
    console.log("Upload modal closing. Triggering SPFilterPanel refresh.");
    setIsUploadModalOpen(false);
     
    triggerDataRefresh();
  };

   
   
  const handleUploadSuccess = () => {
    console.log("Upload successful! Closing modal.");
     
    handleCloseUploadModal();  
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AdviserNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard - Left Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Dashboard />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Render the SPFilterPanel */}
          {/* Pass the function to open the modal to the SPFilterPanel's upload button */}
          <SPFilterPanel
            onSPSelect={handleProjectSelect}
            onUploadClick={handleOpenUploadModal}  
          />
        </div>
      </div>

      {/* Edit panel - completely separate from the flex layout */}
      {showEditPanel && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={closeEditPanel}>
          {/* Empty overlay div that closes the panel when clicked */}
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: `${navbarHeight}px`,  
          right: '0',
          bottom: '0',
          height: `calc(100vh - ${navbarHeight}px)`,  
          width: '400px',
          zIndex: 50,
          transform: showEditPanel ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out'
        }}
      >
        {selectedProject && (
          <SPEditPanel
            project={selectedProject}
            onClose={closeEditPanel}
            onSave={updateProject}
          />
        )}
      </div>

      {/* Render the UploadModal */}
      {/* Pass state and handlers to control the modal's visibility and handle success */}
      <UploadModal
        show={isUploadModalOpen}
        onClose={handleCloseUploadModal}  
        onUploadSuccess={handleUploadSuccess}  
      />
    </div>
  );
};

export default SPProjectView;
