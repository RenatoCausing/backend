import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/AdviserNavbar';
import HeroSection from '../components/HeroSection';
import AdviserCard from '../components/AdviserCard';
import SPCard from '../components/SPCard';
import '../styles/HomePage.css'; // Ensure this path is correct
import { Link } from 'react-router-dom';

// Import images directly
import heroBackgroundImg from '../images/hero-background.jpg';
import leaderboardBackgroundImg from '../images/leaderboard-background.jpg';
import featureBackgroundImg from '../images/feature-background.jpg';

// New component for individual SP list items (Ranks 2-5) to manage hover state
const PopularSPListItem = ({ sp, index, handleViewCountIncrement }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/project/${sp.spId}`}
      key={sp.spId}
      onClick={() => handleViewCountIncrement(sp.spId)}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '1rem 1.2rem', /* Increased top and bottom padding */
        borderRadius: '8px',
        boxShadow: isHovered ? '0 4px 15px rgba(0,0,0,0.15)' : '0 1px 8px rgba(0,0,0,0.05)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: '1px solid #f0f0f0'
      }}>
        {/* Rank Number */}
        <div style={{
          fontSize: '1.1rem', /* Slightly smaller font size for ranks 2-5 */
          fontWeight: '1000',
          color: '#555',
          marginRight: '1rem',
          minWidth: '35px', /* Adjusted min-width for smaller font */
          textAlign: 'center'
        }}>
          #{index + 2}
        </div>
        {/* Image Placeholder */}
        <img
          src={`https://placehold.co/50x50/800000/FFFFFF?text=SP`}
          alt="Special Project"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '4px',
            objectFit: 'cover',
            marginRight: '1rem',
            flexShrink: 0,
            border: 'none', outline: 'none' // Remove underlines
          }}
        />
        {/* Text Content */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <h6 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', fontWeight: '500', color: '#333', textDecoration: 'none', }}>{sp.title || 'Untitled Project'}</h6> {/* Less bold, added bottom margin */}
          <span style={{ fontSize: '0.85rem', color: '#666', 
          marginTop: '.2rem' }}>{sp.year || 'N/A'} | {sp.semester || 'N/A'}</span>
        </div>
        {/* View Count */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#800000', marginLeft: '1rem', fontWeight: '600' }}>
          {sp.viewCount || 0} <i class="fa-solid fa-chart-simple" style={{ marginRight: '1rem', paddingLeft: '.3rem' }}></i>
        </div>
      </div>
    </Link>
  );
};


