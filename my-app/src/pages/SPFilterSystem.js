import React, { useState, useEffect, useRef } from 'react';
import '../styles/SPFilterSystem.css';
import AdviserNavbar from '../components/AdviserNavbar';

const SPFilterSystem = () => {
  // State management
  const [advisers, setAdvisers] = useState([]);
  const [tags, setTags] = useState([]);
  const [sps, setSps] = useState([]);
  const [filteredSps, setFilteredSps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adviserData, setAdviserData] = useState({});
  const [studentGroups, setStudentGroups] = useState({});

  // Filter states
  const [selectedAdvisers, setSelectedAdvisers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
  const searchTimeoutRef = useRef(null);

  // API service methods
  const SPApiService = {
    fetchAdviserById: async (adviserId) => {
      try {
        const response = await fetch(`http://localhost:8080/api/advisers/${adviserId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch adviser with ID ${adviserId}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching adviser ${adviserId}:`, error);
        return null;
      }
    },

    fetchStudentsByGroupId: async (groupId) => {
      try {
        const response = await fetch(`http://localhost:8080/api/students/group/${groupId}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Group with ID ${groupId} not found.`);
            return [];
          }
          throw new Error(`Failed to fetch students for group ID ${groupId}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching students for group ${groupId}:`, error);
        return [];
      }
    },

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
        console.log('Fetching all SPs...');
        const response = await fetch('http://localhost:8080/api/sp');
        if (!response.ok) {
          console.error('Failed to fetch SPs, status:', response.status);
          throw new Error('Failed to fetch SPs');
        }
        const data = await response.json();
        console.log('SPs fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Error fetching SPs:', error);
        return [];
      }
    },

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
          // Fallback to client-side if server-side filtering fails for any reason
          throw new Error('Server-side filtering not supported or failed');
        }
      } catch (error) {
        console.warn('Falling back to client-side filtering:', error);
        // Fall back to client-side filtering
        let result = await SPApiService.fetchAllSPs();

        // Apply filters client-side
        if (adviserIds && adviserIds.length) {
          result = result.filter(sp => sp.adviserId && adviserIds.includes(sp.adviserId));
        }

        if (tagIds && tagIds.length) {
          result = result.filter(sp => {
            if (!sp.tagIds) return false;
            return tagIds.some(tagId => sp.tagIds.includes(tagId));
          });
        }

        if (departmentId) {
          // Client-side filtering by faculty/department
          const derivedDeptId = parseInt(departmentId, 10);
          result = result.filter(sp => {
            if (sp.authors && Array.isArray(sp.authors) && sp.authors.length > 0) {
              const firstAuthor = sp.authors[0];
              if (firstAuthor && firstAuthor.facultyId === derivedDeptId) {
                return true;
              }
            }
            return false;
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

  // Implement debouncing for search term
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for 300ms
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    // Cleanup on unmount or when searchTerm changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Parse URL parameters when component mounts
  useEffect(() => {
    const parseUrlParams = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const tagParam = queryParams.get('tag');

      if (tagParam && tags.length > 0) {
        // Find tag by name (decodeURIComponent to handle spaces and special characters)
        const decodedTagName = decodeURIComponent(tagParam);
        const matchedTag = tags.find(tag =>
          tag.tagName && tag.tagName.toLowerCase() === decodedTagName.toLowerCase()
        );

        if (matchedTag && !selectedTags.some(t => t.tagId === matchedTag.tagId)) {
          setSelectedTags([...selectedTags, matchedTag]);
        }
      }
    };

    if (tags.length > 0) {
      parseUrlParams();
    }
  }, [tags]);

  useEffect(() => {
    const fetchAdviserDetails = async () => {
      const adviserIds = filteredSps
        .filter(sp => sp.adviserId)
        .map(sp => sp.adviserId);

      // Remove duplicates
      const uniqueAdviserIds = [...new Set(adviserIds)];

      const adviserPromises = uniqueAdviserIds.map(id => SPApiService.fetchAdviserById(id));
      const results = await Promise.all(adviserPromises);

      const adviserMap = {};
      results.forEach(adviser => {
        if (adviser && adviser.adminId) {
          adviserMap[adviser.adminId] = adviser;
        }
      });

      setAdviserData(adviserMap);
    };

    if (filteredSps.length > 0) {
      fetchAdviserDetails();
    }
  }, [filteredSps]);

  useEffect(() => {
    const fetchStudentGroups = async () => {
      const groupIds = filteredSps
        .filter(sp => sp.groupId != null)
        .map(sp => sp.groupId);

      const uniqueGroupIds = [...new Set(groupIds)];

      const groupMap = {};
      for (const groupId of uniqueGroupIds) {
        if (!isNaN(groupId)) {
          const students = await SPApiService.fetchStudentsByGroupId(groupId);
          groupMap[groupId] = students || [];
        }
      }

      setStudentGroups(groupMap);
    };

    if (filteredSps.length > 0) {
      fetchStudentGroups();
    }
  }, [filteredSps]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        console.log('Fetching all data...');

        const adviserData = await SPApiService.fetchAllAdvisers();
        setAdvisers(adviserData || []);

        const tagData = await SPApiService.fetchAllTags();
        setTags(tagData || []);

        const spData = await SPApiService.fetchAllSPs();
        console.log('SP data fetched:', spData);
        setSps(spData || []);
        setFilteredSps(spData || []);

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
        setInitialLoading(false);
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

  // Apply filters whenever filter states change - use debouncedSearchTerm instead of searchTerm
  useEffect(() => {
    const applyFilters = async () => {
      // Don't show loading indicator during search filtering
      // setLoading(true); - REMOVED to avoid twitchy UI
      try {
        const filters = {
          adviserIds: selectedAdvisers.map(adviser => adviser.adminId),
          tagIds: selectedTags.map(tag => tag.tagId),
          departmentId: selectedDepartment,
          searchTerm: debouncedSearchTerm
        };

        const filteredResults = await SPApiService.applyFilters(filters);
        setFilteredSps(filteredResults || []);

        if (debouncedSearchTerm) {
          setSearchResults({
            term: debouncedSearchTerm,
            count: filteredResults.length
          });
        } else {
          setSearchResults(null);
        }
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters. Please try again.');
      }
    };
    if (sps.length > 0) {
      applyFilters();
    }
  }, [selectedAdvisers, selectedTags, selectedDepartment, debouncedSearchTerm, sps]);

  // Helper functions
  const getAdviserName = (adviserId) => {
    const adviser = adviserData[adviserId];
    if (!adviser) return 'Unknown Adviser';

    return `${adviser.lastName || ''}${adviser.firstName ? ', ' + adviser.firstName : ''}`;
  };

  const mapFacultyIdToDepartmentName = (facultyId) => {
    const facultyMap = {
      1: 'BSBC',
      2: 'BSCS',
      3: 'BSAP'
    };
    return facultyMap[facultyId] || 'Unknown Department';
  };

  const getAuthors = (sp) => {
    // If we have authors array directly from DTO, use it
    if (sp.authors && Array.isArray(sp.authors) && sp.authors.length > 0) {
      if (typeof sp.authors[0] === 'string') {
        return sp.authors.join('; ');
      }
      if (typeof sp.authors[0] === 'object' && sp.authors[0] !== null) {
        return sp.authors
          .map(author => `${author.lastName || ''}${author.firstName ? ', ' + author.firstName : ''}`)
          .join('; ');
      }
    }
    // Check if there's a group ID with associated students
    else if (sp.groupId != null && studentGroups[sp.groupId] && Array.isArray(studentGroups[sp.groupId])) {
      const students = studentGroups[sp.groupId];
      if (students.length > 0) {
        return students
          .map(student => `${student.lastName || ''}${student.firstName ? ', ' + student.firstName : ''}`)
          .join('; ');
      }
    }
    // If there's a direct author field, use it
    else if (sp.author) {
      return sp.author;
    }

    return 'Unknown Author';
  };

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
    // Update URL to remove the tag if needed
    const url = new URL(window.location);
    const currentTag = selectedTags.find(t => t.tagId === tagId);
    if (currentTag) {
      const tagParam = url.searchParams.get('tag');
      if (tagParam && tagParam.toLowerCase() === encodeURIComponent(currentTag.tagName).toLowerCase()) {
        url.searchParams.delete('tag');
        window.history.pushState({}, '', url);
      }
    }
  };

  // Handle tag clicks
  const handleTagClick = (tagName) => {
    // Find the tag object by name
    const tag = tags.find(t => t.tagName === tagName);
    if (tag && !selectedTags.some(t => t.tagId === tag.tagId)) {
      setSelectedTags([...selectedTags, tag]);
      // Optionally update URL to reflect the tag selection
      const url = new URL(window.location);
      url.searchParams.set('tag', encodeURIComponent(tagName));
      window.history.pushState({}, '', url);
    }
  };

  // Clear all advisers
  const clearAllAdvisers = () => {
    setSelectedAdvisers([]);
    setAdviserInput('');
  };

  // Clear all tags
  const clearAllTags = () => {
    setSelectedTags([]);
    setTagInput('');
    // Remove tag parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('tag');
    window.history.pushState({}, '', url);
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
    // The debounce effect will handle the search when the input changes
  };

  // Filter advisers based on input
  const filteredAdvisers = advisers.filter(adviser =>
    adviser && adviser.lastName &&
    (adviser.lastName.toLowerCase().includes(adviserInput.toLowerCase()) ||
     (adviser.firstName && adviser.firstName.toLowerCase().includes(adviserInput.toLowerCase())))
  );

  // Filter tags based on input
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
    if (!sp || !sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags
      .filter(tag => tag && sp.tagIds.includes(tag.tagId))
      .map(tag => tag?.tagName || 'Unknown Tag');
  };

  return (
    <div className="sp-filter-panel-container">
      {/* Adviser Navbar */}
      <div><AdviserNavbar/></div>
      
      <div className="flex w-full max-w-6xl mx-auto" style={{backgroundColor: 'white'}}>
        {/* Left Sidebar - Filter Section */}
        <div className="w-14 p-4 border-r border-gray-200" style={{backgroundColor: 'white'}}>
          {/* Logo */}
          <div className="mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/University_of_the_Philippines_Manila_Seal.svg/640px-University_of_the_Philippines_Manila_Seal.svg.png" alt="University Logo" className="w-48 mx-auto" />
          </div>

          {/* Adviser Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2">Advisers</h3>
            <div className="relative mb-2" ref={adviserDropdownRef}>
              <div className="flex">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-l p-2 text-dm"
                  placeholder="Search adviser"
                  value={adviserInput}
                  onChange={(e) => setAdviserInput(e.target.value)}
                  onClick={() => setShowAdviserDropdown(true)}
                />
                <button
                  className="bg-red-700 text-white px-2 rounded-r"
                  onClick={clearAllAdvisers}
                >
                  ×
                </button>
              </div>

              {showAdviserDropdown && filteredAdvisers.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto">
                  {filteredAdvisers.map(adviser => (
                    <div
                      key={adviser.adminId}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-dm"
                      onClick={() => handleSelectAdviser(adviser)}
                    >
                      {formatName(adviser)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {selectedAdvisers.map(adviser => (
                <div key={adviser.adminId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                  {adviser.lastName}{adviser.firstName && `, ${adviser.firstName}`}
                  <span className="ml-1 text-xs">{adviser.count || ''}</span>
                  <button
                    className="ml-2 text-white font-bold"
                    onClick={() => removeAdviser(adviser.adminId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <h3 className="text-lg font-bold mb-2">Tags</h3>
            <div className="relative mb-2" ref={tagDropdownRef}>
              <div className="flex">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-l p-2 text-dm"
                  placeholder="Search tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onClick={() => setShowTagDropdown(true)}
                />
                <button
                  className="bg-red-700 text-white px-2 rounded-r"
                  onClick={clearAllTags}
                >
                  ×
                </button>
              </div>

              {showTagDropdown && (
                <div
                  className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <div
                        key={tag.tagId}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-dm"
                        onClick={() => handleSelectTag(tag)}
                      >
                        {tag.tagName}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No matching tags</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
              {selectedTags.map(tag => (
                <div key={tag.tagId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                  {tag.tagName}
                  <span className="ml-1 text-xs">{tag.count || ''}</span>
                  <button
                    className="ml-2 text-white font-bold"
                    onClick={() => removeTag(tag.tagId)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Central SP Results Container */}
        <div className="w-34 p-4" style={{backgroundColor: 'white'}}>
          {/* Search and Filter Row */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 mb-9">
              <select
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleDepartmentChange}
                value={selectedDepartment}
              >
                <option value="">Department</option>
                <option value="1">BSBC</option>
                <option value="2">BSCS</option>
                <option value="3">BSAP</option>
              </select>

              <select
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleFieldChange}
                value={selectedField}
              >
                <option value="">Any Field</option>
                <option value="1">AI</option>
                <option value="2">Database</option>
              </select>

              <div className="flex flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 border border-gray-300 rounded-l p-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-red-800 text-white px-4 rounded-r"
                >
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </form>

            {searchResults && (
              <div className="bg-green-100 p-3 rounded">
                Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
              </div>
            )}
          </div>

          {/* Loading and Error States - Only show loading during initial load */}
          {initialLoading && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}

          {/* SP Results */}
          <div style={{width: '100%', backgroundColor: 'white'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {!initialLoading && filteredSps.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No results found. Try adjusting your filters.
              </div>
            )}

            {filteredSps.map((sp, index) => (
              <div key={sp.spId} className="relative">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    <a href={`/project/${sp.spId}`} className="text-blue-600 hover:underline">{sp.title || 'Untitled Project'}</a>
                  </h3>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4">
                      <i className="fa-solid fa-pen-to-square"></i>
                      {getAuthors(sp)}
                    </span>
                    <span className="mr-4">
                      <i className="fa-regular fa-clock"></i>
                      {sp.dateIssued || sp.year || 'No Date'}
                    </span>
                    <span>
                      <i className="fa-solid fa-user"></i>
                      {sp.adviserId ? getAdviserName(sp.adviserId) : 'Unknown Adviser'}
                    </span>
                  </div>

                  <div className="text-sm mb-3">{sp.abstractText || 'No abstract available.'}</div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {getTagsForSp(sp).map((tagName, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-300"
                        onClick={() => handleTagClick(tagName)}
                      >
                        {tagName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Custom divider with editable color/opacity */}
                {index < filteredSps.length - 1 && (
                  <div
                    className="sp-divider"
                    style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SPFilterSystem;