import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProjectCard from '../components/ProjectCard';
import AdviserCard from '../components/AdviserCard';
import SPCard from '../components/SPCard';
import '../styles/HomePage.css';

import { Link } from 'react-router-dom';

function HomePage() {
  const [topAdvisers, setTopAdvisers] = useState([]);
  const [topSPs, setTopSPs] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    // Fetch top advisers with absolute URL
    fetch(`${BACKEND_URL}/api/sp/top-advisers`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Top advisers data:', data);
        setTopAdvisers(data);
      })
      .catch(error => {
        console.error('Error fetching top advisers:', error);
        // Set default data for testing
        setTopAdvisers([
          { adminId: 1, firstName: 'John', lastName: 'Pork' },
          { adminId: 2, firstName: 'Bombardino', lastName: 'Crocodillo' },
          { adminId: 3, firstName: 'Tim', lastName: 'Cheese' }
        ]);
      });

    // Fetch top SPs with absolute URL
    fetch(`${BACKEND_URL}/api/sp/top-sps`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Top SPs data:', data);
        setTopSPs(data);
      })
      .catch(error => {
        console.error('Error fetching top SPs:', error);
        // Use the sample data you provided for testing with added tags
        setTopSPs([
          {
            "spId": 45,
            "title": "Blockchain Security",
            "year": 2025,
            "semester": "2nd",
            "viewCount": 31,
            "tags": ["Blockchain", "Cybersecurity", "Cryptography"]
          },
          {
            "spId": 44,
            "title": "AI in Healthcare",
            "year": 2025,
            "semester": "1st",
            "viewCount": 2,
            "tags": ["AI", "Healthcare", "Machine Learning"]
          },
          {
            "spId": 47,
            "title": "Cybersecurity Trends",
            "year": 2025,
            "semester": "Summer",
            "viewCount": 0,
            "tags": ["Cybersecurity", "Network Security"]
          },
          {
            "spId": 48,
            "title": "IoT for Smart Homes",
            "year": 2025,
            "semester": "1st",
            "viewCount": 0,
            "tags": ["IoT", "Smart Home", "Automation"]
          },
          {
            "spId": 49,
            "title": "Machine Learning Ethics",
            "year": 2025,
            "semester": "2nd",
            "viewCount": 0,
            "tags": ["Machine Learning", "Ethics", "AI"]
          }
        ]);
      });

    // Set featured projects (could be from an API or hardcoded for demo)
    setFeaturedProjects([
      {
        id: 1,
        title: "Adaptive Disaster Response Simulation",
        author: {
          name: "Frank Ocean",
          department: "Computer Science"
        }
      },
      {
        id: 2,
        title: "Smart Glove for Assistive Communication",
        author: {
          name: "Li Wei",
          department: "Applied Physics"
        }
      },
      {
        id: 3,
        title: "AI-Powered Academic Research Recommender",
        author: {
          name: "Kendrick Lamar",
          department: "Biochemistry"
        }
      }
    ]);
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      
      <div className="container">
        <section className="browse-section">
          <h2>Browse</h2>
          <div className="project-cards">
            {featuredProjects.map(project => (
              <ProjectCard 
                key={project.id}
                title={project.title}
                authorName={project.author.name}
                department={project.author.department}
              />
            ))}
          </div>
        </section>

        <div className="popular-sections">
        <section className="popular-advisers">
  <h2>MOST POPULAR ADVISERS</h2>
  <p className="section-description">
    Explore the most sought-after SP adviser, recognized for their research mentorship.
  </p>
  <div className="adviser-cards">
    {topAdvisers.map(adviser => (
      <AdviserCard 
        key={adviser.adminId}
        id={adviser.adminId}
        firstName={adviser.firstName}
        lastName={adviser.lastName}
      />
    ))}
  </div>
  <Link to="/advisers" className="browse-button-adviser">Browse Popular Advisers</Link>
</section>

<section className="popular-projects">
  <h2>MOST POPULAR SPECIAL PROJECTS</h2>
  <p className="section-description">
    Discover the most sought-after SPs, each chosen for their creativity, research excellence, and real-world relevance!
  </p>
  <div className="sp-cards">
    {topSPs.map(sp => (
      <SPCard 
        key={sp.spId}
        id={sp.spId}
        title={sp.title}
        year={sp.year}
        semester={sp.semester}
        viewCount={sp.viewCount}
        tags={sp.tags}
      />
    ))}
  </div>
  <Link to="/projects" className="browse-button-sp">Browse Popular SPs</Link>
</section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;