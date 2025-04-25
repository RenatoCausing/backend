import React, { useState } from 'react'; // Import useState
import AdviserNavbar from '../components/AdviserNavbar';
import SPFilterPanel from '../components/SPFilterPanel';
import SPEditPanel from '../components/SPEditPanel';
import Dashboard from '../components/Dashboard';
import UploadModal from '../components/UploadModal'; // Import the UploadModal
import { useProjectContext } from '../contexts/ProjectContext';

const SPProjectView = () => {
  const {
    selectedProject,
    showDetailPanel, // Assuming you might use this for a detail panel later
    showEditPanel,
    handleProjectSelect,
    closeDetailPanel, // Assuming for a detail panel
    openEditPanel, // Assuming for an edit panel
    closeEditPanel,
    updateProject,
    // *** CORRECTED: Get triggerDataRefresh from your context ***
    triggerDataRefresh // Import the function to trigger refresh
  } = useProjectContext();

  // State to manage the visibility of the UploadModal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Get navbar height - you can adjust this value to match your actual navbar height
  const navbarHeight = 64; // height in pixels

  // Function to open the upload modal
  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  // Function to close the upload modal
  // *** MODIFIED: This function now calls triggerDataRefresh ***
  const handleCloseUploadModal = () => {
    console.log("Upload modal closing. Triggering SPFilterPanel refresh.");
    setIsUploadModalOpen(false);
    // *** Call the triggerDataRefresh function from the context ***
    triggerDataRefresh();
  };

  // Function called by UploadModal when upload is successful
  // This function will now only close the modal, as refresh is handled by handleCloseUploadModal
  const handleUploadSuccess = () => {
    console.log("Upload successful! Closing modal.");
    // The refresh is now handled by handleCloseUploadModal when the modal state changes
    handleCloseUploadModal(); // This will also trigger the refresh
  };


  return (
    <div className="flex flex-col min-h-screen" style={{ marginTop: "20px" }}>
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
            onUploadClick={handleOpenUploadModal} // Pass the function to open the modal
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
          top: `${navbarHeight}px`, // Use the navbar height variable
          right: '0',
          bottom: '0',
          height: `calc(100vh - ${navbarHeight}px)`, // Calculate remaining height
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
        onClose={handleCloseUploadModal} // Pass the close handler (which now triggers refresh)
        onUploadSuccess={handleUploadSuccess} // Still pass success handler, but it just closes the modal
      />
    </div>
  );
};

export default SPProjectView;
