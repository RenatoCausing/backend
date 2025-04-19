import React from 'react';
import AdviserNavbar from '../components/AdviserNavbar';
import SPFilterPanel from '../components/SPFilterPanel';
import SPEditPanel from '../components/SPEditPanel';
import Dashboard from '../components/Dashboard';
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
    updateProject
  } = useProjectContext();

  return (

    <body class="white-background">
    <div className="flex flex-col min-h-screen">
      <AdviserNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard - Left Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Dashboard />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <SPFilterPanel onSPSelect={handleProjectSelect} />
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
          top: '64px', /* Assuming navbar height is 64px (16rem) */
          right: '0',
          bottom: '0',
          height: '100vh',
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
    </div>
    </body>
  );
};

export default SPProjectView;