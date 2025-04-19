import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
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
  
// Update the updateProject function in your ProjectProvider
const updateProject = async (updatedProject) => {
  try {
    console.log("Updating project in context:", updatedProject);
    
    // Make API call to update the project in the backend
    const response = await axios.put(
      `http://localhost:8080/api/sp/${updatedProject.spId}/update`,
      updatedProject
    );
    
    console.log("Project updated successfully:", response.data);
    setSelectedProject(response.data);
    
    // Close the edit panel and show the detail panel with updated data
    setShowEditPanel(false);
    setShowDetailPanel(true);
  } catch (error) {
    console.error("Error updating project:", error);
    alert("Failed to update project. Please try again.");
  }
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