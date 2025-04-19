import React, { useState, useEffect, useRef } from 'react';

const SPEditPanel = ({ project, onClose, onSave }) => {
  // Initialize state with project data
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    semester: '',
    abstractText: '',
    uri: '',
    documentPath: '',
    dateIssued: '',
    uploadedBy: '',
    adviserId: '',
    author: '',
    adviserName: '',
    tags: [],
    tagIds: [],
    authors: []
  });

  // Panel container ref for scroll management
  const panelContainerRef = useRef(null);
  
  // State for dropdown selections
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showAdviserSelector, setShowAdviserSelector] = useState(false);
  const [showAuthorSelector, setShowAuthorSelector] = useState(false);
  const [showUploadedBySelector, setShowUploadedBySelector] = useState(false);
  
  // State for available options
  const [availableTags, setAvailableTags] = useState([
    { id: 1, name: "Research" },
    { id: 2, name: "Mobile" },
    { id: 3, name: "Web" },
    { id: 4, name: "Machine Learning" },
    { id: 5, name: "IoT" },
    { id: 6, name: "Database" },
    { id: 7, name: "Security" },
    { id: 8, name: "AI" },
    { id: 9, name: "Blockchain" }
    // You would fetch these from your API in a real implementation
  ]);
  
  const [availableAdvisers, setAvailableAdvisers] = useState([
    { adminId: 1, firstName: "John", lastName: "Smith" },
    { adminId: 2, firstName: "Maria", lastName: "Garcia" },
    { adminId: 3, firstName: "Robert", lastName: "Johnson" },
    { adminId: 4, firstName: "Sarah", lastName: "Lee" },
    { adminId: 5, firstName: "David", lastName: "Wong" }
    // Would be fetched from API
  ]);
  
  const [availableAuthors, setAvailableAuthors] = useState([
    { studentId: 1, firstName: "Alex", lastName: "Johnson" },
    { studentId: 2, firstName: "Mika", lastName: "Suzuki" },
    { studentId: 3, firstName: "Carlos", lastName: "Rodriguez" },
    { studentId: 4, firstName: "Elena", lastName: "Petrov" },
    { studentId: 5, firstName: "Omar", lastName: "Hassan" }
    // Would be fetched from API
  ]);
  
  const [availableUploaders, setAvailableUploaders] = useState([
    { id: 1, name: "Admin User" },
    { id: 2, name: "Library Staff" },
    { id: 3, name: "Department Secretary" }
    // Would be fetched from API
  ]);
  
  // Refs for closing dropdowns when clicking outside
  const tagSelectorRef = useRef(null);
  const adviserSelectorRef = useRef(null);
  const authorSelectorRef = useRef(null);
  const uploaderSelectorRef = useRef(null);
  
  // Update form data whenever the project prop changes
  useEffect(() => {
    if (project) {
      console.log("Project changed, updating form data:", project);
      setFormData({
        title: project.title || '',
        year: project.year || '',
        semester: project.semester || '',
        abstractText: project.abstractText || '',
        uri: project.uri || '',
        documentPath: project.documentPath || '',
        dateIssued: project.dateIssued || '',
        uploadedBy: project.uploadedBy || '',
        adviserId: project.adviserId || '',
        author: project.author || '',
        adviserName: project.adviserName || '',
        tags: project.tags || [],
        tagIds: project.tagIds || [],
        authors: project.authors || []
      });
    }
  }, [project]);
  
  // Set up click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagSelectorRef.current && !tagSelectorRef.current.contains(e.target)) {
        setShowTagSelector(false);
      }
      if (adviserSelectorRef.current && !adviserSelectorRef.current.contains(e.target)) {
        setShowAdviserSelector(false);
      }
      if (authorSelectorRef.current && !authorSelectorRef.current.contains(e.target)) {
        setShowAuthorSelector(false);
      }
      if (uploaderSelectorRef.current && !uploaderSelectorRef.current.contains(e.target)) {
        setShowUploadedBySelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  
  const removeTag = (tagToRemove) => {
    setFormData(prevState => ({
      ...prevState,
      tags: prevState.tags.filter(tag => tag !== tagToRemove),
      tagIds: prevState.tagIds.filter((_, index) => prevState.tags[index] !== tagToRemove)
    }));
  };
  
  const addTag = (tag) => {
    if (!formData.tags.includes(tag.name)) {
      setFormData(prevState => ({
        ...prevState,
        tags: [...prevState.tags, tag.name],
        tagIds: [...prevState.tagIds, tag.id]
      }));
    }
    // Don't auto-close tag selector to allow multiple additions
  };
  
  const selectAdviser = (adviser) => {
    setFormData(prevState => ({
      ...prevState,
      adviserId: adviser.adminId,
      adviserName: `${adviser.lastName}, ${adviser.firstName}`
    }));
    setShowAdviserSelector(false);
  };
  
  const selectAuthor = (author) => {
    // For simplicity, we're replacing the author string with the selected author
    // In a real implementation, this might manage an array of authors
    setFormData(prevState => ({
      ...prevState,
      author: `${author.lastName}, ${author.firstName}`
    }));
    setShowAuthorSelector(false);
  };
  
  const selectUploader = (uploader) => {
    setFormData(prevState => ({
      ...prevState,
      uploadedBy: uploader.name
    }));
    setShowUploadedBySelector(false);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative" ref={panelContainerRef}>
      {/* Panel header with minimal styling */}
      <div className="bg-red-800 text-white px-2 py-3 flex justify-between items-center sticky top-0 z-10">
        
        {/* Close button positioned to stick out like in the image */}
        <button 
          onClick={onClose}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-red-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 shadow-md"
          aria-label="Close panel"
        >
          <span className="text-xl font-bold">×</span>
        </button>
      </div>
      
      {/* Panel content - scrollable with extra space at bottom */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto overflow-x-hidden">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title*
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="year">
                Year
              </label>
              <input 
                id="year"
                name="year"
                type="text" 
                className="w-full border border-gray-300 rounded p-2"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="semester">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                className="w-full border border-gray-300 rounded p-2"
                value={formData.semester}
                onChange={handleChange}
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Midyear">Midyear</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="abstractText">
              Abstract
            </label>
            <textarea 
              id="abstractText"
              name="abstractText"
              className="w-full border border-gray-300 rounded p-2 h-32 max-w-full"
              value={formData.abstractText}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>
          
          <div className="relative" ref={authorSelectorRef}>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="author">
                Authors
              </label>
              <button 
                type="button" 
                className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                onClick={() => setShowAuthorSelector(!showAuthorSelector)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <input 
              id="author"
              name="author"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.author}
              onChange={handleChange}
              readOnly
              onClick={() => setShowAuthorSelector(!showAuthorSelector)}
              placeholder="Select authors"
            />
            
            {showAuthorSelector && (
              <div className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 font-medium text-sm">
                  Select Author
                </div>
                {availableAuthors.map((author) => (
                  <div 
                    key={author.studentId} 
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectAuthor(author)}
                  >
                    {author.lastName}, {author.firstName}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative" ref={adviserSelectorRef}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="adviserName">
                  Adviser
                </label>
                <button 
                  type="button" 
                  className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  onClick={() => setShowAdviserSelector(!showAdviserSelector)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <input 
                id="adviserName"
                name="adviserName"
                type="text" 
                className="w-full border border-gray-300 rounded p-2"
                value={formData.adviserName}
                onChange={handleChange}
                readOnly
                onClick={() => setShowAdviserSelector(!showAdviserSelector)}
                placeholder="Select adviser"
              />
              
              {showAdviserSelector && (
                <div className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 font-medium text-sm">
                    Select Adviser
                  </div>
                  {availableAdvisers.map((adviser) => (
                    <div 
                      key={adviser.adminId} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectAdviser(adviser)}
                    >
                      {adviser.lastName}, {adviser.firstName}
                    </div>
                  ))}
                </div>
              )}
              
              <input 
                id="adviserId"
                name="adviserId"
                type="hidden" 
                value={formData.adviserId}
              />
            </div>
            
            <div className="relative" ref={uploaderSelectorRef}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700" htmlFor="uploadedBy">
                  Uploaded By
                </label>
                <button 
                  type="button" 
                  className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  onClick={() => setShowUploadedBySelector(!showUploadedBySelector)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <input 
                id="uploadedBy"
                name="uploadedBy"
                type="text" 
                className="w-full border border-gray-300 rounded p-2"
                value={formData.uploadedBy}
                onChange={handleChange}
                readOnly
                onClick={() => setShowUploadedBySelector(!showUploadedBySelector)}
                placeholder="Select uploader"
              />
              
              {showUploadedBySelector && (
                <div className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 font-medium text-sm">
                    Select Uploader
                  </div>
                  {availableUploaders.map((uploader) => (
                    <div 
                      key={uploader.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectUploader(uploader)}
                    >
                      {uploader.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="uri">
              URI
            </label>
            <input 
              id="uri"
              name="uri"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.uri}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="documentPath">
              Document Path
            </label>
            <input 
              id="documentPath"
              name="documentPath"
              type="text" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.documentPath}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateIssued">
              Date Issued
            </label>
            <input 
              id="dateIssued"
              name="dateIssued"
              type="date" 
              className="w-full border border-gray-300 rounded p-2"
              value={formData.dateIssued}
              onChange={handleChange}
            />
          </div>
          
          <div className="relative" ref={tagSelectorRef}>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <button 
                type="button" 
                className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                onClick={() => setShowTagSelector(!showTagSelector)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags && formData.tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center">
                  {tag}
                  <span 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
            
            {/* Tag selector dropdown */}
            {showTagSelector && (
              <div className="absolute z-10 w-full p-2 border border-gray-300 rounded bg-white shadow-md max-h-48 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Select tags to add:</h4>
                {availableTags.filter(tag => !formData.tags.includes(tag.name)).map(tag => (
                  <div key={tag.id} className="flex items-center p-1 hover:bg-gray-100 cursor-pointer" onClick={() => addTag(tag)}>
                    <span className="text-sm">{tag.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Panel footer - kept inside form for better UX */}
          <div className="border-t border-gray-200 pt-4 flex justify-between mt-8">
            <button 
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-700"
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