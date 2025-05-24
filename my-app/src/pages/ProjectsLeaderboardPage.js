import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import '../styles/SPFilterSystem.css'; // Keep this if other components on this page use it
import '../styles/ProjectsLeaderboard.css'; // New and REVISED CSS file for leaderboard specific styles

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
        const defaultSPs = [];
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
        setTags([]);
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
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented for SP ID: ${spId}`);
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
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
    <div className="leaderboard-page-container">
      <Navbar />

      <div className="container leaderboard-content-wrapper">
        <div className="leaderboard-header-section">
          <h1>Most Popular Special Projects</h1>

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
        <div>
          <p className="leaderboard-description">
            Explore the forefront of student research and innovation by Browse our Most Popular Special Projects. <br />
            This curated list features the projects that have received the highest view counts across the platform, indicating <br />
            their relevance and impact within the community. Each project is a testament to student dedication and faculty
            guidance.<br /> Simply click on a project to reveal comprehensive details and learn more about the work behind the views.
          </p>
        </div>

        <div className="leaderboard-content">
          {/* Top Pagination */}
          <div className="leaderboard-pagination-top">
            <div style={{ width: '150px' }}></div> {/* Spacer for pagination alignment */}
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
            <div className="rows-per-page-control">
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
          <div className="sp-list-section">
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

            {/* Special Projects List Items */}
            {!isLoading && currentItems.map((project, index) => {
              const rankNumber = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <div key={project.spId}>
                  {/* Divider between projects (except the first one) */}
                  {index > 0 && (
                    <div className="sp-item-divider"></div>
                  )}

                  <Link to={`/project/${project.spId}`} className="leaderboard-project-item" onClick={() => handleViewCountIncrement(project.spId)}>
                    <div className="project-rank">
                      #{rankNumber}
                    </div>

                    <div className="project-content">
                      <div className="project-header">
                        <h3 className="project-title">
                          {project.title || 'Untitled Project'}
                        </h3><div className="project-view-count">
  {project.viewCount || 0} <i className="fa-solid fa-chart-simple"></i>
</div>
                      </div>

                      {/* Add year and semester info */}
                      <div className="project-meta">
                        {project.year && project.semester && (
                          <span>
                            <i className="far fa-calendar-alt"></i>
                            {project.year} - {project.semester} Semester
                          </span>
                        )}
                        {/* You can add more meta info here if available, e.g., Advisers, Authors */}
                      </div>

                      {/* Project abstract/description */}
                      <div className="project-description">
                        <p>{project.description || project.abstractText || 'No description available.'}</p>
                      </div>

                      {/* Tags */}
                      <div className="project-tags">
                        {project.tagIds && Array.isArray(project.tagIds) ?
                          getTagsForSp(project).map((tagName, i) => (
                            <span key={i} className="project-tag">
                              {tagName}
                            </span>
                          )) : (
                            Array.isArray(project.tags) ?
                              project.tags.map((tag, i) => (
                                <span key={i} className="project-tag">
                                  {tag}
                                </span>
                              )) : null
                          )
                        }
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination */}
          <div className="leaderboard-pagination-bottom">
            <div style={{ width: '150px' }}></div>
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
            <div className="rows-per-page-control">
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