import axios from 'axios';

import React, { useState, useEffect, useRef } from 'react';
import '../styles/SPFilterSystem.css';
import AdviserNavbar from '../components/AdviserNavbar';

// Import Pagination and Select/FormControl/InputLabel from MUI
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
// You might also need InputLabel if you use it with FormControl for the Select
// import InputLabel from '@mui/material/InputLabel';

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

  const [filterLoading, setFilterLoading] = useState(false); // Keep this state
  const filterLoadingTimerRef = useRef(null); // <-- NEW: Ref to hold the timer ID
  // Pagination state (using 1-indexed page for MUI Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default items per page

  // Calculate total pages and items for the current page
  const totalItems = filteredSps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSps.slice(indexOfFirstItem, indexOfLastItem);


  // Sorting state
  const [sortBy, setSortBy] = useState('dateIssued'); // Default sort option
  const [sortDirection, setSortDirection] = useState('desc'); // Default direction (descending)

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

  // --- Pagination Handlers ---
   const handlePageChange = (event, value) => {
    setCurrentPage(value); // value is the 1-indexed page number from Pagination
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page when rows per page changes
  };


  // Updated sorting function (from SPFilterPanel)
  const sortSPs = (sps) => {
    if (!sps || !Array.isArray(sps)) return [];

    return [...sps].sort((a, b) => {
      let valueA, valueB;

      switch(sortBy) {
        case 'yearSemester':
          valueA = a.year || '';
          valueB = b.year || '';
          break;
        case 'dateIssued':
          valueA = a.dateIssued || '';
          valueB = b.dateIssued || '';
          break;
        case 'alphabetical':
          valueA = a.title || '';
          valueB = b.title || '';
          break;
        default:
          valueA = a.dateIssued || '';
          valueB = b.dateIssued || '';
      }

      // Parse dates if sorting by date
      if (sortBy === 'dateIssued') {
        const dateA = valueA ? new Date(valueA) : new Date(0);
        const dateB = valueB ? new Date(valueB) : new Date(0);

        const isValidDateA = !isNaN(dateA.getTime());
        const isValidDateB = !isNaN(dateB.getTime());

        if (!isValidDateA && !isValidDateB) return 0;
        if (!isValidDateA) return sortDirection === 'asc' ? -1 : 1;
        if (!isValidDateB) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }

      // Handle year and semester specially (assuming semester is a string like '1st', '2nd', 'midyear')
      if (sortBy === 'yearSemester') {
        const yearA = parseInt(valueA, 10) || 0;
        const yearB = parseInt(valueB, 10) || 0;

        if (yearA !== yearB) {
          return sortDirection === 'asc' ? yearA - yearB : yearB - yearA;
        }

        const semesterOrder = { '1st': 1, '2nd': 2, 'midyear': 3 };
        const semA = semesterOrder[a.semester?.toLowerCase()] || 0;
        const semB = semesterOrder[b.semester?.toLowerCase()] || 0;

        return sortDirection === 'asc' ? semA - semB : semB - semA;
      }


      // Compare as strings for other fields
      const stringA = String(valueA || '').toLowerCase();
      const stringB = String(valueB || '').toLowerCase();

      if (sortDirection === 'asc') {
        return stringA.localeCompare(stringB);
      } else {
        return stringB.localeCompare(stringA);
      }
    });
  };


  // API service methods (simplified, you might want a dedicated service file)
   const SPApiService = {
     fetchAdviserById: async (adviserId) => {
       try {
         const response = await fetch(`http://localhost:8080/api/advisers/${adviserId}`);
         if (!response.ok) {
           console.error(`Failed to fetch adviser with ID ${adviserId}`, response.status);
           return null;
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
           throw new Error(`Failed to fetch students for group ID ${groupId}, status: ${response.status}`);
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
            console.error('Failed to fetch advisers, status:', response.status);
            throw new Error('Failed to fetch advisers');
         }
         const data = await response.json();
         console.debug("Fetched Advisers:", data);
         return data;
       } catch (error) {
         console.error('Error fetching advisers:', error);
         return [];
       }
     },

     fetchAllTags: async () => {
       try {
         const response = await fetch('http://localhost:8080/api/tags');
         if (!response.ok) {
            console.error('Failed to fetch tags, status:', response.status);
            throw new Error('Failed to fetch tags');
         }
          const data = await response.json();
          console.debug("Fetched Tags:", data);
         return data;
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
       const hasFilters = (adviserIds && adviserIds.length > 0) || (tagIds && tagIds.length > 0) ||
                          departmentId || searchTerm;
       if (!hasFilters) {
         // If no filters are applied, fetch all SPs
         return await SPApiService.fetchAllSPs();
       }

       try {
         // Attempt server-side filtering first
         const params = new URLSearchParams();
         if (adviserIds && adviserIds.length) {
           adviserIds.forEach(id => params.append('adviserIds', id));
         }

         if (tagIds && tagIds.length) {
           tagIds.forEach(id => params.append('tagIds', id));
         }

         if (departmentId) {
            // Assuming departmentId maps to facultyId on the backend for filtering
           params.append('facultyId', departmentId);
         }

         if (searchTerm) {
           params.append('searchTerm', searchTerm);
         }

         console.log("Applying filters with params:", params.toString());

         const response = await fetch(`http://localhost:8080/api/sp/filter?${params.toString()}`);
         if (response.ok) {
            const data = await response.json();
            console.log("Filtered SPs fetched successfully:", data);
           return data;
         } else {
           // If server-side filtering endpoint returns a non-ok status, warn and fallback
            console.warn('Server-side filtering failed with status:', response.status);
            // Throw an error to trigger the catch block for client-side fallback
           throw new Error('Server-side filtering not supported or failed');
         }
       } catch (error) {
         // Fallback to client-side filtering if server-side fails or throws
         console.warn('Falling back to client-side filtering:', error);
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
              // Client-side filtering by student faculty requires iterating through students
              // This is complex client-side without student faculty data in the SP object
              result = result.filter(sp => {
                  if (!sp.studentIds || sp.studentIds.length === 0) return false;

                   console.warn("Client-side filtering by Department/Faculty might not be fully accurate without student faculty data in SP object.");
                   // As a placeholder, you might check if *any* student of this SP
                   // belongs to the selected faculty, but this requires knowing student faculties.

           // For now, returning true to not incorrectly filter out SPs.
                   return true;
              });
          }


         if (searchTerm) {
           const term = searchTerm.toLowerCase();
           result = result.filter(sp =>
             (sp.title && sp.title.toLowerCase().includes(term)) ||
             (sp.abstractText && sp.abstractText.toLowerCase().includes(term))
           );
         }

         return result; // Return client-side filtered results
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
  }, [tags]); // Run when tags are loaded


  useEffect(() => {
    const fetchAdviserDetails = async () => {
      const adviserIds = filteredSps
        .filter(sp => sp.adviserId)
        .map(sp => sp.adviserId);

      // Remove duplicates
      const uniqueAdviserIds = [...new Set(adviserIds)];

      // Fetch details for unique adviser IDs
      const adviserPromises = uniqueAdviserIds.map(id => SPApiService.fetchAdviserById(id));
      const results = await Promise.all(adviserPromises);

      // Build a map of adviserId to adviser object
      const adviserMap = {};
      results.forEach(adviser => {
        if (adviser && adviser.adminId) {
          adviserMap[adviser.adminId] = adviser;
        }
      });

      // Update state with adviser data map
      setAdviserData(adviserMap);
    };

    // Fetch adviser details whenever the filtered SPs change
    if (filteredSps.length > 0) {
      fetchAdviserDetails();
    } else {
        // Clear adviser data if there are no filtered SPs
        setAdviserData({});
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

        // Fetch all SPs and apply initial sorting
        const spData = await SPApiService.fetchAllSPs();
        console.log('SP data fetched:', spData);
        const sortedSpData = sortSPs(spData || []); // Apply initial sort
        setSps(spData || []); // Keep original data for filtering
        setFilteredSps(sortedSpData); // Set filtered/sorted data for display


        const initialActiveTabs = {};
        if (spData && Array.isArray(spData)) {
          spData.forEach(sp => {
            if (sp && sp.spId) {
              initialActiveTabs[sp.spId] = 'AI'; // Default tab is 'AI' (Abstract/Intro)
            }
          });
        }
        setActiveTabs(initialActiveTabs);

        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setInitialLoading(false); // Set initial loading to false regardless of success or failure
      }
    };

    fetchData();
  }, []);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close adviser dropdown if click is outside
      if (adviserDropdownRef.current && !adviserDropdownRef.current.contains(event.target)) {
        setShowAdviserDropdown(false);
      }
      // Close tag dropdown if click is outside
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs only once after the initial render


 // Effect to apply filters whenever filter states change
 // Use debouncedSearchTerm to avoid excessive API calls while typing
