import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// import '../styles/SPFilterSystem.css'; // Remove if not used elsewhere on this page
import '../styles/AdvisersLeaderboard.css'; // Import the NEW CSS file for advisers

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
            description: 'Specializes in blockchain technologies and distributed systems with focus on security implications. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            email: 'john.pork@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=JP'
          },
          {
            adminId: 2,
            firstName: 'Bombardino',
            lastName: 'Crocodillo',
            viewCount: 198,
            description: 'Expert in AI and neural networks with applications in natural language processing. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            email: 'bombardino.c@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=BC'
          },
          {
            adminId: 3,
            firstName: 'Tim',
            lastName: 'Cheese',
            viewCount: 176,
            description: 'Researches web technologies and cloud computing architectures for scalable applications. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            email: 'tim.cheese@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=TC'
          },
          {
            adminId: 4,
            firstName: 'Maria',
            lastName: 'Rodriguez',
            viewCount: 154,
            description: 'Focuses on data mining and machine learning for predictive analytics in healthcare.',
            email: 'maria.r@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=MR'
          },
          {
            adminId: 5,
            firstName: 'James',
            lastName: 'Wilson',
            viewCount: 143,
            description: 'Works on cybersecurity with emphasis on network protection and intrusion detection.',
            email: 'james.w@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=JW'
          },
          {
            adminId: 6,
            firstName: 'Sarah',
            lastName: 'Johnson',
            viewCount: 121,
            description: 'Specializes in human-computer interaction and user experience design methodologies.',
            email: 'sarah.j@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=SJ'
          },
          {
            adminId: 7,
            firstName: 'Robert',
            lastName: 'Brown',
            viewCount: 115,
            description: 'Expert in software engineering practices and agile development methodologies.',
            email: 'robert.b@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=RB'
          },
          {
            adminId: 8,
            firstName: 'Emily',
            lastName: 'Davis',
            viewCount: 102,
            description: 'Researches database systems with focus on NoSQL solutions for big data applications.',
            email: 'emily.d@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=ED'
          },
          {
            adminId: 9,
            firstName: 'Michael',
            lastName: 'Miller',
            viewCount: 97,
            description: 'Works on computer vision and image processing algorithms for autonomous systems.',
            email: 'michael.m@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=MM'
          },
          {
            adminId: 10,
            firstName: 'Jennifer',
            lastName: 'Taylor',
            viewCount: 89,
            description: 'Specializes in game development and interactive entertainment technologies.',
            email: 'jennifer.t@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=JT'
          },
          {
            adminId: 11,
            firstName: 'David',
            lastName: 'Anderson',
            viewCount: 84,
            description: 'Researches embedded systems and IoT architectures for smart environments.',
            email: 'david.a@university.edu', // Added email
            imagePath: 'https://via.placeholder.com/150?text=DA'
          },
          {
            adminId: 12,
            firstName: 'Lisa',
            lastName: 'Thomas',
            viewCount: 78,
            description: 'Expert in information retrieval systems and search algorithm optimization.',
            email: 'lisa.t@university.edu', // Added email
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
  const abbreviateDescription = (description, maxLength = 160) => { // Increased max length slightly for advisers
    if (!description) return 'No description available.';
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  return (
    <div className="leaderboard-page-container">
      <Navbar />

      <div className="leaderboard-content-wrapper">
        <div className="leaderboard-header-section">
          <h1>Most Popular Advisers</h1>

          {/* Navigation button to SP leaderboard */}
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
              <span>View SP Leaderboard</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </Link>
        </div>
        <div>
          <p className="leaderboard-description">
            Discover the driving forces behind our top Special Projects. This section features the most popular advisers, <br />
            recognized for their dedication to guiding innovative student research. Their ranking here is a testament to their impact <br />
            and the engagement their mentored projects receive. You can delve deeper into each adviser's background and <br />
            areas of expertise by viewing their profile, and easily see their standing among their peers on this leaderboard.
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

          {/* Advisers List */}
          <div className="adviser-list-section"> {/* Changed class name here */}
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

            {/* Advisers List Items */}
            {!isLoading && currentItems.map((adviser, index) => {
              const rankNumber = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <div key={adviser.adminId}>
                  {/* Divider between advisers (except the first one) */}
                  {index > 0 && (
                    <div className="adviser-item-divider"></div> 
                  )}

                  <Link to={`/adviser/${adviser.adminId}`} className="leaderboard-adviser-item"> {/* Changed class name here */}
                    {/* Ranking Number */}
                    <div className="adviser-rank"> {/* Changed class name here */}
                      #{rankNumber}
                    </div>

                    {/* Profile Picture */}
                    <img
                      src={adviser.imagePath || `https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=`}
                      alt={`${adviser.firstName} ${adviser.lastName}`}
                      className="adviser-profile-picture"
                    />

                    {/* Adviser Information */}
                    <div className="adviser-content"> {/* Changed class name here */}
                      {/* Header with adviser name and view count */}
                      <div className="adviser-header"> {/* Changed class name here */}
                        <h3 className="adviser-name"> {/* Changed class name here */}
                          {adviser.firstName} {adviser.lastName}
                        </h3>
                        <div className="adviser-view-count"> {/* Changed class name here */}
                          {adviser.viewCount || 0} <i className="fa-solid fa-chart-simple"></i> {/* Changed icon */}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="adviser-description"> {/* Changed class name here */}
                        {abbreviateDescription(adviser.description)}
                      </p>

                      {/* Email */}
                      {adviser.email && (
                        <div className="adviser-contact"> {/* New class for contact info */}
                          <i className="fas fa-envelope"></i> {/* Email icon */}
                          <span>{adviser.email}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination */}
          <div className="leaderboard-pagination-bottom">
            <div style={{ width: '150px' }}></div> {/* Spacer */}
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

export default LeaderboardPage;