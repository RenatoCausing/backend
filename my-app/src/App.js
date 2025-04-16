// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdviserProfile from './pages/AdviserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/adviser/:adviserId" element={<AdviserProfile />} />
        {/* Add these routes for the "Browse" buttons to work */}
        <Route path="/advisers" element={<div>All Advisers Page (To be implemented)</div>} />
        <Route path="/projects" element={<div>All Projects Page (To be implemented)</div>} />
        <Route path="/project/:projectId" element={<div>Project Details Page (To be implemented)</div>} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;