// Effect to apply filters whenever filter states change
 // Use debouncedSearchTerm to avoid excessive API calls while typing
  useEffect(() => {
   const applyFiltersAndSort = async () => {
     // <-- NEW: Clear any existing timer before starting a new operation
     if (filterLoadingTimerRef.current) {
       clearTimeout(filterLoadingTimerRef.current);
       filterLoadingTimerRef.current = null;
     }
 
     // <-- NEW: Start a timer to show the loading indicator after a short delay
     // The loading state will only become true if the fetch takes longer than 150ms
     filterLoadingTimerRef.current = setTimeout(() => {
       setFilterLoading(true);
     }, 150); // Adjust the delay (e.g., 100, 200, 300) as needed
 
 
     try {
       // Construct filter object from state (no change needed here)
       const filters = {
         adviserIds: selectedAdvisers.map(adviser => adviser.adminId),
         tagIds: selectedTags.map(tag => tag.tagId),
         departmentId: selectedDepartment,
         searchTerm: debouncedSearchTerm
       };
 
       // Use the applyFilters service (no change needed here)
       const filteredResults = await SPApiService.applyFilters(filters);
       console.log("Filtered SPs fetched successfully:", filteredResults);
 
       // Apply sorting (no change needed here)
       const sortedResults = sortSPs(filteredResults || []);
 
       // Update state and reset pagination (no change needed here)
       setFilteredSps(sortedResults);
       setCurrentPage(1);
 
       // Update search results... (no change needed here)
        if (debouncedSearchTerm) {
          setSearchResults({
            term: debouncedSearchTerm,
            count: filteredResults.length
          });
        } else {
          setSearchResults(null);
        }
        setError(null); // Clear filter-specific errors on success
 
 
     } catch (err) {
       console.error('Error applying filters:', err);
       setError('Failed to apply filters. Please try again.');
       setFilteredSps([]);
       setSearchResults(null);
     } finally {
       // <-- NEW: Clear the timer and set filter loading to false when done, regardless of success/failure
       if (filterLoadingTimerRef.current) {
         clearTimeout(filterLoadingTimerRef.current);
         filterLoadingTimerRef.current = null;
       }
       setFilterLoading(false); // Always set filter loading to false when the operation completes
     }
   };
 
   // Only apply filters if initial loading has completed (keep this condition)
   if (!initialLoading) {
     applyFiltersAndSort();
   }
 
   // <-- NEW: Cleanup function for the effect
   // This runs when the component unmounts or the dependencies change
   return () => {
     // Clear the timer if the effect is cleaned up before it fires
     if (filterLoadingTimerRef.current) {
       clearTimeout(filterLoadingTimerRef.current);
       filterLoadingTimerRef.current = null;
     }
   };
 
 }, [selectedAdvisers, selectedTags, selectedDepartment, debouncedSearchTerm, sortBy, sortDirection, initialLoading]); // Dependencies remain the same
 
  // Get adviser name from fetched adviser data
  const getAdviserName = (adviserId) => {
    const adviser = adviserData[adviserId];
    if (!adviser) return 'Unknown Adviser';
    return `${adviser.lastName || ''}${adviser.firstName ? ', ' + adviser.firstName : ''}`;
  };

  // Get authors string from SP object
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

     // Fallback if authors array is empty or null (shouldn't happen with correct backend DTO)
     return 'Unknown Author';
   };


  // Handle adviser selection from dropdown
  const handleSelectAdviser = (adviser) => {
    // Add adviser to selectedAdvisers if not already included
    if (!selectedAdvisers.some(a => a.adminId === adviser.adminId)) {
      setSelectedAdvisers([...selectedAdvisers, adviser]);
    }
    // Clear the input and hide the dropdown
    setAdviserInput('');
    setShowAdviserDropdown(false);
  };

  // Handle tag selection from dropdown
  const handleSelectTag = (tag) => {
    // Add tag to selectedTags if not already included
    if (!selectedTags.some(t => t.tagId === tag.tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
    // Clear the input and hide the dropdown
    setTagInput('');
    setShowTagDropdown(false);
  };

  // Remove adviser from selected filters
  const removeAdviser = (adviserId) => {
    setSelectedAdvisers(selectedAdvisers.filter(a => a.adminId !== adviserId));
  };

  // Remove tag from selected filters
  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.tagId !== tagId));
    // Optional: Update URL to remove the tag parameter if needed
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

  // Handle tag clicks on SP cards
  const handleTagClick = (tagName) => {
    // Find the tag object by name in the tags list
    const tag = tags.find(t => t.tagName === tagName);
    // If tag found and not already selected, add it to selectedTags
    if (tag && !selectedTags.some(t => t.tagId === tag.tagId)) {
      setSelectedTags([...selectedTags, tag]);
      // Optional: Update URL to reflect the tag selection
      const url = new URL(window.location);
      url.searchParams.set('tag', encodeURIComponent(tagName));
      window.history.pushState({}, '', url);
    }
  };

  // Clear all selected advisers
  const clearAllAdvisers = () => {
    setSelectedAdvisers([]);
    setAdviserInput(''); // Clear input field as well
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

  // Clear all selected tags
  const clearAllTags = () => {
    setSelectedTags([]);
    setTagInput(''); // Clear input field as well
    // Optional: Remove tag parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('tag');
    window.history.pushState({}, '', url);
  };


  // Handle department filter change
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  // Handle field filter change (assuming 'Field' is distinct from 'Department')
  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
  };

  // Handle tab selection for a specific SP details display
  const handleTabChange = (spId, tabName) => {
    setActiveTabs(prev => ({
      ...prev,
      [spId]: tabName
    }));
  };

  // Handle search form submission (actual filtering is handled by useEffect with debounce)
  const handleSearch = (e) => {
    e.preventDefault();
    // The debounce effect will handle the search when the input changes
  };

  // Filter advisers based on input for dropdown display
  const filteredAdvisers = advisers.filter(adviser =>
    adviser && adviser.lastName &&
    (adviser.lastName.toLowerCase().includes(adviserInput.toLowerCase()) ||
     (adviser.firstName && adviser.firstName.toLowerCase().includes(adviserInput.toLowerCase())))
  );

  // Filter tags based on input for dropdown display
  const filteredTags = tags.filter(tag =>
    tag && tag.tagName &&
    tag.tagName.toLowerCase().includes(tagInput.toLowerCase())
  );

  // Format the name (LastName, FirstName) for display
  const formatName = (adviser) => {
    if (!adviser) return '';
    const parts = [];
    if (adviser.lastName) parts.push(adviser.lastName);
    if (adviser.firstName) parts.push(adviser.firstName);
    return parts.join(', ');
  };

  // Get tag names for a specific SP
  const getTagsForSp = (sp) => {
    // Check if sp and sp.tagIds exist and are arrays
    if (!sp || !sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    // Filter the main tags list to find tags whose IDs are in sp.tagIds
    return tags
      .filter(tag => tag && sp.tagIds.includes(tag.tagId))
      .map(tag => tag?.tagName || 'Unknown Tag'); // Map to tag names, handle potential null tag
  };


  return (
    <div className="sp-filter-panel-container">
      {/* Adviser Navbar */}
      <div><AdviserNavbar/></div>

      <div className="flex w-full max-w-6xl mx-auto" style={{backgroundColor: 'white'}}>
        {/* Left Sidebar - Filter Section */}
        {/* Assuming this left sidebar contains the Adviser and Tag filters based on your description */}
         <div className="w-14 p-4 border-r border-gray-200" style={{backgroundColor: 'white'}}>
           {/* Logo */}
           <div className="mb-8">
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/University_of_the_Philippines_Manila_Seal.svg/640px-University_of_the_Philippines_Manila_Seal.svg.png" alt="University Logo" className="w-48 mx-auto" />
           </div>

           {/* Adviser Filter Section */}
           <div className="mb-8">
             <h3 className="text-lg font-bold mb-2">Advisers</h3>
             <div className="relative mb-2" ref={adviserDropdownRef}>
               {/* Adviser Search Input */}
               <div className="flex">
                 <input
                   type="text"
                   className="w-full border border-gray-300 rounded-l p-2 text-dm"
                   placeholder="Search adviser"
                   value={adviserInput}
                   onChange={(e) => setAdviserInput(e.target.value)}
                   onClick={() => setShowAdviserDropdown(true)} // Show dropdown on input click
                   onFocus={() => setShowAdviserDropdown(true)} // Show dropdown on focus
                 />
                  {/* Clear Advisers Button */}
                 <button
                   className="bg-red-700 text-white px-2 rounded-r"
                   onClick={clearAllAdvisers}
                   aria-label="Clear selected advisers"
                 >
                   ×
                 </button>
               </div>
               {/* Adviser Dropdown */}
               {showAdviserDropdown && filteredAdvisers.length > 0 && (
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg">
                   {filteredAdvisers.map(adviser => (
                     <div
                       key={adviser.adminId}
                       className="p-2 hover:bg-gray-100 cursor-pointer text-dm"
                       onClick={() => handleSelectAdviser(adviser)} // Handle adviser selection
                     >
                       {formatName(adviser)}
                     </div>
                   ))}
                 </div>
               )}
             </div>
             {/* Selected Advisers Display */}
             <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
               {selectedAdvisers.map(adviser => (
                 <div key={adviser.adminId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                   {adviser.lastName}{adviser.firstName && `, ${adviser.firstName}`}
                   {/* Optional: Display count if available in adviser object */}
                   <span className="ml-1 text-xs">{adviser.count || ''}</span>
                    {/* Remove Adviser Button */}
                   <button
                     className="ml-2 text-white font-bold leading-none"
                     onClick={() => removeAdviser(adviser.adminId)}
                     aria-label="Remove adviser"
                   >
                     ×
                   </button>
                 </div>
               ))}
             </div>
           </div>

           {/* Tags Filter Section */}
           <div>
             <h3 className="text-lg font-bold mb-2">Tags</h3>
             <div className="relative mb-2" ref={tagDropdownRef}>
               {/* Tag Search Input */}
               <div className="flex">
                 <input
                   type="text"
                   className="w-full border border-gray-300 rounded-l p-2 text-dm"
                   placeholder="Search tags"
                   value={tagInput}
                   onChange={(e) => setTagInput(e.target.value)}
                   onClick={() => setShowTagDropdown(true)} // Show dropdown on input click
                    onFocus={() => setShowTagDropdown(true)} // Show dropdown on focus
                 />
                 {/* Clear Tags Button */}
                 <button
                   className="bg-red-700 text-white px-2 rounded-r"
                   onClick={clearAllTags}
                    aria-label="Clear selected tags"
                 >
                   ×
                 </button>
               </div>
               {/* Tag Dropdown */}
               {showTagDropdown && (
                 <div
                   className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg">
                   {/* Corrected conditional rendering syntax */}
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
             {/* Selected Tags Display */}
             <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
               {selectedTags.map(tag => (
                 <div key={tag.tagId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                   {tag.tagName}
                   {/* Optional: Display count if available in tag object */}
                   <span className="ml-1 text-xs">{tag.count || ''}</span>
                   {/* Remove Tag Button */}
                   <button
                     className="ml-2 text-white font-bold leading-none"
                     onClick={() => removeTag(tag.tagId)}
                     aria-label="Remove tag"
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
              {/* Department Filter Dropdown */}
              <select
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleDepartmentChange}
                value={selectedDepartment}
                disabled ={filterLoading}
              >
                <option value="">Department</option>
                <option value="1">BSBC</option>
                <option value="2">BSCS</option>
                <option value="3">BSAP</option>
              </select>



              {/* Search Input and Button */}
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

              {/* Sort By Dropdown and Direction Button */}
              <div>
                <select
                  className="border border-gray-300 p-2 mr-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="" disabled>Sort By</option>
                  <option value="yearSemester">Year/Semester</option>
                  <option value="dateIssued">Date issued</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <button
                  className="bg-red-800 hover:bg-red-900 px-4 rounded justify-center text-white" style={{ height: '100%'}}
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? ' ↑ ' : ' ↓ '}
                </button>
              </div>
            </form>

            {/* Search Results Message */}
            {searchResults && (
              <div className="bg-green-100 p-3 rounded">
                Your search for <strong>{searchResults.term}</strong> returned {searchResults.count} records.
              </div>
            )}
          </div>

         {/* --- Custom Pagination using MUI Pagination and Select (Top) --- */}
         {/* Added responsiveness using flex properties and adjusted width */}
         <div style={{ display: 'flex', md: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', width: '100%', margin: '20px 0' }}>
           {/* Placeholder or alignment div */}
            <div style={{ width: '33%', flexShrink: 0, display: 'flex', md: 'block' }}></div> {/* Hide on small screens */}

          {/* Pagination Numbers (Center/Top) */}
           {totalPages > 1 && ( // Only show pagination if more than 1 page
             <Pagination
               count={totalPages}
               page={currentPage}
               onChange={handlePageChange}
               size="medium"
               shape="rounded"
               color="primary"
               sx={{
                 '& .MuiPaginationItem-root': {
                   color: '#333',
                   borderColor: '#e4e4e4',
                 },
                 '& .Mui-selected': {
                   backgroundColor: '#800000 !important', // Customize the selected color
                   color: '#fff',
                 },
                 flexGrow: 1, // Allows pagination to take available space
                 justifyContent: 'center', // Center the pagination items
                 marginBottom: { xs: '10px', md: '0' }, // Add margin bottom on small screens
               }}
             />
           )}

            {/* Rows per page control with label (Right/Bottom) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                Show rows:
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}> {/* Adjusted minWidth */}
                <Select
                  id="rows-per-page-select"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </div>
         </div>
         {/* --- End Custom Pagination (Top) --- */}


          {/* Loading and Error States */}
          {(initialLoading || filterLoading) && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Fetching SPs...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}

          {/* SP Results List - Map through currentItems */}
          <div style={{width: '100%', backgroundColor: 'white'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {/* No Results Found Message */}
            {!initialLoading && filteredSps.length === 0 && (
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No results found. Try adjusting your filters.
              </div>
            )}

            {/* Map through currentItems instead of filteredSps */}
            {currentItems.map((sp, index) => (
              <div key={sp.spId} className="relative">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    <a href={`/project/${sp.spId}`} className="text-blue-600 hover:underline" onClick={() => handleViewCountIncrement(sp.spId)}>{sp.title || 'Untitled Project'}</a>
                  </h3>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4">
                      <i className="fa-solid fa-pen-to-square"></i>
                      {getAuthors(sp)}
                    </span>
                    <span className="mr-4">
                      <i className="fa-regular fa-clock"></i>
                      {sp.dateIssued ? new Date(sp.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : sp.year || 'No Date'}
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

                {/* Custom divider between SP items (except the last one on the current page) */}
                {index < currentItems.length - 1 && (
                  <div
                    className="sp-divider"
                    style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}
                  ></div>
                )}
              </div>
            ))}
          </div>

           {/* --- Custom Pagination using MUI Pagination and Select (Bottom) --- */}
           {/* Added responsiveness using flex properties and adjusted width */}
           <div style={{ display: 'flex', md: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', width: '100%', margin: '20px 0' }}>
             {/* Placeholder or alignment div */}
             <div style={{ width: '33%', flexShrink: 0, display: 'flex', md: 'block' }}></div> {/* Hide on small screens */}

            {/* Pagination Numbers (Center/Bottom) */}
             {totalPages > 1 && ( // Only show pagination if more than 1 page
               <Pagination
                 count={totalPages}
                 page={currentPage}
                 onChange={handlePageChange}
                 size="medium"
                 shape="rounded"
                 color="primary"
                 sx={{
                   '& .MuiPaginationItem-root': {
                     color: '#333',
                     borderColor: '#e4e4e4',
                   },
                   '& .Mui-selected': {
                     backgroundColor: '#800000 !important', // Customize the selected color
                     color: '#fff',
                   },
                   flexGrow: 1, // Allows pagination to take available space
                   justifyContent: 'center', // Center the pagination items
                   marginBottom: { xs: '10px', md: '0' }, // Add margin bottom on small screens
                 }}
               />
             )}

              {/* Rows per page control with label (Right/Bottom) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                  Show rows:
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}> {/* Adjusted minWidth */}
                  <Select
                    id="rows-per-page-select"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </div>
           </div>
          {/* --- End Custom Pagination (Bottom) --- */}


        </div>
      </div>
    </div>
  );
};

export default SPFilterSystem;