function HomePage() {
  const [startIndex, setStartIndex] = useState(0); // New state for carousel start index
  
  // Initialize state with empty arrays to prevent mapping errors
  const [topAdvisers, setTopAdvisers] = useState([]);
  const [topSPs, setTopSPs] = useState([]);
  const [randomSPs, setRandomSPs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const browseContainerRef = useRef(null);
  const [tags, setTags] = useState([]);
  const visibleSPs = randomSPs.slice(startIndex, startIndex + 2);
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
        const limitedData = Array.isArray(data) ? data.slice(0,8) : [];
        setTopAdvisers(limitedData);
      })
      .catch(error => {
        console.error('Error fetching top advisers:', error);
        // Set default data for testing
        setTopAdvisers([
          { 
            adminId: 1, 
            firstName: 'John', 
            lastName: 'Pork',
            description: 'Specializes in blockchain technologies and distributed systems with focus on security implications.',
            imagePath: 'https://placehold.co/120x120/800000/FFFFFF?text=JP', // Placeholder image
            viewCount: 2340 // Example view count
          },
          { 
            adminId: 2, 
            firstName: 'Bombardino', 
            lastName: 'Crocodillo',
            description: 'Expert in AI and neural networks with applications in natural language processing.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=BC', // Placeholder image
            viewCount: 1851
          },
          { 
            adminId: 3, 
            firstName: 'Tim', 
            lastName: 'Cheese',
            description: 'Researches web technologies and cloud computing architectures for scalable applications.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=TC', // Placeholder image
            viewCount: 1911
          },
          { 
            adminId: 4, 
            firstName: 'Alice', 
            lastName: 'Smith',
            description: 'Focuses on cybersecurity and network defense strategies.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=AS', // Placeholder image
            viewCount: 2540
          },
          { 
            adminId: 5, 
            firstName: 'Bob', 
            lastName: 'Johnson',
            description: 'Specializes in data analytics and big data processing.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=BJ', // Placeholder image
            viewCount: 1172
          },
          { 
            adminId: 6, 
            firstName: 'Charlie', 
            lastName: 'Brown',
            description: 'Researches human-computer interaction and user experience design.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=CB', // Placeholder image
            viewCount: 980
          },
          { 
            adminId: 7, 
            firstName: 'Diana', 
            lastName: 'Prince',
            description: 'Expert in machine learning algorithms and their applications.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=DP', // Placeholder image
            viewCount: 750
          },
          { 
            adminId: 8, 
            firstName: 'Eve', 
            lastName: 'Adams',
            description: 'Works on cloud infrastructure and distributed computing.',
            imagePath: 'https://placehold.co/50x50/800000/FFFFFF?text=EA', // Placeholder image
            viewCount: 600
          }
        ]);
      });

      // Fetch tags
      fetch(`${BACKEND_URL}/api/tags`)
      .then(response => {
        if (!response.ok) throw new Error(`API responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Tags data:', data);
        setTags(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching tags:', error);
        // Default tags if API fails
        setTags([
          { tagId: 1, tagName: "AI" },
          { tagId: 2, tagName: "Machine Learning" },
          { tagId: 3, tagName: "Blockchain" },
          { tagId: 4, tagName: "Cybersecurity" },
          { tagId: 5, tagName: "Web Development" },
          { tagId: 6, tagName: "Data Science" },
          { tagId: 7, tagName: "IoT" },
          { tagId: 8, tagName: "Cloud Computing" },
          { tagId: 9, tagName: "Mobile Development" },
          { tagId: 10, tagName: "Robotics" }
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
        const limitedData = Array.isArray(data) ? data.slice(0, 5) : [];
        setTopSPs(limitedData);
      })
      .catch(error => {
        console.error('Error fetching top SPs:', error);
        // Default data for top SPs if API fails
        setTopSPs([
          {
            "spId": 101,
            "title": "Advanced AI in Healthcare Diagnostics",
            "description": "Developing an AI-powered system for early disease detection using medical imaging.",
            "year": 2023,
            "semester": "1st",
            "viewCount": 120,
            "tagIds": [1, 6] // AI, Data Science
          },
          {
            "spId": 102,
            "title": "Secure Blockchain for Supply Chain Management",
            "description": "Implementing a decentralized ledger to enhance transparency and security in supply chains.",
            "year": 2024,
            "semester": "2nd",
            "viewCount": 95,
            "tagIds": [3, 4] // Blockchain, Cybersecurity
          },
          {
            "spId": 103,
            "title": "Optimizing Smart Home IoT Networks",
            "description": "Researching methods to improve efficiency and security of interconnected IoT devices in residential settings.",
            "year": 2023,
            "semester": "2nd",
            "viewCount": 80,
            "tagIds": [7, 8] // IoT, Cloud Computing
          },
          {
            "spId": 104,
            "title": "Personalized Learning with Machine Learning",
            "description": "Creating an adaptive e-learning platform that tailors content based on individual student progress.",
            "year": 2024,
            "semester": "1st",
            "viewCount": 110,
            "tagIds": [2, 1] // Machine Learning, AI
          },
          {
            "spId": 105,
            "title": "Augmented Reality for Architectural Visualization",
            "description": "Developing an AR application to visualize architectural designs in real-time environments.",
            "year": 2023,
            "semester": "1st",
            "viewCount": 70,
            "tagIds": [5] // Web Development (as a general tech tag)
          }
        ]);
      });

    // Fetch random SPs
    fetchRandomSPs();
  }, []);
  
  // Add this helper function
  const getTagsForSp = (sp) => {
    if (!sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags
      .filter(tag => sp.tagIds.includes(tag.tagId))
      .map(tag => tag.tagName || 'Unknown Tag');
  };

  const handleViewCountIncrement = async (spId) => {
    try {
      // Make the POST request to your backend endpoint
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented for SP ID: ${spId}`);
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
    }
  };

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
            // Prioritize existing tagIds, then sp.tags (if array of strings), then generate
            let spTags = [];
            if (sp.tagIds && Array.isArray(sp.tagIds)) {
              spTags = getTagsForSp(sp);
            } else if (sp.tags && Array.isArray(sp.tags) && sp.tags.every(tag => typeof tag === 'string')) {
              spTags = sp.tags;
            } else {
              // Create default tags based on title words if no tags are provided
              const commonTechTerms = [
                "AI", "Machine Learning", "Data Science", "Blockchain", 
                "Cybersecurity", "IoT", "Cloud", "Web Development",
                "Mobile", "Database", "Networks", "Algorithms",
                "Software Engineering", "UX", "DevOps", "Big Data",
                "Robotics", "Computer Vision", "NLP", "AR/VR"
              ];
              
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
              spTags = generatedTags;
            }
            return { ...sp, tags: spTags };
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
      {
        "spId": 52,
        "title": "Cybersecurity in IoT Devices",
        "description": "A study on vulnerabilities and mitigation strategies for Internet of Things (IoT) devices.",
        "year": 2023,
        "semester": "1st",
        "viewCount": 22,
        "tags": ["Cybersecurity", "IoT"]
      },
      {
        "spId": 53,
        "title": "Machine Learning for Financial Forecasting",
        "description": "Applying various machine learning models to predict stock market trends and financial indicators.",
        "year": 2024,
        "semester": "1st",
        "viewCount": 30,
        "tags": ["Machine Learning", "Finance", "Data Science"]
      },
      {
        "spId": 54,
        "title": "Web Development with Modern Frameworks",
        "description": "Building scalable and responsive web applications using React, Node.js, and MongoDB.",
        "year": 2023,
        "semester": "2nd",
        "viewCount": 45,
        "tags": ["Web Development", "React", "MongoDB"]
      },
      {
        "spId": 55,
        "title": "Big Data Analytics for Climate Change",
        "description": "Utilizing large datasets to analyze and model climate change patterns and impacts.",
        "year": 2024,
        "semester": "2nd",
        "viewCount": 18,
        "tags": ["Big Data", "Climate Science", "Analytics"]
      },
      {
        "spId": 56,
        "title": "Robotics and Automation in Manufacturing",
        "description": "Designing and implementing robotic systems to automate processes in industrial manufacturing.",
        "year": 2023,
        "semester": "1st",
        "viewCount": 10,
        "tags": ["Robotics", "Automation", "Engineering"]
      },
      {
        "spId": 57,
        "title": "Natural Language Processing for Sentiment Analysis",
        "description": "Developing NLP models to analyze and determine the sentiment of text data from social media.",
        "year": 2024,
        "semester": "1st",
        "viewCount": 25,
        "tags": ["NLP", "Sentiment Analysis", "AI"]
      },
      {
        "spId": 58,
        "title": "Augmented Reality for Education",
        "description": "Creating interactive AR applications to enhance learning experiences in various subjects.",
        "year": 2023,
        "semester": "2nd",
        "viewCount": 33,
        "tags": ["AR", "Education", "Interactive Design"]
      },
      {
        "spId": 59,
        "title": "Cloud Computing Security Best Practices",
        "description": "A comprehensive guide to securing data and applications deployed on cloud platforms.",
        "year": 2024,
        "semester": "2nd",
        "viewCount": 12,
        "tags": ["Cloud Computing", "Security", "DevOps"]
      }
    ];
  };

  // Function to scroll browse container left
// Function to scroll browse container left
  const scrollLeft = () => {
    setStartIndex(prevIndex => Math.max(0, prevIndex - 2)); // Scroll back by 3 cards
  };

  // Function to scroll browse container right
  const scrollRight = () => {
    setStartIndex(prevIndex => Math.min(randomSPs.length - 2, prevIndex + 2)); // Scroll forward by 3 cards
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
      
      {/* Adviser Leaderboard Section - Redesigned */}
      <section className="adviser-leaderboard-section">
        <div className="container">
          <div className="adviser-leaderboard-content">
            {topAdvisers.length > 0 && (
              <>
                {/* Left side: Title and Description */}
                <div className="adviser-leaderboard-intro">
                  <h4>MOST POPULAR ADVISERS</h4>
                  <p>
                    Discover the most sought-after SP advisers, recognized for their exceptional mentorship, innovative research guidance, and significant contributions to student projects.
                  </p>
                  {/* Browse All Advisers button moved here */}
                  <Link to="/leaderboard/adviser" className="browse-all-advisers-button">
                    Browse All Advisers <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>

                {/* Right side: Featured Adviser and List */}
                <div className="adviser-list-container">
                  <div className="featured-adviser">
                    <img src={topAdvisers[0].imagePath || 'https://placehold.co/120x120/800000/FFFFFF?text=Adviser'} alt={`${topAdvisers[0].firstName} ${topAdvisers[0].lastName}`} />
                    <h4>{topAdvisers[0].firstName} {topAdvisers[0].lastName}</h4>
                    <p>{topAdvisers[0].description || 'No description available.'}</p>
                    {/* View count for the featured adviser */}
                    <div className="featured-adviser-view-count" style = {{marginBottom: '.8rem'}}>
                      {topAdvisers[0].viewCount || 0} <i class="fa-solid fa-chart-simple"></i>
                    </div>
                    <Link to={`/adviser/${topAdvisers[0].adminId}`} className="nominate-button">
                      VIEW
                    </Link>
                  </div>
                  <div className="adviser-list">
                    {topAdvisers.slice(1, 5).map((adviser, index) => ( // Display top 4 after the featured one
                      <Link to={`/adviser/${adviser.adminId}`} key={adviser.adminId || `adviser-list-${Math.random()}`} className="adviser-list-item-link" style={{ textDecoration: 'none' }}>
                        <div className="adviser-list-item">
                          <div className="adviser-rank">#{index + 2}</div> {/* Added rank number */}
                          {/* Ensure image is not underlined */}
                          <img 
                            src={adviser.imagePath || 'https://placehold.co/50x50/800000/FFFFFF?text=A'} 
                            alt={`${adviser.firstName} ${adviser.lastName}`} 
                            style={{ textDecoration: 'none', border: 'none', outline: 'none' }} // Added inline styles
                          />
                          <div className="adviser-info">
                            <h6 style={{ textDecoration: 'none' }}>{adviser.firstName} {adviser.lastName}</h6>
                            {/* Safely access description, providing a fallback empty string and truncating */}
                            <span>{(adviser.description || '').substring(0, 40)}{adviser.description && adviser.description.length > 40 ? '...' : ''}</span> 
                          </div>
                          <div className="adviser-score">
                            {adviser.viewCount || 0} <i class="fa-solid fa-chart-simple"></i>{/* Changed eye icon to heart icon */}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Popular Projects Section (now redesigned as a leaderboard) */}
      <section className="popular-projects-section">
        <div className="container">
          {/* Section Header */}
          <h5 style={{textAlign: 'center', fontSize: '2rem', marginBottom: '0.8rem', color: '#000000', fontWeight: '700'}}>MOST POPULAR SPECIAL PROJECTS</h5>
          <p className="section-description" style={{textAlign: 'center', color: '#555', marginBottom: '2rem', lineHeight: '1.7'}}>Dive into our comprehensive and dynamic collection of Special Projects, a vibrant showcase of cutting-edge research, innovative solutions, and creative endeavors. Each project featured here has undergone a rigorous selection process, chosen for its exceptional originality, meticulous research methodology, profound academic excellence, and significant potential for real-world impact across various disciplines. 
          </p>

          {/* Main Content Area: Featured SP and SP List */}
          {topSPs.length > 0 ? (
            <div className="sp-leaderboard-chart-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Featured Project (Rank #1) */}
              <Link 
                to={`/project/${topSPs[0].spId}`} 
                onClick={() => handleViewCountIncrement(topSPs[0].spId)}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  
                  backgroundColor: 'white',
                  padding: '1rem',
                  paddingTop: '2rem',
                  paddingBottom: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid #eee'
                }}>
                  {/* Rank Number */}
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: '#800000',
                    marginRight: '1rem',
                    minWidth: '50px',
                    textAlign: 'center'
                  }}>
                    1
                  </div>
                  {/* Image Placeholder */}
                  <img 
                    src={`https://placehold.co/80x80/800000/FFFFFF?text=SP`} 
                    alt="Special Project" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '8px', 
                      objectFit: 'cover', 
                      marginRight: '1rem',
                      flexShrink: 0,
                      border: 'none', outline: 'none'
                    }} 
                  />
                  {/* Text Content */}
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <h6 style={{ margin: '0', fontSize: '1.3rem', fontWeight: '700', color: '#333', textDecoration: 'none' }}>{topSPs[0].title || 'Untitled Project'}</h6>
                    <span style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem',marginTop: '.4rem', }}>{topSPs[0].year || 'N/A'} | {topSPs[0].semester || 'N/A'}</span>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#444', lineHeight: '1.5', paddingRight: '2rem' }}> {/* Increased paddingRight to make abstract smaller and create space */}
                      {topSPs[0].description || topSPs[0].abstractText || 'No description available.'}
                    </p>
                  </div>
                  {/* View Count */}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', color: '#800000', marginRight: '1rem', fontWeight: '600' }}>
                    {topSPs[0].viewCount || 0} <i class="fa-solid fa-chart-simple" style={{ paddingLeft:'.5rem', marginRight: '.5rem' }}></i>
                  </div>
                </div>
              </Link>

              {/* Other Popular SPs (Rank #2-#5) */}
              <div className="sp-list-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topSPs.slice(1, 5).map((sp, index) => (
                  <PopularSPListItem 
                    key={sp.spId} 
                    sp={sp} 
                    index={index} 
                    handleViewCountIncrement={handleViewCountIncrement} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>No project data available.</p>
          )}

          {/* Section Footer Button (Only show if there are SPs) */}
          {topSPs.length > 0 && (
            <Link to="/leaderboard/sp" className="browse-popular-sps-button" style={{ marginTop: '2rem' }}>
              Browse All Popular SPs <i className="fas fa-arrow-right"></i>
            </Link>
          )}
        </div>
      </section>

      {/* Browse section with parallax effect and enhanced cards */}
