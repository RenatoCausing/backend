// src/components/HeroSection.js
import React from 'react';
import '../styles/HeroSection.css';

function HeroSection() {
  return (
    <div className="hero-section">
      <h1>Welcome!</h1>
      <p className="hero-subtitle">Browse special projects made by students and faculty</p>
      <button className="discover-button">Discover</button>
    </div>
  );
}

export default HeroSection;