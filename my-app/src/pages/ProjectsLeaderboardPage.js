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
          { spId: 1, title: "Neural Networks in Image Recognition", viewCount: 312, year: 2024, semester: "1st", tagIds: [1, 3] },
          { spId: 2, title: "Quantum Computing Applications", viewCount: 287, year: 2024, semester: "2nd", tagIds: [2, 5] },
          { spId: 3, title: "Blockchain for Supply Chain Management", viewCount: 265, year: 2023, semester: "1st", tagIds: [4] },
          { spId: 4, title: "AI-Powered Patient Diagnosis System", viewCount: 243, year: 2023, semester: "2nd", tagIds: [1, 6] },
          { spId: 5, title: "Smart Urban Transportation Solutions", viewCount: 228, year: 2023, semester: "1st", tagIds: [7, 8] },
          { spId: 6, title: "Renewable Energy Grid Optimization", viewCount: 211, year: 2023, semester: "2nd", tagIds: [9] },
          { spId: 7, title: "Cybersecurity for IoT Devices", viewCount: 196, year: 2022, semester: "1st", tagIds: [10, 11] },
          { spId: 8, title: "Natural Language Processing for Legal Documents", viewCount: 189, year: 2022, semester: "2nd", tagIds: [1, 12] },
          { spId: 9, title: "Augmented Reality Applications in Education", viewCount: 175, year: 2022, semester: "1st", tagIds: [13, 14] },
          { spId: 10, title: "Sustainable Water Purification Methods", viewCount: 162, year: 2022, semester: "2nd", tagIds: [15] },
          { spId: 11, title: "Machine Learning for Financial Forecasting", viewCount: 158, year: 2021, semester: "1st", tagIds: [1, 16] },
          { spId: 12, title: "3D Bioprinting of Organic Tissues", viewCount: 147, year: 2021, semester: "2nd", tagIds: [17, 18] }
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
          { tagId: 1, tagName: "AI" },
          { tagId: 2, tagName: "Quantum Computing" },
          { tagId: 3, tagName: "Computer Vision" },
          { tagId: 4, tagName: "Blockchain" },
          { tagId: 5, tagName: "Algorithms" },
          { tagId: 6, tagName: "Healthcare" },
          { tagId: 7, tagName: "Smart Cities" },
          { tagId: 8, tagName: "Transportation" },
          { tagId: 9, tagName: "Energy" },
          { tagId: 10, tagName: "Cybersecurity" },
          { tagId: 11, tagName: "IoT" },
          { tagId: 12, tagName: "NLP" },
          { tagId: 13, tagName: "AR/VR" },
          { tagId: 14, tagName: "Education" },
          { tagId: 15, tagName: "Environmental" },
          { tagId: 16, tagName: "Finance" },
          { tagId: 17, tagName: "Biotech" },
          { tagId: 18, tagName: "3D Printing" }
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
        <div className="leaderboard-header">
          <h1>Most Popular Special Projects</h1>
          
          {/* Added navigation button to Advisers leaderboard */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
                  <Link to={`/project/${project.spId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                      <div className="flex mb-2">
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