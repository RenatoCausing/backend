// src/components/SPCard.js
import React from 'react';
import '../styles/SPCard.css';

function SPCard({ id, title, year, semester, viewCount, tags = [] }) {
  // Default tags if none provided
  const projectTags = tags.length > 0 ? tags : ['Research', 'Technology'];
  
  return (
    <div className="sp-card">
      <div className="sp-info">
        <div className="sp-header">
          <h3>{title}</h3>
          <div className="view-count">
            <svg className="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#777"/>
            </svg>
            <span>{viewCount}</span>
          </div>
        </div>
        <p>Year: {year}, Semester: {semester}</p>
        <div className="sp-tags">
          {projectTags.map((tag, index) => (
            <span key={index} className="sp-tag">{tag}</span>
          ))}
        </div>
        <button className="browse-button">Browse</button>
      </div>
    </div>
  );
}

export default SPCard;