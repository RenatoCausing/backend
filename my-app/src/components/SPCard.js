// src/components/SPCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SPCard.css';

import axios from 'axios'; // <-- Make sure axios is imported
function SPCard({ id, title, year, semester, viewCount, tags = [] }) {
  // Default tags if none provided
  const projectTags = tags.length > 0 ? tags : ['Research', 'Technology'];
  // <-- NEW: Function to handle the view count increment API call
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
  };
  return (
    <Link to={`/project/${id}`} className="sp-card-link"  onClick={() => handleViewCountIncrement(id)} // Call the handler with the project ID
    >
      <div className="sp-card">
        <div className="sp-info">
          <h3>{title}</h3>
          <div className="view-count">
            <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {viewCount}
          </div>
          <p className="sp-meta">Year: {year}, Semester: {semester}</p>
          <div className="sp-tags">
            {projectTags.map((tag, index) => (
              <span key={index} className="sp-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SPCard;