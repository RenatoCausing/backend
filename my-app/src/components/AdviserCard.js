import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdviserCard.css';

function AdviserCard({ id, firstName, lastName, description, imagePath }) {
  // Default image path as fallback if none is provided
  const defaultImage = 'https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=';  
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