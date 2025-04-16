// src/components/ProjectCard.js
import React from 'react';
import '../styles/ProjectCard.css';

function ProjectCard({ title, authorName, department }) {
  return (
    <div className="project-card">
      <div className="project-content">
        <h3>{title}</h3>
        <div className="project-author">
          <div className="author-avatar"></div>
          <div className="author-info">
            <p className="author-name">{authorName}</p>
            <p className="author-department">{department}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;