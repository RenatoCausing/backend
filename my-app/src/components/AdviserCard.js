import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdviserCard.css';

function AdviserCard({ id, firstName, lastName, description, imagePath }) {
  // Default image path as fallback if none is provided
  const defaultImage = `https://via.placeholder.com/60?text=${firstName.charAt(0)}${lastName.charAt(0)}`;
  
  // Truncate description if it's too long
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Link to={`/adviser/${id}`} className="adviser-card">
      <div className="adviser-image">
        <img 
          src={imagePath || defaultImage} 
          alt={`${firstName} ${lastName}`} 
        />
      </div>
      <div className="adviser-info">
        <h3>{firstName} {lastName}</h3>
        <p>{truncateDescription(description) || 'No description available.'}</p>
      </div>
    </Link>
  );
}

export default AdviserCard;