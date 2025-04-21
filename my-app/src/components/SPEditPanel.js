import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/SPEditPanel.css';

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
    authors: [],
    studentIds: []
  });

  // Panel container ref for scroll management
  const panelContainerRef = useRef(null);
  
  // State for dropdown selections
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showAdviserSelector, setShowAdviserSelector] = useState(false);
  const [showAuthorSelector, setShowAuthorSelector] = useState(false);
  
  // State for available options
  const [availableTags, setAvailableTags] = useState([]);
  const [availableAdvisers, setAvailableAdvisers] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [adviserInput, setAdviserInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  
  // State for thumbnail handling
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  
  // Refs for closing dropdowns when clicking outside
  const tagSelectorRef = useRef(null);
  const adviserSelectorRef = useRef(null);
  const authorSelectorRef = useRef(null);
  
  // Extract Google Drive file ID from various URL formats
  const extractGoogleDriveFileId = (url) => {
    if (!url) return null;
    
    // Handle direct file IDs
    if (!url.includes('/') && !url.includes('drive.google.com')) {
      return url;
    }
    
    // Extract from standard Drive URLs
    const fileIdMatch = url.match(/\/d\/([^\/]+)/) || 
                       url.match(/id=([^&]+)/) ||
                       url.match(/file\/d\/([^\/]+)/);
                      
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    return null;
  };

  // Get Google Drive thumbnail URL
  const getGoogleDrivePreviewUrl = (driveUrl) => {
    const fileId = extractGoogleDriveFileId(driveUrl);
    if (!fileId) return null;
    
    // This returns a preview URL that can be used in an iframe
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };
  
  // Update form data whenever the project prop changes
  useEffect(() => {
    if (project) {
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
        authors: project.authors || [],
        studentIds: project.studentIds || []
      });
      setThumbnailFailed(false);
    }
  }, [project]);
  
  // Fetch advisers, tags, and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all advisers
        const adviserResponse = await axios.get('http://localhost:8080/api/advisers');
        setAvailableAdvisers(adviserResponse.data || []);
        
        // Fetch all tags
        const tagResponse = await axios.get('http://localhost:8080/api/tags');
        setAvailableTags(tagResponse.data || []);
        
        // Fetch all students
        const studentResponse = await axios.get('http://localhost:8080/api/students');
        setAvailableStudents(studentResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create updated project object with editable fields
    const updatedProjectData = {
      title: formData.title,
      year: formData.year ? parseInt(formData.year) : null,
      semester: formData.semester,
      abstractText: formData.abstractText,
      uri: formData.uri,
      documentPath: formData.documentPath,
      adviserId: formData.adviserId ? parseInt(formData.adviserId) : null,
      tagIds: formData.tagIds && formData.tagIds.length > 0 ? formData.tagIds : [],
      studentIds: formData.studentIds && formData.studentIds.length > 0 ? formData.studentIds : []
    };
    
    try {
      // Make the API call to update the project
      const response = await axios.put(
        'http://localhost:8080/api/sp/${project.spId}/update', 
        updatedProjectData
      );
      
      // Call the parent's onSave function with updated data
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const removeTag = (tagToRemove) => {
    const indexToRemove = formData.tags.indexOf(tagToRemove);
    if (indexToRemove !== -1) {
      const newTags = [...formData.tags];
      const newTagIds = [...formData.tagIds];
      
      newTags.splice(indexToRemove, 1);
      newTagIds.splice(indexToRemove, 1);
      
      setFormData(prevState => ({
        ...prevState,
        tags: newTags,
        tagIds: newTagIds
      }));
    }
  };
  
  const removeAuthor = (authorToRemove) => {
    const indexToRemove = formData.authors.indexOf(authorToRemove);
    if (indexToRemove !== -1) {
      const newAuthors = [...formData.authors];
      const newStudentIds = [...formData.studentIds];
      
      newAuthors.splice(indexToRemove, 1);
      newStudentIds.splice(indexToRemove, 1);
      
      setFormData(prevState => ({
        ...prevState,
        authors: newAuthors,
        studentIds: newStudentIds
      }));
    }
  };
  
  const addTag = (tag) => {
    if (!formData.tags.includes(tag.tagName)) {
      const newTags = [...formData.tags, tag.tagName];
      const newTagIds = [...formData.tagIds, tag.tagId];
      
      setFormData(prevState => ({
        ...prevState,
        tags: newTags,
        tagIds: newTagIds
      }));
    }
    setTagInput('');
    setShowTagSelector(false);
  };
  
  const addAuthor = (student) => {
    const authorName = `${student.lastName}${student.firstName ? ', ' + student.firstName : ''}`;
    if (!formData.authors.includes(authorName)) {
      const newAuthors = [...formData.authors, authorName];
      const newStudentIds = [...formData.studentIds, student.studentId];
      
      setFormData(prevState => ({
        ...prevState,
        authors: newAuthors,
        studentIds: newStudentIds
      }));
    }
    setAuthorInput('');
    setShowAuthorSelector(false);
  };
  
  const selectAdviser = (adviser) => {
    setFormData(prevState => ({
      ...prevState,
      adviserId: adviser.adminId,
      adviserName: `${adviser.lastName}${adviser.firstName ? ', ' + adviser.firstName : ''}`
    }));
    
    setAdviserInput('');
    setShowAdviserSelector(false);
  };

  // Filter advisers based on input
  const filteredAdvisers = availableAdvisers.filter(adviser => 
    adviser && adviser.lastName && 
    (adviser.lastName.toLowerCase().includes(adviserInput.toLowerCase()) ||
     (adviser.firstName && adviser.firstName.toLowerCase().includes(adviserInput.toLowerCase())))
  );
  
  // Filter tags based on input
  const filteredTags = availableTags.filter(tag => 
    tag && tag.tagName && 
    tag.tagName.toLowerCase().includes(tagInput.toLowerCase())
  );
  
  // Filter students based on input
  const filteredStudents = availableStudents.filter(student => 
    student && student.lastName && 
    (student.lastName.toLowerCase().includes(authorInput.toLowerCase()) ||
     (student.firstName && student.firstName.toLowerCase().includes(authorInput.toLowerCase())))
  );

  // Generate thumbnail URL for document
  const thumbnailUrl = getGoogleDrivePreviewUrl(formData.documentPath);

  return (
    <div className="panel-container">
      {/* Panel header - removed red styling */}
      <div className="panel-header plain-header">
        <h2 className="panel-title">Edit Project</h2>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close panel"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Panel content */}
      <div className="panel-content" ref={panelContainerRef}>
        {formData.documentPath && (
          <div className="document-thumbnail-container">
            {extractGoogleDriveFileId(formData.documentPath) ? (
              <iframe 
                src={getGoogleDrivePreviewUrl(formData.documentPath)}
                width="100%" 
                height="300" 
                title="Document Preview"
              ></iframe>
            ) : (
              <div className="document-thumbnail-placeholder">
                <p>No preview available. Check document link.</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Edit fields */}
          <div className="form-group">
            <label className="form-label required-field" htmlFor="title">
              Project Title
            </label>
            <input 
              id="title"
              name="title"
              type="text" 
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="year">
                Year
              </label>
              <input 
                id="year"
                name="year"
                type="text" 
                className="form-control"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="semester">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                className="form-control"
                value={formData.semester}
                onChange={handleChange}
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>
          
          {/* Authors Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="authors">
              Authors
            </label>
            <div className="dropdown-container" ref={authorSelectorRef}>
              <div className="dropdown-input-group">
                <input 
                  type="text" 
                  className="dropdown-input"
                  placeholder="Search for authors"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onClick={() => setShowAuthorSelector(true)}
                />
                <button 
                  type="button"
                  className="dropdown-button"
                  onClick={() => {
                    setFormData(prevState => ({
                      ...prevState,
                      authors: [],
                      studentIds: []
                    }));
                    setAuthorInput('');
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showAuthorSelector && (
                <div className="dropdown-menu shadow-md">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <div 
                        key={student.studentId} 
                        className="dropdown-item"
                        onClick={() => addAuthor(student)}
                      >
                        {student.lastName}{student.firstName && `, ${student.firstName}`}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item">No matching students</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="chips-container">
              {formData.authors.map((author, index) => (
                <div key={index} className="chip">
                  {author}
                  <button 
                    type="button"
                    className="chip-remove"
                    onClick={() => removeAuthor(author)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Adviser Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="adviser">
              Adviser
            </label>
            <div className="dropdown-container" ref={adviserSelectorRef}>
              <div className="dropdown-input-group">
                <input 
                  type="text" 
                  className="dropdown-input"
                  placeholder="Search for adviser"
                  value={adviserInput}
                  onChange={(e) => setAdviserInput(e.target.value)}
                  onClick={() => setShowAdviserSelector(true)}
                />
                <button 
                  type="button"
                  className="dropdown-button"
                  onClick={() => {
                    setFormData(prevState => ({
                      ...prevState,
                      adviserId: '',
                      adviserName: ''
                    }));
                    setAdviserInput('');
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showAdviserSelector && filteredAdvisers.length > 0 && (
                <div className="dropdown-menu shadow-md">
                  {filteredAdvisers.map(adviser => (
                    <div 
                      key={adviser.adminId} 
                      className="dropdown-item"
                      onClick={() => selectAdviser(adviser)}
                    >
                      {adviser.lastName}{adviser.firstName && `, ${adviser.firstName}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {formData.adviserName && (
              <div className="chips-container">
                <div className="chip">
                  {formData.adviserName}
                  <button 
                    type="button"
                    className="chip-remove"
                    onClick={() => {
                      setFormData(prevState => ({
                        ...prevState,
                        adviserId: '',
                        adviserName: ''
                      }));
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Abstract */}
          <div className="form-group">
            <label className="form-label" htmlFor="abstractText">
              Abstract
            </label>
            <textarea 
              id="abstractText"
              name="abstractText"
              className="form-control textarea"
              value={formData.abstractText}
              onChange={handleChange}
            />
          </div>
          
          {/* Tags Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="tags">
              Tags
            </label>
            <div className="dropdown-container" ref={tagSelectorRef}>
              <div className="dropdown-input-group">
                <input 
                  type="text" 
                  className="dropdown-input"
                  placeholder="Search for tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onClick={() => setShowTagSelector(true)}
                />
                <button 
                  type="button"
                  className="dropdown-button"
                  onClick={() => {
                    setFormData(prevState => ({
                      ...prevState,
                      tags: [],
                      tagIds: []
                    }));
                    setTagInput('');
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showTagSelector && (
                <div className="dropdown-menu shadow-md">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <div 
                        key={tag.tagId} 
                        className="dropdown-item"
                        onClick={() => addTag(tag)}
                      >
                        {tag.tagName}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item">No matching tags</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="chips-container">
              {formData.tags.map((tag, index) => (
                <div key={index} className="chip">
                  {tag}
                  <button 
                    type="button"
                    className="chip-remove"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Document Path field */}
          <div className="form-group">
            <label className="form-label" htmlFor="documentPath">
              PDF Link
            </label>
            <input 
              id="documentPath"
              name="documentPath"
              type="text" 
              className="form-control"
              value={formData.documentPath}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
      
      {/* Panel footer with action buttons */}
      <div className="panel-footer">
        <button 
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SPEditPanel;