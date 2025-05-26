import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes, FaRobot } from 'react-icons/fa'; // Add FaRobot icon
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    department: '', // This should map to facultyId in backend
    field: '',     // This might be part of the general query
    query: '',     // General text search term
    year: '',      // New: Year filter
    tags: []       // This state is not directly used for active tags, activeTags handles it.
  });

  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  // States for all available tags and advisers fetched from backend
  const [allTags, setAllTags] = useState([]);
  const [allAdvisers, setAllAdvisers] = useState([]);

  const [activeTags, setActiveTags] = useState([]); // Selected tags by user
  const [activeAdvisers, setActiveAdvisers] = useState([]); // Selected advisers by user

  const [aiQuery, setAiQuery] = useState(''); // User's natural language AI query
  const [isAiProcessing, setIsAiProcessing] = useState(false); // AI loading state
  const [aiError, setAiError] = useState(''); // AI error state

  // Dummy data for departments, replace with actual fetch if dynamic
  const departments = [
    { value: '', label: 'Course' },
    { value: '1', label: 'BSCS' },
    { value: '2', label: 'BSBC' },
    { value: '3', label: 'BSAP' }
    // Add more departments as per your faculty IDs
  ];

  // Helper to map department label to ID (from your `departments` array)
  const getDepartmentId = (departmentLabel) => {
    const dept = departments.find(d => d.label.toLowerCase() === departmentLabel.toLowerCase());
    return dept ? dept.value : ''; // Return value (ID) or empty string
  };

  // Helper to get Tag IDs from names, using the fetched `allTags`
  const getTagIdsFromNames = (tagNames) => {
    const foundTags = allTags.filter(tag =>
      tagNames.some(name => tag.name.toLowerCase() === name.toLowerCase())
    );
    return foundTags.map(tag => tag.id);
  };

  // Helper to get Adviser IDs from names, using the fetched `allAdvisers`
  const getAdviserIdsFromNames = (adviserNames) => {
    const foundAdvisers = allAdvisers.filter(adviser =>
      adviserNames.some(name => adviser.name.toLowerCase() === name.toLowerCase())
    );
    return foundAdvisers.map(adviser => adviser.id);
  };

  // --- Fetching all Tags and Advisers on Mount ---
  useEffect(() => {
    const fetchAllTagsAndAdvisers = async () => {
      try {
        const [tagsResponse, advisersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/tags'),
          axios.get('http://localhost:8080/api/advisers')
        ]);
        setAllTags(tagsResponse.data); // Assuming data is [{id: 1, name: 'Tag Name'}, ...]
        setAllAdvisers(advisersResponse.data); // Assuming data is [{id: 101, name: 'Adviser Name'}, ...]
      } catch (error) {
        console.error('Error fetching all tags or advisers:', error);
        // Handle error, e.g., show a message to the user
      }
    };
    fetchAllTagsAndAdvisers();
  }, []); // Run once on component mount

  // --- Main Search Results Fetching ---
  const fetchSearchResults = useCallback(async () => {
    const { department, query, year } = searchParams;
    const departmentId = department === '' ? null : parseInt(department); // Convert to int or null
    const tagIds = activeTags.length > 0 ? activeTags.map(tag => tag.id) : null;
    const adviserIds = activeAdvisers.length > 0 ? activeAdvisers.map(adviser => adviser.id) : null;
    const searchYear = year === '' ? null : parseInt(year); // Convert year to int or null

    try {
      const response = await axios.get('http://localhost:8080/api/projects/search', {
        params: {
          adviserIds: adviserIds,
          tagIds: tagIds,
          facultyId: departmentId,
          year: searchYear, // Pass the year filter
          searchTerm: query.trim() === '' ? null : query.trim()
        },
        paramsSerializer: {
          indexes: null // Correctly serialize array parameters (e.g., adviserIds=1&adviserIds=2)
        }
      });
      setSearchResults(response.data);
      setResultCount(response.data.length);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setResultCount(0);
    }
  }, [searchParams, activeTags, activeAdvisers]); // Dependencies for useCallback

  useEffect(() => {
    // Trigger search when searchParams or active filters change
    fetchSearchResults();
  }, [fetchSearchResults]);


  // --- AI Search Integration ---
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setAiError("Please enter your search criteria for AI.");
      return;
    }

    setIsAiProcessing(true);
    setAiError('');

    try {
      // Call your Java backend's AI parsing endpoint
      const response = await axios.post('http://localhost:3001/api/ai/parse-query', {
        query: aiQuery,
      });

      const aiFilters = response.data;
      console.log("AI Parsed Filters:", aiFilters);

      // Update searchParams and active filters based on AI output
      setSearchParams(prevParams => {
        const newParams = { ...prevParams };

        if (aiFilters.year) {
          newParams.year = aiFilters.year.toString(); // Year input expects a string
        } else {
          newParams.year = ''; // Clear year if AI doesn't specify
        }

        if (aiFilters.course) {
          newParams.department = getDepartmentId(aiFilters.course);
        } else {
          newParams.department = ''; // Clear department if AI doesn't specify
        }

        // --- Handle Tags from AI ---
        if (aiFilters.tags && Array.isArray(aiFilters.tags) && allTags.length > 0) {
          const aiTagNames = aiFilters.tags;
          const newActiveTags = allTags.filter(tag =>
            aiTagNames.some(aiName => tag.name.toLowerCase() === aiName.toLowerCase())
          );
          setActiveTags(newActiveTags);
        } else {
          setActiveTags([]); // Clear tags if AI doesn't specify or lookup fails
        }

        // --- Handle Adviser from AI ---
        if (aiFilters.adviser && allAdvisers.length > 0) {
          const aiAdviserName = aiFilters.adviser;
          const newActiveAdvisers = allAdvisers.filter(adviser =>
            adviser.name.toLowerCase() === aiAdviserName.toLowerCase()
          );
          setActiveAdvisers(newActiveAdvisers);
        } else {
          setActiveAdvisers([]); // Clear adviser if AI doesn't specify or lookup fails
        }

        // Clear general query if AI is providing specific filters
        newParams.query = '';

        return newParams;
      });

      setAiQuery(''); // Clear AI query input after processing
      // fetchSearchResults will be triggered by useEffect due to searchParams/activeTags/activeAdvisers changes
    } catch (error) {
      console.error("Error parsing AI query:", error);
      setAiError("Failed to parse AI query. Please try again or refine your input.");
      if (error.response && error.response.data && error.response.data.details) {
        setAiError(`Failed to parse AI query: ${error.response.data.details}`);
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleTagClick = (tag) => {
    setActiveTags(prev => {
      if (prev.some(t => t.id === tag.id)) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleAdviserClick = (adviser) => {
    setActiveAdvisers(prev => {
      if (prev.some(a => a.id === adviser.id)) {
        return prev.filter(a => a.id !== adviser.id);
      } else {
        return [...prev, adviser];
      }
    });
  };

  const handleClearFilters = () => {
    setSearchParams({
      department: '',
      field: '', // 'field' is not directly used for filtering in backend, but kept for consistency if UI uses it.
      query: '',
      year: '',
      tags: []
    });
    setActiveTags([]);
    setActiveAdvisers([]);
    setAiQuery('');
    setAiError('');
  };

  return (
    <div className="search-page-container">
      <div className="search-sidebar">
        <h2 className="sidebar-title">Filters</h2>

        {/* AI Search Section */}
        <div className="filter-section ai-search-section">
          <h3><FaRobot /> AI Search</h3>
          <input
            type="text"
            className="ai-query-input"
            placeholder="e.g., 'projects from 2023 on AI from BSCS by John Doe'"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            disabled={isAiProcessing}
          />
          <button
            onClick={handleAiSearch}
            className="ai-search-button"
            disabled={isAiProcessing}
          >
            {isAiProcessing ? 'Thinking...' : 'Analyze with AI'}
          </button>
          {aiError && <p className="ai-error-message">{aiError}</p>}
        </div>

        <div className="filter-section">
          <h3>Text Search</h3>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, keywords..."
            name="query"
            value={searchParams.query}
            onChange={handleChange}
          />
        </div>

        <div className="filter-section">
          <h3>Course/Faculty</h3>
          <select
            className="select-filter"
            name="department"
            value={searchParams.department}
            onChange={handleChange}
          >
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
        </div>

        {/* New Year Filter */}
        <div className="filter-section">
          <h3>Year</h3>
          <input
            type="number"
            className="year-input"
            placeholder="e.g., 2023"
            name="year"
            value={searchParams.year}
            onChange={handleChange}
            min="1900" // Adjust min/max as appropriate for your data
            max={new Date().getFullYear()}
          />
        </div>

        <div className="filter-section">
          <h3>Popular Tags</h3>
          <div className="tag-list">
            {/* Render `allTags` here for popular tags */}
            {allTags.map((tag) => (
              <span
                key={tag.id}
                className={`tag-item ${activeTags.some(t => t.id === tag.id) ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </span>
            ))}
          </div>
          {activeTags.length > 0 && (
            <div className="selected-filters mt-2">
              <h4>Selected Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {activeTags.map(tag => (
                  <span key={tag.id} className="selected-filter-item">
                    {tag.name} <FaTimes onClick={() => handleTagClick(tag)} className="remove-filter-icon" />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="filter-section">
          <h3>Popular Advisers</h3>
          <div className="adviser-list">
            {/* Render `allAdvisers` here for popular advisers */}
            {allAdvisers.map((adviser) => (
              <span
                key={adviser.id}
                className={`adviser-item ${activeAdvisers.some(a => a.id === adviser.id) ? 'active' : ''}`}
                onClick={() => handleAdviserClick(adviser)}
              >
                {adviser.name}
              </span>
            ))}
          </div>
          {activeAdvisers.length > 0 && (
            <div className="selected-filters mt-2">
              <h4>Selected Advisers:</h4>
              <div className="flex flex-wrap gap-2">
                {activeAdvisers.map(adviser => (
                  <span key={adviser.id} className="selected-filter-item">
                    {adviser.name} <FaTimes onClick={() => handleAdviserClick(adviser)} className="remove-filter-icon" />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleClearFilters} className="clear-filters-button">
          Clear All Filters <FaTimes />
        </button>
      </div>

      <div className="search-results-main">
        <h2 className="results-header">Search Results ({resultCount})</h2>
        <div className="results-list">
          {searchResults.length > 0 ? (
            searchResults.map((sp) => (
              <div key={sp.spId} className="search-result-card">
                <h3>{sp.title}</h3>
                <p><strong>Adviser:</strong> {sp.adviserName}</p>
                <p><strong>Course:</strong> {sp.facultyName}</p>
                <p><strong>Year:</strong> {sp.year}</p>
                <div className="tags">
                  {sp.tags && sp.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="description">{sp.description || sp.abstractText || 'No description available.'}</p>
                <a href={`/project/${sp.spId}`} className="view-details">View Details</a>
              </div>
            ))
          ) : (
            <p className="no-results-message">No projects found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;