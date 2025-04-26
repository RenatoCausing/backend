import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    department: '',
    field: '',
    query: '',
    year: '',
    tags: []
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [popularTags, setPopularTags] = useState([]);
  const [popularAdvisers, setPopularAdvisers] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [activeAdvisers, setActiveAdvisers] = useState([]);
  
  // Fields for dropdown
  const fields = [
    { value: '', label: 'Any Field' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'keywords', label: 'Keywords' },
    { value: 'year', label: 'Year' }
  ];

  // Departments for dropdown
  const departments = [
    { value: '', label: 'Department' },
    { value: '1', label: 'BSCS' },
    { value: '2', label: 'BSBC' },
    { value: '3', label: 'BSAP' }
  ];
  
  useEffect(() => {
    // Fetch popular tags
    axios.get('http://localhost:8080/api/tags/popular')
      .then(response => {
        setPopularTags(response.data);
      })
      .catch(error => console.error('Error fetching popular tags:', error));
    
    // Fetch popular advisers
    axios.get('http://localhost:8080/api/sp/top-advisers')
      .then(response => {
        setPopularAdvisers(response.data);
      })
      .catch(error => console.error('Error fetching popular advisers:', error));
  }, []);
  
  useEffect(() => {
    // Perform search whenever search parameters change
    performSearch();
  }, [searchParams.department, activeTags, activeAdvisers]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };
  
  const performSearch = () => {
    // Construct query parameters
    const params = new URLSearchParams();
    
    if (searchParams.department) {
      params.append('facultyId', searchParams.department);
    }
    
    if (searchParams.field) {
      params.append('field', searchParams.field);
    }
    
    if (searchParams.query) {
      params.append('query', searchParams.query);
    }
    
    if (searchParams.year) {
      params.append('year', searchParams.year);
    }
    
    // Add selected tags
    activeTags.forEach(tag => {
      params.append('tagIds', tag.id);
    });
    
    // Add selected advisers
    activeAdvisers.forEach(adviser => {
      params.append('adviserIds', adviser.adviserId);
    });
    
    // Make the API call
    axios.get(`http://localhost:8080/api/sp/search?${params.toString()}`)
      .then(response => {
        setSearchResults(response.data);
        setResultCount(response.data.length);
      })
      .catch(error => console.error('Error searching SPs:', error));
  };

  const toggleTag = (tag) => {
    if (activeTags.some(t => t.id === tag.id)) {
      setActiveTags(activeTags.filter(t => t.id !== tag.id));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };
  
  const removeTag = (tag) => {
    setActiveTags(activeTags.filter(t => t.id !== tag.id));
  };
  
  const toggleAdviser = (adviser) => {
    if (activeAdvisers.some(a => a.adviserId === adviser.adviserId)) {
      setActiveAdvisers(activeAdvisers.filter(a => a.adviserId !== adviser.adviserId));
    } else {
      setActiveAdvisers([...activeAdvisers, adviser]);
    }
  };
  
  const removeAdviser = (adviser) => {
    setActiveAdvisers(activeAdvisers.filter(a => a.adviserId !== adviser.adviserId));
  };
  const handleViewCountIncrement = async (spId) => {
    console.log(`Attempting to increment view count for SP ID: ${spId}`); // Keep this log
    console.log("Click handler triggered on <a> tag"); // <-- Add this new log
    try {
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented successfully for SP ID: ${spId}`);
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
    }
  };
  return (
    <div className="search-page">
      <div className="search-container">
        <div className="logo-container">
          <img src="/university-logo.png" alt="University Logo" className="university-logo" />
        </div>
        
        <div className="search-filters">
          <div className="active-filters">
            {activeTags.length > 0 && (
              <div className="active-tags">
                {activeTags.map(tag => (
                  <span key={tag.id} className="active-tag">
                    {tag.name}
                    <button onClick={() => removeTag(tag)} className="remove-btn">
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {activeAdvisers.length > 0 && (
              <div className="active-advisers">
                {activeAdvisers.map(adviser => (
                  <span key={adviser.adviserId} className="active-adviser">
                    {adviser.firstName} {adviser.lastName}
                    <button onClick={() => removeAdviser(adviser)} className="remove-btn">
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSearch} className="search-form">
            <select 
              name="department"
              value={searchParams.department}
              onChange={handleInputChange}
              className="filter-select"
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
            
            <select 
              name="field"
              value={searchParams.field}
              onChange={handleInputChange}
              className="filter-select"
            >
              {fields.map(field => (
                <option key={field.value} value={field.value}>{field.label}</option>
              ))}
            </select>
            
            <div className="search-input-container">
              <input
                type="text"
                name="query"
                value={searchParams.query}
                onChange={handleInputChange}
                placeholder="Search for special projects..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
        
        {searchResults.length > 0 && (
          <div className="search-results-summary">
            Your search for <strong>{searchParams.query}</strong> returned <strong>{resultCount}</strong> records.
          </div>
        )}
        
        <div className="search-results">
          {searchResults.map(sp => (
            <div key={sp.spId} className="search-result-item">
              <a href={`/sp/${sp.spId}`} className="sp-title" onClick={() => handleViewCountIncrement(sp.spId)}>{sp.title}</a>
              <div className="sp-metadata">
                <span>By {sp.authors.join(", ")}</span>
                <span className="sp-date">📅 {sp.year}</span>
                <span>📄 {sp.documentType}</span>
              </div>
              <p className="sp-abstract">{sp.abstract}</p>
              <div className="filter-tabs">
                <span className="filter-tab active">AI</span>
                <span className="filter-tab">Database</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <aside className="sidebar">
        <section className="popular-advisers">
          <h2>Popular Advisers</h2>
          <ul className="adviser-list">
            {popularAdvisers.map(adviser => (
              <li 
                key={adviser.adviserId} 
                className={activeAdvisers.some(a => a.adviserId === adviser.adviserId) ? 'active' : ''}
                onClick={() => toggleAdviser(adviser)}
              >
                <div className="adviser-info">
                  <img 
                    src={adviser.imagePath || '/default-avatar.png'} 
                    alt={`${adviser.firstName} ${adviser.lastName}`} 
                    className="adviser-image"
                  />
                  <span className="adviser-name">{adviser.firstName} {adviser.lastName}</span>
                </div>
                <span className="count-badge">× {adviser.projectCount || 0}</span>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="popular-tags">
          <h2>Popular Tags</h2>
          <ul className="tag-list">
            {popularTags.map(tag => (
              <li 
                key={tag.id} 
                className={activeTags.some(t => t.id === tag.id) ? 'active' : ''}
                onClick={() => toggleTag(tag)}
              >
                <span className="tag-name">{tag.name}</span>
                <span className="count-badge">× {tag.count || 0}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default SearchPage;