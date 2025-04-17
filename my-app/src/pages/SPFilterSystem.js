import React, { useState, useEffect, useRef } from 'react';
import '../styles/SPFilterSystem.css';

const SPFilterSystem = () => {
  // State management
  const [advisers, setAdvisers] = useState([]);
  const [tags, setTags] = useState([]);
  const [sps, setSps] = useState([]);
  const [filteredSps, setFilteredSps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedAdvisers, setSelectedAdvisers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  
  // Input states
  const [adviserInput, setAdviserInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Active tab states for each SP
  const [activeTabs, setActiveTabs] = useState({});
  
  // Dropdown visibility
  const [showAdviserDropdown, setShowAdviserDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  // Refs for click outside detection
  const adviserDropdownRef = useRef(null);
  const tagDropdownRef = useRef(null);

  // API service methods
  const SPApiService = {
    fetchAllAdvisers: async () => {
      try {
        const response = await fetch('http://localhost:8080/api/advisers');
        if (!response.ok) {
          throw new Error('Failed to fetch advisers');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching advisers:', error);
        return [];
      }
    },
    
    fetchAllTags: async () => {
      try {
        const response = await fetch('http://localhost:8080/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
    },
    
    fetchAllSPs: async () => {
      try {
        const response = await fetch('http://localhost:8080/api/sp');
        if (!response.ok) {
          throw new Error('Failed to fetch SPs');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching SPs:', error);
        return [];
      }
    },
    
    fetchSPsByTags: async (tagIds) => {
      try {
        const queryParams = tagIds.map(id => `tagIds=${id}`).join('&');
        const response = await fetch(`http://localhost:8080/api/sp/tags?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch SPs by tags');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching SPs by tags:', error);
        return [];
      }
    },
    
    // Combined filtering - server-side if supported, otherwise client-side
    applyFilters: async (filters) => {
      const { adviserIds, tagIds, departmentId, searchTerm } = filters;
      
      // Check if we need to apply any filters
      const hasFilters = (adviserIds && adviserIds.length > 0) || 
                         (tagIds && tagIds.length > 0) || 
                         departmentId || 
                         searchTerm;
      
      if (!hasFilters) {
        // No filters, return all SPs
        return await SPApiService.fetchAllSPs();
      }
      
      try {
        // Try to use server-side filtering first
        const params = new URLSearchParams();
        
        if (adviserIds && adviserIds.length) {
          adviserIds.forEach(id => params.append('adviserIds', id));
        }
        
        if (tagIds && tagIds.length) {
          tagIds.forEach(id => params.append('tagIds', id));
        }
        
        if (departmentId) {
          params.append('facultyId', departmentId);
        }
        
        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }
        
        const response = await fetch(`http://localhost:8080/api/sp/filter?${params.toString()}`);
        
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error('Server-side filtering not supported');
        }
      } catch (error) {
        console.log('Falling back to client-side filtering:', error);
        
        // Fall back to client-side filtering
        let result = await SPApiService.fetchAllSPs();
        
        // Apply filters client-side
        if (adviserIds && adviserIds.length) {
          result = result.filter(sp => adviserIds.includes(sp.adviserId));
        }
        
        if (tagIds && tagIds.length) {
          result = result.filter(sp => {
            // Check if SP has any of the specified tags
            if (!sp.tagIds) return false;
            return tagIds.some(tagId => sp.tagIds.includes(tagId));
          });
        }
        
        if (departmentId) {
          // Filter by department ID
          result = result.filter(sp => {
            if (sp.facultyId) return sp.facultyId === parseInt(departmentId);
            return sp.groupId && sp.groupId === parseInt(departmentId);
          });
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          result = result.filter(sp => 
            (sp.title && sp.title.toLowerCase().includes(term)) ||
            (sp.abstractText && sp.abstractText.toLowerCase().includes(term))
          );
        }
        
        return result;
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch advisers
        const adviserData = await SPApiService.fetchAllAdvisers();
        setAdvisers(adviserData || []);
        
        // Fetch tags
        const tagData = await SPApiService.fetchAllTags();
        setTags(tagData || []);
        
        // Fetch SPs
        const spData = await SPApiService.fetchAllSPs();
        setSps(spData || []);
        setFilteredSps(spData || []);
        
        // Initialize active tabs
        const initialActiveTabs = {};
        if (spData && Array.isArray(spData)) {
          spData.forEach(sp => {
            if (sp && sp.spId) {
              initialActiveTabs[sp.spId] = 'AI';
            }
          });
        }
        setActiveTabs(initialActiveTabs);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adviserDropdownRef.current && !adviserDropdownRef.current.contains(event.target)) {
        setShowAdviserDropdown(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Apply filters whenever filter states change
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        const filters = {
          adviserIds: selectedAdvisers.map(adviser => adviser.adminId),
          tagIds: selectedTags.map(tag => tag.tagId),
          departmentId: selectedDepartment,
          searchTerm: searchTerm
        };
        
        const filteredResults = await SPApiService.applyFilters(filters);
        setFilteredSps(filteredResults || []);
        
        // Update search results info if search term is provided
        if (searchTerm) {
          setSearchResults({
            term: searchTerm,
            count: filteredResults.length
          });
        } else {
          setSearchResults(null);
        }
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (sps.length > 0) {
      applyFilters();
    }
  }, [selectedAdvisers, selectedTags, selectedDepartment, searchTerm, sps]);
  
  // Handle adviser selection
  const handleSelectAdviser = (adviser) => {
    if (!selectedAdvisers.some(a => a.adminId === adviser.adminId)) {
      setSelectedAdvisers([...selectedAdvisers, adviser]);
    }
    setAdviserInput('');
    setShowAdviserDropdown(false);
  };
  
  // Handle tag selection
  const handleSelectTag = (tag) => {
    if (!selectedTags.some(t => t.tagId === tag.tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
  };
  
  // Remove adviser from filter
  const removeAdviser = (adviserId) => {
    setSelectedAdvisers(selectedAdvisers.filter(a => a.adminId !== adviserId));
  };
  
  // Remove tag from filter
  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.tagId !== tagId));
  };
  
  // Handle department selection
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Handle field selection
  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
  };
  
  // Handle tab selection for a specific SP
  const handleTabChange = (spId, tabName) => {
    setActiveTabs(prev => ({
      ...prev,
      [spId]: tabName
    }));
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Search term is already being watched in useEffect
  };
  
  // Filter advisers based on input
  const filteredAdvisers = advisers.filter(adviser => 
    adviser && adviser.lastName && 
    (adviser.lastName.toLowerCase().includes(adviserInput.toLowerCase()) ||
     (adviser.firstName && adviser.firstName.toLowerCase().includes(adviserInput.toLowerCase())))
  );
  
  // Filter tags based on input - show all tags that match the input
  const filteredTags = tags.filter(tag => 
    tag && tag.tagName && 
    tag.tagName.toLowerCase().includes(tagInput.toLowerCase())
  );

  // Format the name for display
  const formatName = (adviser) => {
    if (!adviser) return '';
    const parts = [];
    if (adviser.lastName) parts.push(adviser.lastName);
    if (adviser.firstName) parts.push(adviser.firstName);
    return parts.join(', ');
  };

  // Get tags for an SP
  const getTagsForSp = (sp) => {
    if (!sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags.filter(tag => sp.tagIds.includes(tag.tagId));
  };

  return (
    <div className="sp-filter-system">
      {/* Header Navigation */}
      <div className="header">
        <div className="logo-container">
          <img src="/logo.png" alt="University Logo" className="logo" />
        </div>
        <div className="nav-menu">
          <a href="#" className="nav-item">Search</a>
          <a href="#" className="nav-item">Leaderboard</a>
          <a href="#" className="nav-item">Home</a>
          <a href="#" className="nav-item profile-btn">Profile</a>
        </div>
      </div>
      
      {/* Search and Filter Area */}
      <div className="search-filter-area">
        <form onSubmit={handleSearch} className="search-row">
          <div className="select-container">
            <select 
              className="department-select" 
              onChange={handleDepartmentChange}
              value={selectedDepartment}
            >
              <option value="">Department</option>
              <option value="1">BSCS</option>
              <option value="2">BSBC</option>
              <option value="3">BSAP</option>
            </select>
          </div>
          
          <div className="select-container">
            <select 
              className="field-select"
              onChange={handleFieldChange}
              value={selectedField}
            >
              <option value="">Any Field</option>
              <option value="1">AI</option>
              <option value="2">Database</option>
            </select>
          </div>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
            </button>
          </div>
        </form>
        
        {searchResults && (
          <div className="search-results-info">
            Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
          </div>
        )}
        
        <div className="filters-container">
          {/* Adviser Filter Section */}
          <div className="filter-container">
            <h3 className="filter-title">Advisers</h3>
            <div className="filter-input-wrapper" ref={adviserDropdownRef}>
              <input 
                type="text" 
                className="filter-input"
                placeholder="Search advisers..."
                value={adviserInput}
                onChange={(e) => setAdviserInput(e.target.value)}
                onClick={() => setShowAdviserDropdown(true)}
              />
              {showAdviserDropdown && filteredAdvisers.length > 0 && (
                <div className="dropdown-list">
                  {filteredAdvisers.map(adviser => (
                    <div 
                      key={adviser.adminId} 
                      className="dropdown-item"
                      onClick={() => handleSelectAdviser(adviser)}
                    >
                      {formatName(adviser)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="selected-items">
              {selectedAdvisers.map(adviser => (
                <div key={adviser.adminId} className="selected-item">
                  <span className="item-text">{formatName(adviser)}</span>
                  <button 
                    type="button"
                    className="remove-btn" 
                    onClick={() => removeAdviser(adviser.adminId)}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tags Filter Section */}
          <div className="filter-container">
            <h3 className="filter-title">Tags</h3>
            <div className="filter-input-wrapper" ref={tagDropdownRef}>
              <input 
                type="text" 
                className="filter-input"
                placeholder="Search tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onClick={() => setShowTagDropdown(true)}
              />
              {showTagDropdown && (
                <div className="dropdown-list">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <div 
                        key={tag.tagId} 
                        className="dropdown-item"
                        onClick={() => handleSelectTag(tag)}
                      >
                        {tag.tagName}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item">No matching tags found</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="selected-items">
              {selectedTags.map(tag => (
                <div key={tag.tagId} className="selected-item">
                  <span className="item-text">{tag.tagName}</span>
                  <button 
                    type="button"
                    className="remove-btn" 
                    onClick={() => removeTag(tag.tagId)}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && <div className="loading-message">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* SP Results */}
      <div className="sp-results">
        {!loading && filteredSps.length === 0 && (
          <div className="no-results">No results found. Try adjusting your filters.</div>
        )}
        
        {filteredSps.map(sp => (
          <div key={sp.spId} className="sp-card">
            <h3 className="sp-title">
              <a href={`/sp/${sp.spId}`}>{sp.title}</a>
            </h3>
            
            <div className="sp-meta">
              <span className="meta-item">
                <i className="user-icon">👤</i> By {sp.author || 'Unknown Author'}
              </span>
              <span className="meta-item">
                <i className="calendar-icon">📅</i> {sp.date || sp.year || 'No Date'}
              </span>
              <span className="meta-item">
                <i className="document-icon">📄</i> {sp.type || 'Thesis/Dissertation'}
              </span>
            </div>
            
            <div className="sp-abstract">{sp.abstractText || 'No abstract available.'}</div>
            
            <div className="sp-tags">
              {getTagsForSp(sp).map(tag => (
                <span key={tag.tagId} className="sp-tag">{tag.tagName}</span>
              ))}
            </div>
            
            <div className="sp-tabs">
              <button 
                type="button"
                className={`tab-btn ${activeTabs[sp.spId] === 'AI' ? 'active' : ''}`}
                onClick={() => handleTabChange(sp.spId, 'AI')}
              >
                AI
              </button>
              <button 
                type="button"
                className={`tab-btn ${activeTabs[sp.spId] === 'Database' ? 'active' : ''}`}
                onClick={() => handleTabChange(sp.spId, 'Database')}
              >
                Database
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SPFilterSystem;