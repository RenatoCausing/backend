import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import '../styles/SPFilterSystem.css';

function LeaderboardPage() {
  // State for advisers data
  const [advisers, setAdvisers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    // Fetch top advisers
    fetch(`${BACKEND_URL}/api/sp/top-advisers`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Top advisers data:', data);
        setAdvisers(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching top advisers:', error);
        // Set default data for testing
        const defaultAdvisers = [
          { 
            adminId: 1, 
            firstName: 'John', 
            lastName: 'Pork', 
            viewCount: 245, 
            description: 'Specializes in blockchain technologies and distributed systems with focus on security implications.',
            imagePath: 'https://via.placeholder.com/150?text=JP'
          },
          { 
            adminId: 2, 
            firstName: 'Bombardino', 
            lastName: 'Crocodillo', 
            viewCount: 198,
            description: 'Expert in AI and neural networks with applications in natural language processing.',
            imagePath: 'https://via.placeholder.com/150?text=BC'
          },
          { 
            adminId: 3, 
            firstName: 'Tim', 
            lastName: 'Cheese', 
            viewCount: 176,
            description: 'Researches web technologies and cloud computing architectures for scalable applications.',
            imagePath: 'https://via.placeholder.com/150?text=TC'
          },
          { 
            adminId: 4, 
            firstName: 'Maria', 
            lastName: 'Rodriguez', 
            viewCount: 154,
            description: 'Focuses on data mining and machine learning for predictive analytics in healthcare.',
            imagePath: 'https://via.placeholder.com/150?text=MR'
          },
          { 
            adminId: 5, 
            firstName: 'James', 
            lastName: 'Wilson', 
            viewCount: 143,
            description: 'Works on cybersecurity with emphasis on network protection and intrusion detection.',
            imagePath: 'https://via.placeholder.com/150?text=JW'
          },
          { 
            adminId: 6, 
            firstName: 'Sarah', 
            lastName: 'Johnson', 
            viewCount: 121,
            description: 'Specializes in human-computer interaction and user experience design methodologies.',
            imagePath: 'https://via.placeholder.com/150?text=SJ'
          },
          { 
            adminId: 7, 
            firstName: 'Robert', 
            lastName: 'Brown', 
            viewCount: 115,
            description: 'Expert in software engineering practices and agile development methodologies.',
            imagePath: 'https://via.placeholder.com/150?text=RB'
          },
          { 
            adminId: 8, 
            firstName: 'Emily', 
            lastName: 'Davis', 
            viewCount: 102,
            description: 'Researches database systems with focus on NoSQL solutions for big data applications.',
            imagePath: 'https://via.placeholder.com/150?text=ED'
          },
          { 
            adminId: 9, 
            firstName: 'Michael', 
            lastName: 'Miller', 
            viewCount: 97,
            description: 'Works on computer vision and image processing algorithms for autonomous systems.',
            imagePath: 'https://via.placeholder.com/150?text=MM'
          },
          { 
            adminId: 10, 
            firstName: 'Jennifer', 
            lastName: 'Taylor', 
            viewCount: 89,
            description: 'Specializes in game development and interactive entertainment technologies.',
            imagePath: 'https://via.placeholder.com/150?text=JT'
          },
          { 
            adminId: 11, 
            firstName: 'David', 
            lastName: 'Anderson', 
            viewCount: 84,
            description: 'Researches embedded systems and IoT architectures for smart environments.',
            imagePath: 'https://via.placeholder.com/150?text=DA'
          },
          { 
            adminId: 12, 
            firstName: 'Lisa', 
            lastName: 'Thomas', 
            viewCount: 78,
            description: 'Expert in information retrieval systems and search algorithm optimization.',
            imagePath: 'https://via.placeholder.com/150?text=LT'
          }
        ];
        setAdvisers(defaultAdvisers);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Sort advisers by view count (descending) to ensure proper ranking
  const sortedAdvisers = [...advisers].sort((a, b) => b.viewCount - a.viewCount);

  // Calculate total pages
  const totalItems = sortedAdvisers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAdvisers.slice(indexOfFirstItem, indexOfLastItem);

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

  // Function to abbreviate description to a certain length
  const abbreviateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    return description.length > maxLength 
      ? `${description.substring(0, maxLength)}...` 
      : description;
  };

  // Function to calculate rank number based on page and position
  const calculateRank = (index) => {
    return indexOfFirstItem + index + 1;
  };

  return (
    <div className="leaderboard-page">
      <Navbar />
      
      {/* Added padding-top to fix navbar clipping */}
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="leaderboard-header">
          <h1>Most Popular Advisers</h1>
          
          {/* Added navigation button to SP leaderboard */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Link to="/leaderboard/sp" style={{ textDecoration: 'none' }}>
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
                <span>View Special Projects Leaderboard</span>
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
          
          {/* Advisers List */}
          <div style={{width: '100%'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading advisers...</div>
            )}

            {/* No Results Found Message */}
            {!isLoading && currentItems.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No advisers found.
              </div>
            )}

            {/* Advisers List Items - Updated with profile picture, description and ranking number */}
            {!isLoading && currentItems.map((adviser, index) => (
              <div key={adviser.adminId} className="relative">
                <Link to={`/adviser/${adviser.adminId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="mb-6" style={{ position: 'relative', paddingTop: '12px' }}>
                    {/* Ranking Number - New Feature */}
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
                      #{calculateRank(index)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginTop: '8px' }}>
                      {/* Profile Picture */}
                      <div style={{ flexShrink: 0 }}>
                        <img 
                          src={adviser.imagePath || `https://via.placeholder.com/60?text=${adviser.firstName.charAt(0)}${adviser.lastName.charAt(0)}`}
                          alt={`${adviser.firstName} ${adviser.lastName}`}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #800000'
                          }}
                        />
                      </div>
                      
                      {/* Adviser Information */}
                      <div style={{ flex: 1 }}>
                        {/* Updated header with adviser name and view count */}
                        <div className="flex mb-2">
                          <h3 className="text-lg font-semibold flex-1">
                            {adviser.firstName} {adviser.lastName}
                          </h3>
                          <div className="flex items-center">
                            <span className="view-count text-gray-500" style={{ height: 'auto', width: 'auto', display: 'flex', alignItems: 'center' }}>
                              <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i> {adviser.viewCount || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600" style={{ marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {abbreviateDescription(adviser.description)}
                        </p>
                        
                        {/* Add additional information if available */}
                        {adviser.department && (
                          <div className="text-sm text-gray-600" style={{ marginTop: '0.5rem' }}>
                            <span>Department: {adviser.department}</span>
                          </div>
                        )}

                        {adviser.specialization && (
                          <div className="text-sm text-gray-600" style={{ marginTop: '0.25rem' }}>
                            <span>Specialization: {adviser.specialization}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Divider between advisers (except the last one) */}
                {index < currentItems.length - 1 && (
                  <div
                    className="sp-divider"
                    style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                  ></div>
                )}
              </div>
            ))}
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

export default LeaderboardPage;