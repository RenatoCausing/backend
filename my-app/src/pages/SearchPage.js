import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes, FaRobot } from 'react-icons/fa';  
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

   
  const [allTags, setAllTags] = useState([]);
  const [allAdvisers, setAllAdvisers] = useState([]);

  const [activeTags, setActiveTags] = useState([]);  
  const [activeAdvisers, setActiveAdvisers] = useState([]);  

  const [aiQuery, setAiQuery] = useState('');  
  const [isAiProcessing, setIsAiProcessing] = useState(false);  
  const [aiError, setAiError] = useState('');  

   
  const departments = [
    { value: '', label: 'Course' },
    { value: '1', label: 'BSCS' },
    { value: '2', label: 'BSBC' },
    { value: '3', label: 'BSAP' }
     
  ];

   
  const getDepartmentId = (departmentLabel) => {
    const dept = departments.find(d => d.label.toLowerCase() === departmentLabel.toLowerCase());
    return dept ? dept.value : '';  
  };

   
  const getTagIdsFromNames = (tagNames) => {
    const foundTags = allTags.filter(tag =>
      tagNames.some(name => tag.name.toLowerCase() === name.toLowerCase())
    );
    return foundTags.map(tag => tag.id);
  };

   
  const getAdviserIdsFromNames = (adviserNames) => {
    const foundAdvisers = allAdvisers.filter(adviser =>
      adviserNames.some(name => adviser.name.toLowerCase() === name.toLowerCase())
    );
    return foundAdvisers.map(adviser => adviser.id);
  };

   
  useEffect(() => {
    const fetchAllTagsAndAdvisers = async () => {
      try {
        const [tagsResponse, advisersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/tags'),
          axios.get('http://localhost:8080/api/advisers')
        ]);
        setAllTags(tagsResponse.data);  
        setAllAdvisers(advisersResponse.data);  
      } catch (error) {
        console.error('Error fetching all tags or advisers:', error);
         
      }
    };
    fetchAllTagsAndAdvisers();
  }, []);  

   
  const fetchSearchResults = useCallback(async () => {
    const { department, query, year } = searchParams;
    const departmentId = department === '' ? null : parseInt(department);  
    const tagIds = activeTags.length > 0 ? activeTags.map(tag => tag.id) : null;
    const adviserIds = activeAdvisers.length > 0 ? activeAdvisers.map(adviser => adviser.id) : null;
    const searchYear = year === '' ? null : parseInt(year);  

    try {
      const response = await axios.get('http://localhost:8080/api/projects/search', {
        params: {
          adviserIds: adviserIds,
          tagIds: tagIds,
          facultyId: departmentId,
          year: searchYear,  
          searchTerm: query.trim() === '' ? null : query.trim()
        },
        paramsSerializer: {
          indexes: null  
        }
      });
      setSearchResults(response.data);
      setResultCount(response.data.length);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setResultCount(0);
    }
  }, [searchParams, activeTags, activeAdvisers]);  

  useEffect(() => {
     
    fetchSearchResults();
  }, [fetchSearchResults]);


   
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setAiError("Please enter your search criteria for AI.");
      return;
    }

    setIsAiProcessing(true);
    setAiError('');

    try {
       
      const response = await axios.post('http://localhost:3001/api/ai/parse-query', {
        query: aiQuery,
      });

      const aiFilters = response.data;
      console.log("AI Parsed Filters:", aiFilters);

       
      setSearchParams(prevParams => {
        const newParams = { ...prevParams };

        if (aiFilters.year) {
          newParams.year = aiFilters.year.toString();  
        } else {
          newParams.year = '';  
        }

        if (aiFilters.course) {
          newParams.department = getDepartmentId(aiFilters.course);
        } else {
          newParams.department = '';  
        }

         
        if (aiFilters.tags && Array.isArray(aiFilters.tags) && allTags.length > 0) {
          const aiTagNames = aiFilters.tags;
          const newActiveTags = allTags.filter(tag =>
            aiTagNames.some(aiName => tag.name.toLowerCase() === aiName.toLowerCase())
          );
          setActiveTags(newActiveTags);
        } else {
          setActiveTags([]);  
        }

         
        if (aiFilters.adviser && allAdvisers.length > 0) {
          const aiAdviserName = aiFilters.adviser;
          const newActiveAdvisers = allAdvisers.filter(adviser =>
            adviser.name.toLowerCase() === aiAdviserName.toLowerCase()
          );
          setActiveAdvisers(newActiveAdvisers);
        } else {
          setActiveAdvisers([]);  
        }

         
        newParams.query = '';

        return newParams;
      });

      setAiQuery('');  
       
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
      field: '',  
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
            min="1900"  
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