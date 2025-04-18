import React, { useState, useEffect } from 'react';

const SPEditPanel = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    abstractText: project?.abstractText || '',
    author: project?.author || '',
    adviserName: project?.adviserName || '',
    tags: project?.tags || []
  });
  
  // Log when the component renders
  useEffect(() => {
    console.log("SPEditPanel rendered with project:", project);
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving project with data:", formData);
    
    // Create updated project object
    const updatedProject = {
      ...project,
      ...formData
    };
    
    // Call the parent's onSave function
    onSave(updatedProject);
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white"> {/* Added explicit bg-white */}
      {/* Panel header */}
      <div className="bg-red-800 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Edit Project</h2>
        <div className="flex space-x-2">
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Panel content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title
            </label>
            <input 
              id="title"
              name="title"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="abstractText">
              Abstract
            </label>
            <textarea 
              id="abstractText"
              name="abstractText"
              className="w-full border border-gray-300 rounded p-2 h-32"
              value={formData.abstractText}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="author">
              Authors
            </label>
            <input 
              id="author"
              name="author"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.author}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="adviserName">
              Adviser
            </label>
            <input 
              id="adviserName"
              name="adviserName"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.adviserName}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags && formData.tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Tag management will be implemented in a future update.
            </p>
          </div>
          
          {/* Panel footer - kept inside form for better UX */}
          <div className="border-t border-gray-200 pt-4 flex justify-end space-x-2 mt-4">
            <button 
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SPEditPanel;