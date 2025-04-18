import React, { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export function useProjectContext() {
  return useContext(ProjectContext);
}

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  
  const handleProjectSelect = (project) => {
    console.log("Project selected in context:", project);
    setSelectedProject(project);
    
    if (project && project.editMode === true) {
      console.log("Opening edit panel via context - editMode is true");
      setShowDetailPanel(false);
      setShowEditPanel(true);
    } else {
      console.log("Opening detail panel via context - editMode is false or not set");
      setShowDetailPanel(true);
      setShowEditPanel(false);
    }
  };
  
  const closeDetailPanel = () => {
    setShowDetailPanel(false);
  };
  
  const openEditPanel = () => {
    if (selectedProject) {
      setShowDetailPanel(false);
      setShowEditPanel(true);
    }
  };
  
  const closeEditPanel = () => {
    setShowEditPanel(false);
  };
  
  const updateProject = (updatedProject) => {
    console.log("Project updated in context:", updatedProject);
    setSelectedProject(updatedProject);
    // In a real app, you would also update your data store/API here
  };
  
  const value = {
    selectedProject,
    showDetailPanel,
    showEditPanel,
    handleProjectSelect,
    closeDetailPanel,
    openEditPanel,
    closeEditPanel,
    updateProject
  };
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}