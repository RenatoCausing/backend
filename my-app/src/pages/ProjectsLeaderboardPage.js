
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import '../styles/SPFilterSystem.css';

function ProjectsLeaderboardPage() {
  // State for special projects data
  const [specialProjects, setSpecialProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    // Fetch top SPs
    fetch(`${BACKEND_URL}/api/sp/top-sps`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Top SPs data:', data);
        // Sort by view count (highest first) before setting state
        const sortedData = Array.isArray(data) ? 
          [...data].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)) : 
          [];
        setSpecialProjects(sortedData);
      })
      .catch(error => {
        console.error('Error fetching top SPs:', error);
        // Default SPs data
        const defaultSPs = [
];
        // Sort by view count (highest first)
        const sortedDefaultSPs = [...defaultSPs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setSpecialProjects(sortedDefaultSPs);
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    // Fetch tags
    fetch(`${BACKEND_URL}/api/tags`)
      .then(response => {
        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Tags data:', data);
        setTags(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching tags:', error);
        // Default tags if API fails
        setTags([

        ]);
      });
  }, []);

  // Helper function to get tags for a project
  const getTagsForSp = (sp) => {
    if (!sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags
      .filter(tag => sp.tagIds.includes(tag.tagId))
      .map(tag => tag.tagName || 'Unknown Tag');
  };
  const handleViewCountIncrement = async (spId) => {
    try {
      // Make the POST request to your backend endpoint
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented for SP ID: ${spId}`);
      // You might want to update the view count displayed on the card locally here,
      // but keep in mind this local update won't persist on refresh unless data is re-fetched.
      // The backend is the source of truth for the view count.
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
      // Handle errors if the API call fails
    }
  }

  // Calculate total pages
  const totalItems = specialProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = specialProjects.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="leaderboard-page">
      <Navbar />
      
      {/* Added padding-top to fix navbar clipping */}
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="leaderboard-header" style={{
    display: 'flex',
    justifyContent: 'space-between', // This will push items to the left and right
    alignItems: 'center' // Vertically align items in the center
}}>
          <h1>Most Popular Special Projects</h1>
          
          {/* Added navigation button to Advisers leaderboard */}
          <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
            <Link to="/leaderboard/adviser" style={{ textDecoration: 'none' }}>
              <button 
                style={{ 
                  backgroundColor: '#800000', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>View Advisers Leaderboard</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </Link>
          </div>
        </div>
        <div><p style={{ marginTop: '2rem', marginBottom: '3rem', color: '#555', fontSize: '.9rem', lineHeight: '1.5rem'}}>
        Explore the forefront of student research and innovation by browsing our Most Popular Special Projects. <br />
         This curated list features the projects that have received the highest view counts across the platform, indicating <br />
         their relevance and impact within the community. Each project is a testament to student dedication and faculty 
         guidance.<br /> Simply click on a project to reveal comprehensive details and learn more about the work behind the views.
                </p>
                </div>

        <div className="leaderboard-content">
          {/* Top Pagination */}
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
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          
          {/* Special Projects List */}
          <div style={{width: '100%'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading special projects...</div>
            )}

            {/* No Results Found Message */}
            {!isLoading && currentItems.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No special projects found.
              </div>
            )}

            {/* Special Projects List Items - Updated to match HomePage.js style */}
            {!isLoading && currentItems.map((project, index) => {
              // Calculate the global ranking based on current page and index
              const rankNumber = (currentPage - 1) * itemsPerPage + index + 1;
              
              return (
                <div key={project.spId} className="relative">
                  <Link to={`/project/${project.spId}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => handleViewCountIncrement(project.spId)}>
                    <div className="mb-6">
                      {/* Ranking number - Added above the title */}
                      <div style={{ 
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#800000',
                        backgroundColor: 'rgba(128, 0, 0, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        #{rankNumber}
                      </div>
                      
                      {/* Updated header with project title and view count */}
                      <div className="flex mb-2"style={{ marginRight: '3rem'}}>
                        <h3 className="text-lg font-semibold flex-1">
                          {project.title || 'Untitled Project'}
                        </h3>
                        <div className="flex items-center">
                          <span className="view-count text-gray-500" style={{ height: 'auto', width: 'auto', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i> {project.viewCount || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Add year and semester info */}
                      <div className="text-sm text-gray-600" style={{ marginTop: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                        {project.year && project.semester && (
                          <span>
                            <i className="far fa-calendar-alt" style={{ marginRight: '0.5rem' }}></i> 
                            {project.year} - {project.semester} Semester
                          </span>
                        )}
                      </div>
                      
                      {/* Project abstract/description if available */}
                      {project.description && (
                        <div className="text-sm text-gray-600" style={{ marginTop: '0.5rem' }}>
                          <p>{project.description}</p>
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="card-tags" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {project.tagIds && Array.isArray(project.tagIds) ? 
                          getTagsForSp(project).map((tagName, i) => (
                            <span key={i} style={{ 
                              backgroundColor: '#e5e7eb', 
                              color: '#4b5563',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem'
                            }}>
                              {tagName}
                            </span>
                          )) : (
                            // Fallback if project.tags is available as direct strings
                            Array.isArray(project.tags) ? 
                              project.tags.map((tag, i) => (
                                <span key={i} style={{ 
                                  backgroundColor: '#e5e7eb', 
                                  color: '#4b5563',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem'
                                }}>
                                  {tag}
                                </span>
                              )) : null
                          )
                        }
                      </div>
                    </div>
                  </Link>

                  {/* Divider between projects (except the last one) */}
                  {index < currentItems.length - 1 && (
                    <div
                      className="sp-divider"
                      style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Bottom Pagination */}
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
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectsLeaderboardPage;