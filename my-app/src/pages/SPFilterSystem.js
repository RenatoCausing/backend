import React, { useState, useEffect, useRef } from 'react';
import '../styles/SPFilterSystem.css';
import Navbar from '../components/NavBar';

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
            if (!sp.tagIds) return false;
            return tagIds.some(tagId => sp.tagIds.includes(tagId));
          });
        }
        
        if (departmentId) {
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
        const adviserData = await SPApiService.fetchAllAdvisers();
        setAdvisers(adviserData || []);
        
        const tagData = await SPApiService.fetchAllTags();
        setTags(tagData || []);
        
        const spData = await SPApiService.fetchAllSPs();
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
  
  // Clear all advisers
  const clearAllAdvisers = () => {
    setSelectedAdvisers([]);
    setAdviserInput('');
  };
  
  // Clear all tags
  const clearAllTags = () => {
    setSelectedTags([]);
    setTagInput('');
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
    if (!sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags.filter(tag => sp.tagIds.includes(tag.tagId));
  };

  return (
    <div><Navbar/>
    <div className="flex w-full justify-center">
    
      <div className="flex w-full max-w-6xl">
        {/* Left Container */}
        <div className="w-14 p-4 border-r border-gray-200">
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
                  className="w-full border border-gray-300 rounded-l p-2 text-sm"
                  placeholder="Search adviser..."
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
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                <div key={adviser.adminId} className="bg-red-800 text-white text-sm rounded px-2 py-1 flex items-center mb-1 mr-1">
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
                  className="w-full border border-gray-300 rounded-l p-2 text-sm"
                  placeholder="Search tags..."
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
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                      <div 
                        key={tag.tagId} 
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                <div key={tag.tagId} className="bg-red-800 text-white text-sm rounded px-2 py-1 flex items-center mb-1 mr-1">
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
        
        {/* Right Container */}
        <div className="w-34 p-4">
          {/* Search and Filter Row */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <select 
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleDepartmentChange}
                value={selectedDepartment}
              >
                <option value="">Department</option>
                <option value="1">BSCS</option>
                <option value="2">BSBC</option>
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
                  placeholder="Search..." 
                  className="flex-1 border border-gray-300 rounded-l p-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-red-800 text-white px-4 rounded-r"
                >
                  🔍
                </button>
              </div>
            </form>
            
            {searchResults && (
              <div className="bg-green-100 p-3 rounded mb-4">
                Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
              </div>
            )}
          </div>
          
          {/* Loading and Error States */}
          {loading && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Loading...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}
          
          {/* SP Results */}
          <div>
            {!loading && filteredSps.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No results found. Try adjusting your filters.
              </div>
            )}
            
            {filteredSps.map(sp => (
              <div key={sp.spId} className="mb-6 border-l-4 border-red-800 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <a href={`/sp/${sp.spId}`} className="text-blue-600 hover:underline">{sp.title}</a>
                </h3>
                
                <div className="text-sm text-gray-600 mb-3 flex flex-wrap gap-6">
                  <span>
                    👤 By {sp.author || 'Unknown Author'}
                  </span>
                  <span>
                    📅 {sp.date || sp.year || 'No Date'}
                  </span>
                  <span>
                    📄 {sp.type || 'Thesis/Dissertation'}
                  </span>
                </div>
                
                <div className="text-sm mb-3">{sp.abstractText || 'No abstract available.'}</div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {getTagsForSp(sp).map(tag => (
                    <span key={tag.tagId} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {tag.tagName}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className={`px-3 py-1 text-sm rounded ${activeTabs[sp.spId] === 'AI' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleTabChange(sp.spId, 'AI')}
                  >
                    AI
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm rounded ${activeTabs[sp.spId] === 'Database' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleTabChange(sp.spId, 'Database')}
                  >
                    Database
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SPFilterSystem;