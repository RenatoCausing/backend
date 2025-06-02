 
import React from 'react';
import '../styles/HeroSection.css';

const HeroSection = ({ onDiscoverClick }) => {
  return (
    <div className="hero-section">
      <h1>Welcome!</h1>
      <p className="hero-subtitle">Browse special projects made by students and faculty</p>
      <button className="discover-button" onClick={onDiscoverClick}>Discover</button>
    </div>
  );
}

export default HeroSection;