<section className="browse-section"> {/* Removed inline style for background image */}
  <div className="bcontainer">
    <div className="browse-header" >
      <h2>BROWSE RANDOM PROJECTS</h2>
      <button className="refresh-button" onClick={refreshRandomSPs}>
        <i className="fas fa-sync-alt"></i> Refresh
      </button>
    </div>

    
    <div className="browse-carousel">
      <button className="scroll-button left" onClick={scrollLeft} disabled={startIndex === 0}>
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="browse-container" ref={browseContainerRef}>
        {isLoading ? (
          <p className="loading-message">Loading special projects...</p>
        ) : visibleSPs.length === 0 ? (
          <p className="no-projects-message">No special projects found.</p>
        ) : (
          visibleSPs.map((sp) => (
            <div key={sp.spId} className="browse-card">
              <div className="enhanced-sp-card">
                {/* Left Side: Document Preview (Placeholder for now) */}

                {/* Right Side: Document Details */}
                <div className="document-details">
                  <h3 className="card-title">{sp.title || 'Untitled Project'}</h3>
                  <div className="card-meta">
                    <span>{sp.year || 'N/A'} | {sp.semester || 'N/A'}</span>
                    <span className="view-count">
                      {sp.viewCount || 0} <i className="fa-solid fa-chart-simple"></i>
                    </span>
                  </div>
                  <p className="card-description">{sp.description || sp.abstractText || 'No description available.'}</p>
                  
                  <div className="card-tags">
                    {sp.tagIds && Array.isArray(sp.tagIds) ? 
                      getTagsForSp(sp).map((tagName, i) => (
                        <span key={i} className="tag">{tagName}</span>
                      )) : (
                        Array.isArray(sp.tags) ? 
                          sp.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          )) : null
                      )
                    }
                  </div>
                  
                  <Link to={`/project/${sp.spId}`} className="view-details-button" onClick={() => handleViewCountIncrement(sp.spId)} >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button className="scroll-button right" onClick={scrollRight} disabled={startIndex >= randomSPs.length -2}>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</section>
    </div>
  );
}

export default HomePage;
