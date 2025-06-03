import axios from 'axios';

import React, { useState, useEffect, useRef } from 'react';
import '../styles/SPFilterSystem.css';
import AdviserNavbar from '../components/AdviserNavbar';

 
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
 
 

const SPFilterSystem = () => {
   
  const [advisers, setAdvisers] = useState([]);
  const [tags, setTags] = useState([]);
  const [sps, setSps] = useState([]);
  const [filteredSps, setFilteredSps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adviserData, setAdviserData] = useState({});
  const [studentGroups, setStudentGroups] = useState({});

  const [filterLoading, setFilterLoading] = useState(false);  
  const filterLoadingTimerRef = useRef(null);  

   
  const isAnyLoading = initialLoading || filterLoading;

   
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);  

   
  const totalItems = filteredSps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSps.slice(indexOfFirstItem, indexOfLastItem);


   
  const [sortBy, setSortBy] = useState('dateIssued');  
  const [sortDirection, setSortDirection] = useState('desc');  

   
  const [selectedAdvisers, setSelectedAdvisers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
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

                   console.warn("Client-side filtering by Department/Faculty might not be fully accurate without student faculty data in SP object.");
                    
                    

            
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
    } else {
         
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
      } finally {
        setInitialLoading(false);  
      }
    };

    fetchData();
  }, []);


   
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


     try {
        
       const filters = {
         adviserIds: selectedAdvisers.map(adviser => adviser.adminId),
         tagIds: selectedTags.map(tag => tag.tagId),
         departmentId: selectedDepartment,
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

 }, [selectedAdvisers, selectedTags, selectedDepartment, debouncedSearchTerm, sortBy, sortDirection, initialLoading]);  

   
  const getAdviserName = (adviserId) => {
    const adviser = adviserData[adviserId];
    if (!adviser) return 'Unknown Adviser';
    return `${adviser.lastName || ''}${adviser.firstName ? ', ' + adviser.firstName : ''}`;
  };

   
   const getAuthors = (sp) => {
      
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
      
     else if (sp.groupId != null && studentGroups[sp.groupId] && Array.isArray(studentGroups[sp.groupId])) {
       const students = studentGroups[sp.groupId];
       if (students.length > 0) {
         return students
           .map(student => `${student.lastName || ''}${student.firstName ? ', ' + student.firstName : ''}`)
           .join('; ');
       }
     }
       
      else if (sp.author) {
        return sp.author;
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
                   onClick={() => setShowAdviserDropdown(true)}  
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
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg">
                   {filteredAdvisers.map(adviser => (
                     <div
                       key={adviser.adminId}
                       className={`p-2 hover:bg-gray-100 cursor-pointer text-dm ${isAnyLoading ? 'cursor-not-allowed' : ''}`}  
                       onClick={() => handleSelectAdviser(adviser)}  
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
                     disabled={isAnyLoading}  
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
                   onClick={() => setShowTagDropdown(true)}  
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
                   className="absolute z-10 w-full bg-white border border-gray-300 rounded-b mt-1 max-h-40 overflow-y-auto shadow-lg">
                   {/* Corrected conditional rendering syntax */}
                   {filteredTags.length > 0 ? (
                     filteredTags.map(tag => (
                       <div
                         key={tag.tagId}
                         className={`p-2 hover:bg-gray-100 cursor-pointer text-dm ${isAnyLoading ? 'cursor-not-allowed' : ''}`}  
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
                     disabled={isAnyLoading}  
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
                disabled={isAnyLoading}  
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
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  disabled={isAnyLoading}  
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
                 flexGrow: 1,  
                 justifyContent: 'center',  
                 marginBottom: { xs: '10px', md: '0' },  
                  
                 '& .Mui-disabled': {
                     opacity: 0.5,
                 }
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
         {/* --- End Custom Pagination (Top) --- */}


          {/* Loading and Error States */}
          {(initialLoading || filterLoading) && <div className="bg-blue-50 p-4 text-center text-blue-700 rounded">Fetching SPs...</div>}
          {error && <div className="bg-red-50 p-4 text-center text-red-700 rounded">{error}</div>}

          {/* SP Results List - Map through currentItems */}
          <div style={{width: '100%', backgroundColor: 'white'}}>
            {/* Top divider */}
            <div className="sp-divider top-divider" style={{backgroundColor: 'rgba(229, 231, 235, 0.7)'}}></div>

            {/* No Results Found Message */}
            {!isAnyLoading && filteredSps.length === 0 && (  
              <div className="bg-gray-100 p-4 text-center text-gray-600 rounded">
                No results found. Try adjusting your filters.
              </div>
            )}

            {/* Map through currentItems instead of filteredSps */}
            {currentItems.map((sp, index) => (
              <div key={sp.spId} className="relative">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {/* --- NEW: Disable link while loading --- */}
                    <a href={isAnyLoading ? '#' : `/project/${sp.spId}`} className={`text-blue-600 hover:underline ${isAnyLoading ? 'cursor-not-allowed' : ''}`} onClick={isAnyLoading ? (e) => e.preventDefault() : () => handleViewCountIncrement(sp.spId)}>{sp.title || 'Untitled Project'}</a>
                  </h3>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="mr-4">
                      <i className="fa-solid fa-pen-to-square"></i>
                      {getAuthors(sp)}
                    </span>
                    <span className="mr-4">
                      <i className="fa-regular fa-clock"></i>
                      {sp.dateIssued ? new Date(sp.dateIssued).toLocaleDateString('en-US', { year: 'numeric', month: 'long'}) : sp.year || 'No Date'}
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
                        className={`bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-gray-300 ${isAnyLoading ? 'cursor-not-allowed' : ''}`}  
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
                   flexGrow: 1,  
                   justifyContent: 'center',  
                   marginBottom: { xs: '10px', md: '0' },  
                     
                    '& .Mui-disabled': {
                        opacity: 0.5,
                    }
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
          {/* --- End Custom Pagination (Bottom) --- */}


        </div>
      </div>
    </div>
  );
};

export default SPFilterSystem;
