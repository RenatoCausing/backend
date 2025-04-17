import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AdviserCard from '../components/AdviserCard';
import SPCard from '../components/SPCard';
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';

// Import images directly
import heroBackgroundImg from '../images/hero-background.jpg';
import leaderboardBackgroundImg from '../images/leaderboard-background.jpg';
// Import placeholder for feature section
import featureBackgroundImg from '../images/feature-background.jpg';

function HomePage() {
  // Initialize state with empty arrays to prevent mapping errors
  const [topAdvisers, setTopAdvisers] = useState([]);
  const [topSPs, setTopSPs] = useState([]);
  const [randomSPs, setRandomSPs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const browseContainerRef = useRef(null);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    
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
        setTopAdvisers(Array.isArray(data) ? data : []);
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
        setTopSPs(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching top SPs:', error);
        // Default data
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

    // Fetch random SPs
    fetchRandomSPs();
  }, []);

  const fetchRandomSPs = () => {
    setIsLoading(true);
    fetch(`${BACKEND_URL}/api/sp`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Random SPs data:', data);
        // Ensure data is an array before processing
        if (Array.isArray(data)) {
          // If API returns all SPs, we can randomly select some
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          const randomSelection = shuffled.slice(0, 10); // Get 10 random SPs
          
          // Add tags if they don't exist
          const enhancedData = randomSelection.map(sp => {
            if (!sp.tags || !Array.isArray(sp.tags) || sp.tags.length === 0) {
              // Create default tags based on title words
              const commonTechTerms = [
                "AI", "Machine Learning", "Data Science", "Blockchain", 
                "Cybersecurity", "IoT", "Cloud", "Web Development",
                "Mobile", "Database", "Networks", "Algorithms",
                "Software Engineering", "UX", "DevOps", "Big Data",
                "Robotics", "Computer Vision", "NLP", "AR/VR"
              ];
              
              // Generate 2-3 random tags that might be relevant
              const generatedTags = [];
              const title = sp.title || "";
              
              // Try to find relevant tags from the title
              commonTechTerms.forEach(term => {
                if (title.toLowerCase().includes(term.toLowerCase()) && generatedTags.length < 3) {
                  generatedTags.push(term);
                }
              });
              
              // If we didn't find enough tags from the title, add some random ones
              while (generatedTags.length < 2) {
                const randomTerm = commonTechTerms[Math.floor(Math.random() * commonTechTerms.length)];
                if (!generatedTags.includes(randomTerm)) {
                  generatedTags.push(randomTerm);
                }
              }
              
              return { ...sp, tags: generatedTags };
            }
            return sp;
          });
          
          setRandomSPs(enhancedData);
        } else {
          console.error('API returned non-array data:', data);
          // Fallback to default data if API response is not an array
          setRandomSPs(getDefaultRandomSPs());
        }
      })
      .catch(error => {
        console.error('Error fetching random SPs:', error);
        // Default data
        setRandomSPs(getDefaultRandomSPs());
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Default random SPs data
  const getDefaultRandomSPs = () => {
    return [
      {
        "spId": 50,
        "title": "Neural Networks in Image Recognition",
        "description": "This project explores advanced neural network architectures for image recognition tasks, with a focus on efficiency and accuracy in real-world applications.",
        "year": 2024,
        "semester": "1st",
        "viewCount": 15,
        "tags": ["AI", "Neural Networks", "Computer Vision"]
      },
      {
        "spId": 51,
        "title": "Quantum Computing Applications",
        "description": "An investigation into practical applications of quantum computing algorithms in cryptography, optimization problems, and database searches.",
        "year": 2024,
        "semester": "2nd",
        "viewCount": 8,
        "tags": ["Quantum Computing", "Algorithms"]
      },
      // ... other default SPs
    ];
  };

  // Function to scroll browse container left
  const scrollLeft = () => {
    if (browseContainerRef.current) {
      // Adjusted scroll amount to match the width of one card + gap (for 3-card layout)
      browseContainerRef.current.scrollBy({ left: -580, behavior: 'smooth' });
    }
  };
  
  // Function to scroll browse container right
  const scrollRight = () => {
    if (browseContainerRef.current) {
      // Adjusted scroll amount to match the width of one card + gap (for 3-card layout)
      browseContainerRef.current.scrollBy({ left: 580, behavior: 'smooth' });
    }
  };
  
  // Function to refresh random SPs
  const refreshRandomSPs = () => {
    // Add animation class to trigger fade-out effect
    const container = browseContainerRef.current;
    if (container) {
      container.classList.add('fade-out');
      
      // Wait for animation to complete, then fetch new data
      setTimeout(() => {
        fetchRandomSPs();
        // Remove fade-out class and add fade-in class
        container.classList.remove('fade-out');
        container.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
          container.classList.remove('fade-in');
        }, 500);
      }, 500);
    } else {
      fetchRandomSPs();
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      
      {/* First section with hero background */}
      <section className="hero-section" style={{ 
        backgroundImage: `url(${heroBackgroundImg})` 
      }}>
        <HeroSection />
      </section>
      
      {/* New Feature Section with Background Image */}
      <section className="feature-section" style={{ 
        backgroundImage: `url(${featureBackgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="feature-overlay">
          <div className="feature-content">
            <div className="feature-text">
              <span className="feature-badge">University Excellence</span>
              <h2>Introducing Special Projects Repository</h2>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-book-open"></i>
                </div>
                <div className="feature-details">
                  <h3>Academic Excellence</h3>
                  <p>Discover and showcase exemplary student research and special projects that represent our university's commitment to excellence.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="feature-details">
                  <h3>Innovation & Research</h3>
                  <p>Explore innovative solutions and groundbreaking research developed by our talented students and faculty advisors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Second section with white background and random SPs */}
      <section className="browse-section">
        <div className="container">
          <div className="browse-header">
            <h2>BROWSE SPECIAL PROJECTS</h2>
            <button className="refresh-button" onClick={refreshRandomSPs}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          
          <div className="browse-carousel">
            <button className="scroll-button left" onClick={scrollLeft}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="browse-container-wrapper">
              <div className="browse-container" ref={browseContainerRef}>
                {isLoading ? (
                  <div className="loading-state">Loading projects...</div>
                ) : (
                  randomSPs && randomSPs.map((sp, index) => (
                    <div 
                      key={sp.spId || index} 
                      className="browse-card" 
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="enhanced-sp-card">
                        <h3 className="card-title">{sp.title || 'Untitled Project'}</h3>
                        <div className="card-meta">
                          <span className="year-semester">{sp.year || 'N/A'} | {sp.semester || 'N/A'} Semester</span>
                          <span className="view-count">
                            <i className="fas fa-eye"></i> {sp.viewCount || 0}
                          </span>
                        </div>
                        <p className="card-description">{sp.description || sp.abstractText || 'No description available.'}</p>
                        
                        <div className="card-tags">
                          {Array.isArray(sp.tags) ? 
                            sp.tags.map((tag, i) => (
                              <span key={i} className="tag">{tag}</span>
                            )) : null
                          }
                        </div>
                        
                        <Link to={`/projects/${sp.spId}`} className="view-details-button">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <button className="scroll-button right" onClick={scrollRight}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Third section with leaderboard background */}
      <section className="leaderboard-section" style={{ 
        backgroundImage: `url(${leaderboardBackgroundImg})` 
      }}>
        <div className="container">
          <div className="popular-sections">
            <div className="popular-advisers">
              <h4>MOST POPULAR ADVISERS</h4>
              <p className="section-description">
                Explore the most sought-after SP adviser, recognized for their research mentorship.
              </p>
              <div className="adviser-cards">
                {topAdvisers && topAdvisers.length > 0 ? (
                  topAdvisers.map(adviser => (
                    <AdviserCard 
                      key={adviser.adminId || Math.random()}
                      id={adviser.adminId}
                      firstName={adviser.firstName || 'Unknown'}
                      lastName={adviser.lastName || 'Adviser'}
                    />
                  ))
                ) : (
                  <p>No adviser data available.</p>
                )}
              </div>
              <Link to="/advisers" className="browse-button-adviser">Browse Popular Advisers</Link>
            </div>

            <div className="popular-projects">
              <h5>MOST POPULAR SPECIAL PROJECTS</h5>
              <p className="section-description">
                Discover the most sought-after SPs, each chosen for their creativity, research excellence, and real-world relevance!
              </p>
              <div className="sp-cards">
                {topSPs && topSPs.length > 0 ? (
                  topSPs.map(sp => (
                    <SPCard 
                      key={sp.spId || Math.random()}
                      id={sp.spId}
                      title={sp.title || 'Untitled Project'}
                      year={sp.year || 'N/A'}
                      semester={sp.semester || 'N/A'}
                      viewCount={sp.viewCount || 0}
                      tags={sp.tags && Array.isArray(sp.tags) ? sp.tags : []}
                    />
                  ))
                ) : (
                  <p>No project data available.</p>
                )}
              </div>
              <Link to="/projects" className="browse-button-sp">Browse Popular SPs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;