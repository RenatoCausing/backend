 
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SPCard.css';

import axios from 'axios';  
function SPCard({ id, title, year, semester, viewCount, tags = [] }) {
   
  const projectTags = tags.length > 0 ? tags : ['Research', 'Technology'];
   
  const handleViewCountIncrement = async (spId) => {
    try {
       
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented for SP ID: ${spId}`);
       
       
       
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
       
    }
  };
  return (
    <Link to={`/project/${id}`} className="sp-card-link"  onClick={() => handleViewCountIncrement(id)}  
    >
      <div className="sp-card">
        <div className="sp-info">
          <h3>{title}</h3>
          <div className="view-count">
            <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="8" height="8  " fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" margin = '5rem'>
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