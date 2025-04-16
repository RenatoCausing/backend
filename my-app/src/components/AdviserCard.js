// src/components/AdviserCard.js
import React from 'react';
import '../styles/AdviserCard.css';

function AdviserCard({ id, firstName, lastName }) {
  const fullName = `Dr. ${firstName} ${lastName}`;
  
  return (
    <div className="adviser-card">
      <div className="adviser-image"></div>
      <div className="adviser-info">
        <h3>{fullName}</h3>
        <p>Body text for advisers would like to go here. Add main takeaway points, quotes, attributes, or even a very short story.</p>
        <button className="browse-button">Browse</button>
      </div>
    </div>
  );
}

export default AdviserCard;