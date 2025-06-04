import axios from 'axios';
import { Typography } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import '../styles/SPFilterSystem.css';
 
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
 
 
import DeleteConfirmationModal from './DeleteConfirmationModal';
const SPFilterPanel = ({ onSPSelect, showUploadButton, onUploadClick }) => {
   
  const { refreshTrigger, triggerDataRefresh } = useProjectContext();
  const { currentUser } = useUser();  
 
   
  const [advisers, setAdvisers] = useState([]);
  const [tags, setTags] = useState([]);
  const [sps, setSps] = useState([]);
  const [filteredSps, setFilteredSps] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);  
  const filterLoadingTimerRef = useRef(null);
  const isStaff = currentUser?.role === 'staff';
  // NEW: Determine if the current user is a faculty member
  const isFaculty = currentUser?.role === 'faculty'; //

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adviserData, setAdviserData] = useState({});
   
   
  const [currentPage, setCurrentPage] = useState(1);  
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const totalItems = filteredSps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   
  const currentItems = filteredSps.slice(indexOfFirstItem, indexOfLastItem);


   
  const [sortBy, setSortBy] = useState('dateIssued');
  const [sortDirection, setSortDirection] = useState('desc');

   
  const [selectedAdvisers, setSelectedAdvisers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  // NEW: Initialize selectedDepartment based on currentUser's facultyId if they are faculty
  const [selectedDepartment, setSelectedDepartment] = useState(isFaculty ? currentUser?.facultyId || '' : ''); //
  const [selectedField, setSelectedField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [adviserInput, setAdviserInput] = useState('');
  const [tagInput, setTagInput] = useState('');

   
  const [activeTabs, setActiveTabs] = useState({});

   
  const [showAdviserDropdown, setShowAdviserDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

   
  const adviserDropdownRef = useRef(null);
  const tagDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spToDelete, setSpToDelete] = useState(null);  
   
  const [isDeleting, setIsDeleting] = useState(false);
   
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const isAnyLoading = initialLoading || filterLoading || isRefreshingList;


   
  const handlePageChange = (event, value) => {
     
    if (!isAnyLoading) {
        setCurrentPage(value);
    }
  };

  const handleItemsPerPageChange = (event) => {
     
    if (!isAnyLoading) {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);  
    }
  };


   
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
          valueB 
          = b.dateIssued || '';
          break;
        case 'alphabetical':
          valueA = a.title || '';
          valueB = b.title || '';
          break;
        default:
          valueA = a.dateIssued || '';
          valueB = b.dateIssued || '';
    
      }

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

      if (sortBy === 'yearSemester') {
        const yearA = parseInt(valueA, 10) ||
        0;
        const yearB = parseInt(valueB, 10) || 0;

        if (yearA !== yearB) {
          return sortDirection === 'asc' ?
          yearA - yearB : yearB - yearA;
        }

        const semesterOrder = { '1st': 1, '2nd': 2, 'midyear': 3 };
        const semA = semesterOrder[a.semester?.toLowerCase()] || 0;
        const semB = semesterOrder[b.semester?.toLowerCase()] || 0;

        return sortDirection === 'asc' ?
        semA - semB : semB - semA;
      }

      const stringA = String(valueA || '').toLowerCase();
      const stringB = String(valueB || '').toLowerCase();

      if (sortDirection === 'asc') {
        return stringA.localeCompare(stringB);
      } else {
        return stringB.localeCompare(stringA);
      }
    });
  };
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
         
        return await SPApiService.fetchAllSPs();
      }

      try {
         
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

        console.log("Applying filters with params:", params.toString());

        const response = await fetch(`http://localhost:8080/api/sp/filter?${params.toString()}`);
        if (response.ok) {
           const data = await response.json();
           console.log("Filtered SPs fetched successfully:", data);
          return data;
        } else {
           
           console.warn('Server-side filtering failed with status:', response.status);
           throw new Error('Server-side filtering not supported or failed');
        }
      } catch (error) {
         
        console.warn('Falling back to client-side filtering:', error);
        let result = await SPApiService.fetchAllSPs();

         
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
              
              
             result = result.filter(sp => {
                 if (!sp.studentIds || sp.studentIds.length === 0) return false;
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

        return result;
      }
    },

     
    deleteSP: async (spId) => {
        try {
            const response = await axios.delete(`http://localhost:8080/api/sp/${spId}`, { withCredentials: true });
            if (response.status === 204) {  
                console.log(`SP with ID ${spId} deleted successfully.`);
                return true;  
            } else {
                 console.error(`Failed to delete SP with ID ${spId}. Status: ${response.status}`);
                 return false;  
            }
        } catch (error) {
            console.error(`Error deleting SP with ID ${spId}:`, error);
            if (error.response) {
                 console.error("Error response data:", error.response.data);
                 console.error("Error response status:", error.response.status);
                 console.error("Error response headers:", error.response.headers);
                 if (error.response.status === 401 || error.response.status === 403) {
                     alert("You are not authorized to delete this project.");
                 } else if (error.response.status === 404) {
                     alert("Project not found.");
                 } else {
                     alert(`Failed to delete project: ${error.response.data?.message || error.message}`);
                 }
            } else if (error.request) {
                  
                 console.error("Error request:", error.request);
                 alert("Failed to delete project: No response from server.");
            } else {
                  
                 console.error("Error message:", error.message);
                 alert(`Failed to delete project: ${error.message}`);
            }
            return false;
        }
    }
  };


   
  useEffect(() => {
     
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

     
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

     
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  useEffect(() => {
    const parseUrlParams = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const tagParam = queryParams.get('tag');

      if (tagParam && tags.length > 0) {
         
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

       
      const uniqueAdviserIds = [...new Set(adviserIds)];

       
      const adviserPromises = uniqueAdviserIds.map(id => SPApiService.fetchAdviserById(id));
      const results = await Promise.all(adviserPromises);

       
      const 
      adviserMap = {};
      results.forEach(adviser => {
        if (adviser && adviser.adminId) {
          adviserMap[adviser.adminId] = adviser;
        }
      });

       
      setAdviserData(adviserMap);
    };

     
    if (filteredSps.length > 0) {
      fetchAdviserDetails();
    } else {
         
 
       setAdviserData({});
    }
  }, [filteredSps]);
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setIsRefreshingList(true);  
      try {
        console.log('Fetching all data...');

         
        const adviserData = await SPApiService.fetchAllAdvisers();
        setAdvisers(adviserData || []);

         
        const tagData = await SPApiService.fetchAllTags();
     
        setTags(tagData || []);

         
        const spData = await SPApiService.fetchAllSPs();
        console.log('SP data fetched:', spData);
        const sortedSpData = sortSPs(spData || []);  
        setSps(spData || []);  
        setFilteredSps(sortedSpData);  


         
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
        setFilteredSps([]);  
      } finally {
        setInitialLoading(false);
        setIsRefreshingList(false);  
        console.log("Data fetching complete. isRefreshingList set to false.");

         
         
        if (showDeleteModal && spToDelete !== null && !isDeleting) {
             console.log("Closing delete modal after refresh.");
             setSpToDelete(null);
             setShowDeleteModal(false);
        }
      }
    };

    fetchData();
  }, [refreshTrigger]);
  useEffect(() => {
    const handleClickOutside = (event) => {
       
       
      if (!isAnyLoading && adviserDropdownRef.current && !adviserDropdownRef.current.contains(event.target)) {
        setShowAdviserDropdown(false);
      }
       
       
      if (!isAnyLoading && tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

     
    document.addEventListener('mousedown', handleClickOutside);

     
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAnyLoading]);
  useEffect(() => {
    const applyFiltersAndSort = async () => {
       
      if (filterLoadingTimerRef.current) {
        clearTimeout(filterLoadingTimerRef.current);
        filterLoadingTimerRef.current = null;
      }

       
       
      filterLoadingTimerRef.current = setTimeout(() => {
        setFilterLoading(true);
      }, 150);  

      console.log("Applying filters effect triggered.");  

      try {
         
        const filters = 
        {
          adviserIds: selectedAdvisers.map(adviser => adviser.adminId),
          tagIds: selectedTags.map(tag => tag.tagId),
          // NEW: If faculty, use their assigned facultyId, otherwise use selectedDepartment
          departmentId: isFaculty ? currentUser?.facultyId : selectedDepartment, //
          searchTerm: debouncedSearchTerm
        };

       
        const filteredResults = await SPApiService.applyFilters(filters);
        console.log("Filtered SPs fetched successfully:", filteredResults);

       
        const sortedResults = sortSPs(filteredResults || []);

       
  
        setFilteredSps(sortedResults);
        setCurrentPage(1);

       
        if (debouncedSearchTerm) {
          setSearchResults({
            term: debouncedSearchTerm,
            count: filteredResults.length
          });
        } else {
          setSearchResults(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters. Please try again.');
        setFilteredSps([]);
        setSearchResults(null);
      } finally {
       
        if (filterLoadingTimerRef.current) {
          clearTimeout(filterLoadingTimerRef.current);
          filterLoadingTimerRef.current = null;
        }
        setFilterLoading(false);  
      }
    };

   
    if (!initialLoading) {
      applyFiltersAndSort();
    }

   
   
    return () => {
     
      if (filterLoadingTimerRef.current) {
        clearTimeout(filterLoadingTimerRef.current);
        filterLoadingTimerRef.current = null;
      }
    };

  }, [selectedAdvisers, selectedTags, selectedDepartment, debouncedSearchTerm, sortBy, sortDirection, initialLoading, refreshTrigger, isFaculty, currentUser?.facultyId]); //
  const getAdviserName = (adviserId) => {
    const adviser = adviserData[adviserId];
    if (!adviser) return 'Unknown Adviser';
    return `${adviser.lastName || ''}${adviser.firstName ? ', ' + adviser.firstName : ''}`;
  };
  const getAuthors = (sp) => {
     
    if (sp.authors && Array.isArray(sp.authors) && sp.authors.length > 0) {
      return sp.authors.join('; ');
    }
     
    return 'Unknown Author';
  };
  const handleSelectAdviser = (adviser) => {
     
    if (!isAnyLoading) {
         
        if (!selectedAdvisers.some(a => a.adminId === adviser.adminId)) {
          setSelectedAdvisers([...selectedAdvisers, adviser]);
        }
         
        setAdviserInput('');
        setShowAdviserDropdown(false);
    }
  };

   
  const handleSelectTag = (tag) => {
     
    if (!isAnyLoading) {
         
        if (!selectedTags.some(t => t.tagId === tag.tagId)) {
          setSelectedTags([...selectedTags, tag]);
        }
         
        setTagInput('');
        setShowTagDropdown(false);
    }
  };

   
  const removeAdviser = (adviserId) => {
     
    if (!isAnyLoading) {
        setSelectedAdvisers(selectedAdvisers.filter(a => a.adminId !== adviserId));
    }
  };

   
  const removeTag = (tagId) => {
     
    if (!isAnyLoading) {
        setSelectedTags(selectedTags.filter(t => t.tagId !== tagId));
        const url = new URL(window.location);
        const currentTag = selectedTags.find(t => t.tagId === tagId);
        if (currentTag) {
          const tagParam = url.searchParams.get('tag');
          if (tagParam && tagParam.toLowerCase() === encodeURIComponent(currentTag.tagName).toLowerCase()) {
            url.searchParams.delete('tag');
            window.history.pushState({}, '', url);
          }
        }
    }
  };
  const handleViewCountIncrement = async (spId) => {
    console.log(`Attempting to increment view count for SP ID: ${spId}`);
    console.log("Click handler triggered on <a> tag");  
    try {
      await axios.post(`http://localhost:8080/api/sp/${spId}/view`);
      console.log(`View count incremented successfully for SP ID: ${spId}`);
    } catch (error) {
      console.error(`Error incrementing view count for SP ID: ${spId}`, error);
    }
  };
   
  const handleTagClick = (tagName) => {
     
    if (!isAnyLoading) {
         
        const tag = tags.find(t => t.tagName === tagName);
        if (tag && !selectedTags.some(t => t.tagId === tag.tagId)) {
          setSelectedTags([...selectedTags, tag]);
          const url = new URL(window.location);
          url.searchParams.set('tag', encodeURIComponent(tagName));
          window.history.pushState({}, '', url);
        }
    }
  };
  const clearAllAdvisers = () => {
     
    if (!isAnyLoading) {
        setSelectedAdvisers([]);
        setAdviserInput('');  
    }
  };

   
  const clearAllTags = () => {
     
    if (!isAnyLoading) {
        setSelectedTags([]);
        setTagInput('');  
         
        const url = new URL(window.location);
        url.searchParams.delete('tag');
        window.history.pushState({}, '', url);
    }
  };
  const handleDepartmentChange = (e) => {
     
    if (!isAnyLoading) {
        setSelectedDepartment(e.target.value);
    }
  };

   
  const handleFieldChange = (e) => {
     
    if (!isAnyLoading) {
        setSelectedField(e.target.value);
    }
  };

   
  const handleTabChange = (spId, tabName) => {
     
     if (!isAnyLoading) {
        setActiveTabs(prev => ({
          ...prev,
          [spId]: tabName
        }));
    }
  };

   
  const handleSearch = (e) => {
    e.preventDefault();
     
     
     
  };
  const filteredAdvisers = advisers.filter(adviser =>
    adviser && adviser.lastName &&
    (adviser.lastName.toLowerCase().includes(adviserInput.toLowerCase()) ||
     (adviser.firstName && adviser.firstName.toLowerCase().includes(adviserInput.toLowerCase())))
  );
  const filteredTags = tags.filter(tag =>
    tag && tag.tagName &&
    tag.tagName.toLowerCase().includes(tagInput.toLowerCase())
  );
  const formatName = (adviser) => {
    if (!adviser) return '';
    const parts = [];
    if (adviser.lastName) parts.push(adviser.lastName);
    if (adviser.firstName) parts.push(adviser.firstName);
    return parts.join(', ');
  };

   
  const getTagsForSp = (sp) => {
     
    if (!sp || !sp.tagIds || !Array.isArray(sp.tagIds)) return [];
    return tags
      .filter(tag => tag && sp.tagIds.includes(tag.tagId))
      .map(tag => tag?.tagName || 'Unknown Tag');
  };

   
  const handleSPSelect = (project) => {
     
    if (!isAnyLoading) {
         
        if (typeof onSPSelect === 'function') {
          console.log("Calling onSPSelect with project:", project);
          const projectForEdit = {
            ...project,
            editMode: true,  
            adviserName: project.adviserId ?
            getAdviserName(project.adviserId) : 'Unknown Adviser',  
            authors: project.authors ||
            [],  
            studentIds: project.studentIds ||
            [],  
            tags: getTagsForSp(project)  
          };
          console.log("Sending project with editMode=true:", projectForEdit);
          onSPSelect(projectForEdit);  
        } else {
          console.error("onSPSelect is not a function. Check your component props.");
        }
    }
  };


   
  const handleUpload = () => {
     
    if (!isAnyLoading) {
        console.log("Upload button clicked - functionality to be implemented");
        if (typeof onUploadClick === 'function') {
            onUploadClick();
        }
    }
  };

   
  const handleDeleteClick = (sp) => {
       
      if (!isAnyLoading) {
          console.log("Delete button clicked for SP:", sp);
          setSpToDelete({ spId: sp.spId, spTitle: sp.title });  
          setShowDeleteModal(true);  
      }
  };
  const handleDeleteConfirm = async () => {
      console.log("Delete confirmed for SP ID:", spToDelete?.spId);
      if (spToDelete?.spId) {
          setIsDeleting(true);
          try {
              const success = await SPApiService.deleteSP(spToDelete.spId);
              if (success) {
                  console.log("Deletion API call successful. Triggering SP list refresh.");
                  triggerDataRefresh();  
              } else {
                  console.error("Deletion API call failed.");
              }
          } finally {
              setIsDeleting(false);
              console.log("Deletion API call finished. isDeleting set to false.");
          }
      }
  };
  const handleDeleteCancel = () => {
      console.log("Delete cancelled.");
      if (!isDeleting && !isRefreshingList) {
          setSpToDelete(null);  
          setShowDeleteModal(false);
      } else {
          console.log("Cannot cancel deletion/refresh in progress.");
      }
  };
  return (
    <div className="sp-filter-panel-container">
      <div className="flex w-full max-w-6xl mx-auto" style={{backgroundColor: 'white'}}>
        {/* Central SP Results Container */}
        <div className="w-34 p-4" style={{backgroundColor: 'white'}}>
          {/* Search and Filter Row */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2 mb-9">
               
              {/* Upload Button */}
               {onUploadClick && isStaff && (  
  <button
    type="button"
    className={`text-white rounded p-2 flex items-center justify-center gap-1 ${
       
      'bg-red-800 hover:bg-red-900'
    }`}
    onClick={handleUpload}  
    disabled={isAnyLoading}  
  >
    <i className="fa fa-upload"></i> UPLOAD
  </button>
)}

              {/* Department Filter Dropdown */}
              {/* REMOVED: Conditional rendering for faculty */}
              <select
                className="border border-gray-300 rounded p-2 w-40"
                onChange={handleDepartmentChange}
                value={selectedDepartment}
                // NEW: Disable for faculty and when loading
                disabled={isFaculty || isAnyLoading}  
              >
  
                <option value="">Course</option>
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
                  disabled={isAnyLoading}  
                />
                <button
                  type="submit"
   
                  className="bg-red-800 text-white px-4 rounded-r"
                  disabled={isAnyLoading}  
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
                  disabled={isAnyLoading}  
                >
                  <option value="" disabled>Sort By</option>
                  <option value="yearSemester">Year/Semester</option>
          
                  <option value="dateIssued">Date issued</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <button
                  className="bg-red-800 hover:bg-red-900 px-4 rounded justify-center text-white" style={{ height: '100%'}}
             
                  onClick={() => setSortDirection(sortDirection === 'asc' ?
                  'desc' : 'asc')}
                  title={sortDirection === 'asc' ?
                  'Ascending' : 'Descending'}
                  disabled={isAnyLoading}  
                >
                  {sortDirection === 'asc' ?
                  ' ↑ ' : ' ↓ '}
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

         {/* --- Custom Pagination using MUI Pagination and Select --- */}
         {/* --- NEW: Disable Pagination controls while loading --- */}
         <div 
         style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', width: '100%', margin: '20px 0', pointerEvents: isAnyLoading ?
         'none' : 'auto' }}> {/* Disable pointer events */}
    {/* Left spacer or content (can be empty - adjust width if needed) */}
    {/* This div helps push the pagination to the center when justifyContent is space-between */}
    <div style={{ width: '33%', flexShrink: 0, display: 'flex', display: 'block' }}></div> {/* Hide on small screens */}

{/* Container with flexbox to align items */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 16px',
  width: '100%',
  margin: '10px 0',
}}>
  {/* Empty div for left side spacing */}
  <div style={{ width: '150px' }}></div>

  {/* Pagination Numbers (Center) */}
  {totalPages > 1 && (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      size="medium"
      shape="rounded"
      color="primary"
      disabled={isAnyLoading}  
      sx={{
        '& .MuiPaginationItem-root': {
          color: '#333',
       
          borderColor: '#e4e4e4',
        },
        '& .Mui-selected': {
          backgroundColor: '#800000 !important',
          color: '#fff',
        },
         
        '& .Mui-disabled': {
            opacity: 0.5,
            pointerEvents: 'none',
  
        }
      }}
    />
  )}

  {/* Rows per page control with label (Right) */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
    <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
      Show rows:
    </Typography>
    <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
      <Select
        id="rows-per-page-select"
        value={itemsPerPage}
        
        onChange={handleItemsPerPageChange}
        disabled={isAnyLoading}  
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
</div>
         {/* --- End Custom Pagination --- */}


          {/* Loading 
          and Error States */}

          {(initialLoading || filterLoading ||
          isRefreshingList) && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Fetching SPs...</div>} {/* Include isRefreshingList here */}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}

          {/* SP Results List */}
          <div style={{width: '100%', backgroundColor: 'white'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

        
            {/* No Results Found Message */}
            {!initialLoading && !filterLoading && !isRefreshingList && filteredSps.length === 0 && (  
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No results found. Try adjusting your filters.
              </div>
            
            )}

            {/* Map through current items for the current page */}
            {currentItems.map((sp, index) => (
               
              <div key={sp.spId} className="relative" style={{ pointerEvents: isAnyLoading ?
              'none' : 'auto' }}>
                <div className="mb-6">
                  {/* SP Title and Action Buttons */}
                  <div className="flex mb-2">
                    <h3 className="text-lg font-semibold flex-1">
             
                      {/* Link to the project detail page */}
                      {/* --- NEW: Disable link while loading --- */}
                      <a href={isAnyLoading ?
                      '#' : `/project/${sp.spId}`} className={`text-blue-600 hover:underline ${isAnyLoading ? 'cursor-not-allowed' : ''}`} onClick={isAnyLoading ? (e) => e.preventDefault() : () => handleViewCountIncrement(sp.spId)}>{sp.title ||
                      'Untitled Project'}</a>
                    </h3>

                    {/* Action buttons (Edit, Delete) */}
                    <div className="flex ml-auto">
                      {/* Edit Button */}
       
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();  
                          console.log("Edit button clicked for:", sp.title);
                           
                          handleSPSelect(sp);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-2"
                        aria-label="Edit project"
                        disabled={isAnyLoading}  
                
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      {/* Delete Button (Visible only to staff) */}
                 
                      {isStaff && (
                          <button
                            className="text-red-600 hover:text-red-800 p-2"
                            aria-label="Delete project"
        
                            onClick={(e) => {
                                e.preventDefault();  
                                e.stopPropagation();  
          
                                handleDeleteClick(sp);  
                            }}
                            disabled={isAnyLoading}  
                  
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                      )}
              
                      </div>
                  </div>

                  {/* SP Meta Information (Authors, Date, Adviser) */}
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4">
         
                      <i className="fa-solid fa-pen-to-square"></i>
                      {/* Use the getAuthors helper function */}
                      {getAuthors(sp)}
                    </span>
               
                    <span className="mr-4">
                      <i className="fa-regular fa-clock"></i>
                      {/* Display formatted date or year */}
                      {sp.dateIssued ?
                      new Date(sp.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : sp.year ||
                      'No Date'}
                    </span>
                    <span>
                      <i className="fa-solid fa-user"></i>
                      {/* Use the getAdviserName helper function */}
       
                      {sp.adviserId ?
                      getAdviserName(sp.adviserId) : 'Unknown Adviser'}
                    </span>
                  </div>

                  {/* SP Abstract */}
                  <div className="text-sm mb-3">{sp.abstractText ||
                  'No abstract available.'}</div>

                  {/* SP Tags */}
                  {/* --- NEW: Disable tag clicks while loading --- */}
                  <div className="flex flex-wrap gap-1 mb-2" style={{ pointerEvents: isAnyLoading ?
                  'none' : 'auto' }}>
                    {getTagsForSp(sp).map((tagName, index) => (
                      <span
                        key={index}
                        className={`bg-gray-200 text-gray-700 px-2 py-1 
                        rounded-full text-xs cursor-pointer hover:bg-gray-300 ${isAnyLoading ? 'cursor-not-allowed' : 
                        ''}`}
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
        </div>

        {/* Right Sidebar - Filter Section */}
        {/* --- NEW: Disable the entire filter sidebar while loading --- */}
        <div className="w-14 p-4 border-l border-gray-200" style={{backgroundColor: 'white', pointerEvents: isAnyLoading 
        ? 'none' : 'auto', opacity: isAnyLoading ? 0.7 : 1}}> {/* Add opacity for visual feedback */}
          {/* Logo */}
          <div className="mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/White_box_55x90.png" alt="University Logo" className="w-48 mx-auto" />
          </div>

          {/* Adviser Filter Section */}
          {/* --- NEW: Disable this section while loading --- */}
          <div className="mb-8" style={{ pointerEvents: isAnyLoading ?
          'none' : 'auto' }}>
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
                  onClick={() => 
                  setShowAdviserDropdown(true)}  
                   onFocus={() => setShowAdviserDropdown(true)}  
                   disabled={isAnyLoading}  
                />
                 {/* Clear Advisers Button */}
                <button
 
                  className="bg-red-700 text-white px-2 rounded-r"
                  onClick={clearAllAdvisers}
                  aria-label="Clear selected advisers"
                  disabled={isAnyLoading}  
                >
      
                ×
                </button>
              </div>
              {/* Adviser Dropdown */}
              {showAdviserDropdown && filteredAdvisers.length > 0 && (
                 
    
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg" style={{ pointerEvents: isAnyLoading ?
                'none' : 'auto' }}>
                  {/* Corrected conditional rendering syntax */}
                  {filteredAdvisers.length > 0 ?
                  (
                    filteredAdvisers.map(adviser => (
                      <div
                        key={adviser.adminId}
                        className={`p-2 hover:bg-gray-100 cursor-pointer text-dm ${isAnyLoading ? 'cursor-not-allowed' : 
                        ''}`}
                        onClick={() => handleSelectAdviser(adviser)}  
                      >
                        {formatName(adviser)}
                      </div>
    
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No matching advisers</div>
                  )}
                </div>
     
              )}
            </div>
            {/* Selected Advisers Display */}
            {/* --- NEW: Disable remove buttons for selected advisers while loading --- */}
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {selectedAdvisers.map(adviser => (
      
                <div key={adviser.adminId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                  {adviser.lastName}{adviser.firstName && `, ${adviser.firstName}`}
                  {/* Optional: Display count if available in adviser object */}
                  <span className="ml-1 text-xs">{adviser.count ||
                  ''}</span>
                   {/* Remove Adviser Button */}
                  <button
                    className="ml-2 text-white font-bold leading-none"
                    onClick={() => removeAdviser(adviser.adminId)}
              
                    aria-label="Remove adviser"
                    disabled={isAnyLoading}  
                  >
                    ×
                  </button>
               
                </div>
              ))}            </div>
          </div>

          {/* Tags Filter Section */}
          {/* --- NEW: Disable this section while loading --- */}
          <div style={{ pointerEvents: isAnyLoading ?
          'none' : 'auto' }}>
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
                  onClick={() => 
                  setShowTagDropdown(true)}  
                   onFocus={() => setShowTagDropdown(true)}  
                   disabled={isAnyLoading}  
                />
                 {/* Clear Tags Button */}
                <button
 
                  className="bg-red-700 text-white px-2 rounded-r"
                  onClick={clearAllTags}
                   aria-label="Clear selected tags"
                   disabled={isAnyLoading}  
                >
    
                ×
                </button>
              </div>
              {/* Tag Dropdown */}
              {showTagDropdown && (
                 
      
                <div
                  className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg" style={{ pointerEvents: isAnyLoading ?
                  'none' : 'auto' }}>
                  {/* Corrected conditional rendering syntax */}
                  {filteredTags.length > 0 ?
                  (
                    filteredTags.map(tag => (
                      <div
                        key={tag.tagId}
                        className={`p-2 hover:bg-gray-100 cursor-pointer text-dm ${isAnyLoading ? 'cursor-not-allowed' : 
                        ''}`}
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
            {/* --- NEW: Disable remove buttons for selected tags while loading --- */}
            <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
              {selectedTags.map(tag => (
        
                <div key={tag.tagId} className="bg-red-800 text-white text-dm rounded px-2 py-1 flex items-center mb-1 mr-1">
                  {tag.tagName}
                  {/* Optional: Display count if available in tag object */}
                  <span className="ml-1 text-xs">{tag.count ||
                  ''}</span>
                  {/* Remove Tag Button */}
                  <button
                    className="ml-2 text-white font-bold leading-none"
                    onClick={() => removeTag(tag.tagId)}
               
                    aria-label="Remove tag"
                     disabled={isAnyLoading}  
                  >
                    ×
                  </button>
              
                </div>
              ))}</div>
          </div>
        </div>
      </div>

      {/* Render the Delete Confirmation Modal */}
      <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemToDelete={spToDelete}  
 
          isDeleting={isDeleting}  
          isRefreshingList={isRefreshingList}  
      />
    </div>
  );
};

export default SPFilterPanel;