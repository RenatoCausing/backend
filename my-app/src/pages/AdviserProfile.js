import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdviserNavbar from '../components/AdviserNavbar';
import { Link } from 'react-router-dom';
import '../styles/AdviserProfile.css';
import { useUser } from '../contexts/UserContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function AdviserProfile() {
  const { adviserId } = useParams();
  const { currentUser, isAuthenticated } = useUser();
  const [adviser, setAdviser] = useState(null);
  const [adviserSPs, setAdviserSPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableDescription, setEditableDescription] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '' // 'success', 'error', or 'info'
  });
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  // Show notification with auto-dismiss
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification({
        show: false,
        message: '',
        type: ''
      });
    }, 5000);
  };

  useEffect(() => {
    // Fetch adviser details
    fetch(`${BACKEND_URL}/api/advisers/${adviserId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Adviser data:', data);
        setAdviser(data);
        setEditableDescription(data.description || '');
        
        // Check if current user is the owner of this profile
        if (isAuthenticated && currentUser && data.email === currentUser.email && currentUser.role == "faculty") {
          setIsOwner(true);
        }
      })
      .catch(error => {
        console.error('Error fetching adviser details:', error);
        // Set default data for testing
        const defaultData = {
          adminId: adviserId,
          firstName: 'John',
          lastName: 'Pork',
          middleName: '',
          facultyId: 1,
          email: 'john.pork@up.edu.ph',
          imagePath: 'https://via.placeholder.com/150?text=JP',
          description: 'Dr. John Pork is a faculty member specializing in computer science research.'
        };
        
        setAdviser(defaultData);
        setEditableDescription(defaultData.description || '');
        
        // Check if current user is the owner of this profile even in test mode
        if (isAuthenticated && currentUser && defaultData.email === currentUser.email) {
          setIsOwner(true);
        }
      });

    // Fetch SPs from this adviser
    fetch(`${BACKEND_URL}/api/sp/adviser/${adviserId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Adviser SPs data:', data);
        setAdviserSPs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching adviser SPs:', error);
        // Sample data for testing
        setAdviserSPs([
          {
            spId: 101,
            title: "Blockchain Security Applications for Smart Contracts",
            year: 2025,
            semester: "1st",
            abstractText: "A comprehensive study on blockchain security mechanisms",
            viewCount: 42,
            tags: ["Blockchain", "Cybersecurity", "Smart Contracts"]
          },
          {
            spId: 102,
            title: "AI-Powered Disaster Response Systems",
            year: 2024,
            semester: "2nd",
            abstractText: "Using artificial intelligence to improve emergency response times",
            viewCount: 38,
            tags: ["AI", "Emergency Response", "Machine Learning"]
          },
          {
            spId: 103,
            title: "Quantum Computing Applications in Cryptography",
            year: 2024,
            semester: "Summer",
            abstractText: "Exploring how quantum computing will change modern encryption",
            viewCount: 27,
            tags: ["Quantum Computing", "Cryptography", "Information Security"]
          }
        ]);
        setLoading(false);
      });
  }, [adviserId, isAuthenticated, currentUser]);

  // Toggle editing mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // When entering edit mode, set editable description to current description
      setEditableDescription(adviser.description || '');
    }
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setEditableDescription(e.target.value);
  };

  // Save description to backend
  const saveDescription = () => {
    fetch(`${BACKEND_URL}/api/advisers/${adviserId}/description`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: editableDescription }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Updated adviser data:', data);
        setAdviser({...adviser, description: editableDescription});
        setIsEditing(false);
        // Show success notification
        showNotification("Profile description updated successfully!", "success");
      })
      .catch(error => {
        console.error('Error updating adviser description:', error);
        // Revert to previous description on error
        setEditableDescription(adviser.description || '');
        setIsEditing(false);
        // Show error notification
        showNotification("Failed to update profile description. Please try again.", "error");
      });
  };

  // Handle profile image update
  const updateProfileImage = () => {
    if (!isOwner || !currentUser) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      showNotification("You must be logged in to update your profile image.", "error");
      return;
    }
    
    // Show loading notification
    showNotification("Updating profile image...", "info");
    
    // Since the image is already in the currentUser object, we can use it directly
    // The backend already has the proper Google profile image from OAuth
    fetch(`${BACKEND_URL}/api/advisers/${adviserId}/image`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        adminId: currentUser.adminId,
        // Use the image path from the current user context that was set during OAuth
        imagePath: currentUser.imagePath 
      }),
      credentials: 'include' // Include credentials for authentication
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Updated adviser image:', data);
        // Update the local state with the image from currentUser
        setAdviser({...adviser, imagePath: currentUser.imagePath});
        // Show success notification
        showNotification("Profile image updated successfully to current google avatar!", "success");
      })
      .catch(error => {
        console.error('Error updating adviser image:', error);
        // Show error notification
        showNotification("Failed to update profile image. Please try again.", "error");
      });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditableDescription(adviser.description || '');
    setIsEditing(false);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate pagination values
  const totalItems = adviserSPs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = adviserSPs.slice(indexOfFirstItem, indexOfLastItem);

  // Loading state
  if (loading || !adviser) {
    return (
      <div>
        <AdviserNavbar />
        <div className="Acontainer">
          <div className="loading">Loading adviser profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="adviser-profile-page">
      <AdviserNavbar />
      
      <div className="Acontainer">
        {/* Notification Component */}
        {notification.show && (
          <div className={`
            p-3 rounded mb-4
            ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 
              notification.type === 'error' ? 'bg-red-100 text-red-700' : 
              'bg-blue-100 text-blue-700'}
          `}>
            {notification.message}
          </div>
        )}
        
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-title-section">
              <h1>{adviser.firstName} {adviser.lastName}</h1>
              {isOwner && (
                <button 
                  className="edit-toggle-button" 
                  onClick={toggleEditMode} 
                  title={isEditing ? "Cancel editing" : "Edit profile"}
                >
                  {isEditing ? <CancelIcon /> : <EditIcon />}
                </button>
              )}
            </div>
            <p className="email">{adviser.email || 'No email available'}</p>
            
            <div className="bio">
              {isEditing ? (
                <div className="edit-description-container">
                  <textarea
                    className="edit-description-textarea"
                    value={editableDescription}
                    onChange={handleDescriptionChange}
                    rows={6}
                  />
                  <div className="edit-buttons">
                    <button onClick={saveDescription} className="save-button">
                      <SaveIcon /> Save
                    </button>
                    <button onClick={cancelEditing} className="cancel-button">
                      <CancelIcon /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{adviser.description || 
                  `Dr. ${adviser.firstName} ${adviser.lastName}, PhD in Yapping - The undisputed legend of SPIS, 
                  Dr. ${adviser.lastName} has advised more projects than there are stars in the 
                  galaxy (or at least, that's what it feels like). With a coffee in one 
                  hand and 10 tabs of research papers open at all times, this 
                  adviser turns struggling ideas into award-winning theses. If you 
                  survive their feedback sessions, congratulations—you've 
                  officially leveled up in academia. ✅`
                }</p>
              )}
            </div>
          </div>
          
          <div className="profile-image">
            {isOwner ? (
              <div 
                className={`profile-image-container ${isEditing ? 'clickable' : ''}`}
                onClick={isEditing ? updateProfileImage : undefined}
                style={isEditing ? { cursor: 'pointer' } : {}}
                title={isEditing ? "Click to update with your Google profile image" : ""}
              >
                <img 
                  src={adviser.imagePath || 'https://via.placeholder.com/150'} 
                  alt={`${adviser.firstName} ${adviser.lastName}`}
                  className="profile-img"
                />
                {isEditing && (
                  <div className="image-edit-overlay">
                    <EditIcon />
                  </div>
                )}
              </div>
            ) : (
              <img 
                src={adviser.imagePath || 'https://via.placeholder.com/150'} 
                alt={`${adviser.firstName} ${adviser.lastName}`}
                className="profile-img"
              />
            )}
          </div>
        </div>
        
        <div className="special-projects-section">
          <div className="section-header">
            <h2>Special Projects Advised</h2>
          </div>
          
          {/* Top Pagination Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0 16px', 
            width: '100%',
            margin: '10px 0',
          }}>
            <div style={{ width: '150px' }}></div>
            {/* Pagination Numbers */}
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size="medium"
                shape="rounded"
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#333',
                    borderColor: '#e4e4e4',
                  },
                  '& .Mui-selected': {
                    backgroundColor: '#800000 !important',
                    color: '#fff',
                  }
                }}
              />
            )}

            {/* Rows per page control with label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                Show rows:
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
                <Select
                  id="rows-per-page-select"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          
          {/* Top divider */}
          <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)', margin: '10px 0'}}></div>
          
          {/* Project Cards Container */}
          <div className="project-cards-container">
            {currentItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No special projects found for this adviser.
              </div>
            ) : (
              currentItems.map((sp, index) => (
                <div key={sp.spId} className="relative">
                  <Link to={`/project/${sp.spId}`} className="project-card-link">
                    <div className="project-card">
                      <h3>{sp.title}</h3>
                      <div className="view-count">
                        <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {sp.viewCount}
                      </div>
                      <p className="project-details">Year: {sp.year}, Semester: {sp.semester}</p>
                      <div className="project-tags">
                        {sp.tags && sp.tags.map((tag, index) => (
                          <span key={index} className="project-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Divider between projects (except the last one) */}
                  {index < currentItems.length - 1 && (
                    <div
                      className="sp-divider"
                      style={{backgroundColor: 'rgba(229, 231, 235, 0.7)', margin: '10px 0'}}
                    ></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Bottom Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '0 16px', 
              width: '100%',
              margin: '20px 0',
            }}>
              <div style={{ width: '150px' }}></div>
              {/* Pagination Numbers */}
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size="medium"
                shape="rounded"
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#333',
                    borderColor: '#e4e4e4',
                  },
                  '& .Mui-selected': {
                    backgroundColor: '#800000 !important',
                    color: '#fff',
                  }
                }}
              />
              
              {/* Rows per page control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                  Show rows:
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
                  <Select
                    id="rows-per-page-select-bottom"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdviserProfile;