import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdviserNavbar from '../components/AdviserNavbar';
import { Link } from 'react-router-dom';
import '../styles/AdviserProfile.css';

function AdviserProfile() {
  const { adviserId } = useParams();
  const [adviser, setAdviser] = useState(null);
  const [adviserSPs, setAdviserSPs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    // Fetch adviser details
    fetch(`${BACKEND_URL}/api/advisers/${adviserId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Adviser data:', data);
        setAdviser(data);
      })
      .catch(error => {
        console.error('Error fetching adviser details:', error);
        // Set default data for testing
        setAdviser({
          adminId: adviserId,
          firstName: 'John',
          lastName: 'Pork',
          middleName: '',
          facultyId: 1,
          email: 'john.pork@up.edu.ph',
          image_path: 'https://via.placeholder.com/150?text=JP',
          description: 'Dr. John Pork is a faculty member specializing in computer science research.'
        });
      });

    // Fetch SPs from this adviser
    fetch(`${BACKEND_URL}/api/sp/adviser/${adviserId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Adviser SPs data:', data);
        setAdviserSPs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching adviser SPs:', error);
        // Sample data for testing
        setAdviserSPs([
          {
            spId: 101,
            title: "Blockchain Security Applications for Smart Contracts",
            year: 2025,
            semester: "1st",
            abstractText: "A comprehensive study on blockchain security mechanisms",
            viewCount: 42,
            tags: ["Blockchain", "Cybersecurity", "Smart Contracts"]
          },
          {
            spId: 102,
            title: "AI-Powered Disaster Response Systems",
            year: 2024,
            semester: "2nd",
            abstractText: "Using artificial intelligence to improve emergency response times",
            viewCount: 38,
            tags: ["AI", "Emergency Response", "Machine Learning"]
          },
          {
            spId: 103,
            title: "Quantum Computing Applications in Cryptography",
            year: 2024,
            semester: "Summer",
            abstractText: "Exploring how quantum computing will change modern encryption",
            viewCount: 27,
            tags: ["Quantum Computing", "Cryptography", "Information Security"]
          }
        ]);
        setLoading(false);
      });
  }, [adviserId]);

  // Loading state
  if (loading || !adviser) {
    return (
      <div>
        <AdviserNavbar />
        <div className="Acontainer">
          <div className="loading">Loading adviser profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="adviser-profile-page">
      <AdviserNavbar />
      
      <div className="Acontainer">
        <div className="profile-header">
          <div className="profile-info">
            <h1>{adviser.firstName} {adviser.lastName}</h1>
            <p className="email">{adviser.email || 'No email available'}</p>
            
            <div className="bio">
              <p>{adviser.description || 
                `Dr. ${adviser.firstName} ${adviser.lastName}, PhD in Yapping - The undisputed legend of SPIS, 
                Dr. ${adviser.lastName} has advised more projects than there are stars in the 
                galaxy (or at least, that's what it feels like). With a coffee in one 
                hand and 10 tabs of research papers open at all times, this 
                adviser turns struggling ideas into award-winning theses. If you 
                survive their feedback sessions, congratulations—you've 
                officially leveled up in academia. ✅`
              }</p>
            </div>
          </div>
          
          <div className="profile-image">
            {/* Just use the image path directly, no error handling */}
            <img 
              src={adviser.imagePath} 
              alt={`${adviser.firstName} ${adviser.lastName}`}
              className="profile-img"
            />
          </div>
        </div>
        
        <div className="special-projects-section">
          <div className="section-header">
            <h2>Special Projects Advised</h2>
            <button className="browse-all-button">Browse All</button>
          </div>
          
          <div className="project-cards-container">
            {adviserSPs.map(sp => (
              <Link to={`/project/${sp.spId}`} key={sp.spId} className="project-card-link">
                <div className="project-card">
                  <h3>{sp.title}</h3>
                  <div className="view-count">
                    <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {sp.viewCount}
                  </div>
                  <p className="project-details">Year: {sp.year}, Semester: {sp.semester}</p>
                  <div className="project-tags">
                    {sp.tags && sp.tags.map((tag, index) => (
                      <span key={index} className="project-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdviserProfile;