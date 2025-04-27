import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faEye,
  faChevronLeft,
  faChevronRight,
  faMinus,
  faPlus,
  faEdit,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import '../styles/SPDetails.css';

function SPDetails() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const [spData, setSpData] = useState(null);
  // Removed the separate students state
  // const [students, setStudents] = useState([]);
  const [adviser, setAdviser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!spId) {
        setError("SP ID not found in URL");
        setLoading(false);
        return;
      }

      try {
        // Fetch SP data
        const spResponse = await fetch(`${BACKEND_URL}/api/sp/${spId}`);

        if (!spResponse.ok) {
          throw new Error(`API responded with ${spResponse.status}: ${spResponse.statusText}`);
        }

        const spDataResponse = await spResponse.json();
        console.log('SP data:', spDataResponse);
        setSpData(spDataResponse);


        // Fetch adviser data (still needed as SPDTO only contains adviserId)
        // Check if adviserId is present in the fetched SP data
        if (spDataResponse.adviserId) {
             const adviserResponse = await fetch(`${BACKEND_URL}/api/advisers/${spDataResponse.adviserId}`); // Fetch adviser by ID

             if (!adviserResponse.ok) {
               console.error(`Adviser API responded with ${adviserResponse.status}: ${adviserResponse.statusText}`);
             } else {
               const adviserData = await adviserResponse.json();
               console.log('Adviser data:', adviserData);
               setAdviser(adviserData);
             }
        } else {
             console.log('No adviserId found in SP data.');
             setAdviser(null); // Ensure adviser state is null if no adviserId
        }

        // Removed fetching students by group_id
        // if (spDataResponse.groupId) {
        //   const studentsResponse = await fetch(`${BACKEND_URL}/api/students/group/${spDataResponse.groupId}`);
        //   if (studentsResponse.ok) {
        //     const studentsData = await studentsResponse.json();
        //     console.log('Students data:', studentsData);
        //     setStudents(studentsData || []);
        //   } else {
        //     console.error(`Students API responded with ${studentsResponse.status}: ${studentsResponse.statusText}`);
        //   }
        // }


        // Fetch all tags
        try {
          const tagsResponse = await fetch(`${BACKEND_URL}/api/tags`);
          if (tagsResponse.ok) {
            const allTags = await tagsResponse.json();
            console.log('All tags:', allTags);
            setTags(allTags || []);
          } else {
            console.error(`Tags API responded with ${tagsResponse.status}: ${tagsResponse.statusText}`);
          }
        } catch (tagError) {
          console.error("Error fetching tags:", tagError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please check API connection and try again.");
        setLoading(false);
      }
    };

    fetchData();
    // Add spData.adviserId to dependencies to re-fetch adviser if SP data changes and adviserId changes
  }, [spId, BACKEND_URL]); // Added BACKEND_URL as a dependency


  // Removed the formatStudentName function as authors are now provided as formatted strings
  // const formatStudentName = (student) => {
  //   if (!student) return '';

  //   let formattedName = `${student.lastName || ''}`;

  //   if (student.firstName) {
  //     formattedName += `, ${student.firstName}`;
  //   }

  //   if (student.middleName) {
  //     formattedName += ` ${student.middleName}`;
  //   }

  //   return formattedName;
  // };


  // Get tags for this SP
  const getTagsForSp = () => {
    // Use spData.tagIds directly which is already populated by the backend DTO
    if (!tags || !Array.isArray(tags) || !spData || !spData.tagIds || !Array.isArray(spData.tagIds)) return [];
    return tags.filter(tag =>
      spData.tagIds.includes(tag.tagId)
    );
  };

  // Handle tag click to redirect to search page with selected tag
  const handleTagClick = (tagName) => {
    // Redirect to search page with tag name in query params
    navigate(`/search?tag=${encodeURIComponent(tagName)}`);
  };

  // Extract Google Drive file ID from various URL formats
  const extractGoogleDriveFileId = (url) => {
    if (!url) return null;

    // Handle direct file IDs
    if (!url.includes('/') && !url.includes('drive.google.com')) {
      return url;
    }

    // Extract from standard Drive URLs
    const fileIdMatch = url.match(/\/d\/([^\/]+)/) ||
                          url.match(/id=([^&]+)/) ||
                          url.match(/file\/d\/([^\/]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }

    return null;
  };

  // Get Google Drive thumbnail URL (uses Google's thumbnail service)
  const getGoogleDriveThumbnailUrl = (driveUrl) => {
    const fileId = extractGoogleDriveFileId(driveUrl);
    if (!fileId) return null;

    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w480`;
  };

  // Get the Google Drive PDF URL for direct download
  const getGoogleDriveDownloadUrl = (driveUrl) => {
    const fileId = extractGoogleDriveFileId(driveUrl);
    if (!fileId) return null;

    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

  // Get the Google Drive PDF viewer URL
  const getGoogleDrivePdfViewerUrl = (driveUrl) => {
    const fileId = extractGoogleDriveFileId(driveUrl);
    if (!fileId) return null;

    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  // Get tag color based on tag name
  const getTagColor = (tagName) => {
    if (!tagName) return '#6c757d'; // Default gray

    // Map specific tag categories to colors
    const tagColors = {
      'Machine Learning': '#007bff',
      'Web Development': '#6c757d',
      'Data Science': '#17a2b8',
      'Artificial Intelligence': '#28a745',
      'Mobile Development': '#fd7e14',
      'Database': '#dc3545',
      'Security': '#e83e8c',
    };

    // Return specific color if defined, otherwise return default
    return tagColors[tagName] || '#6c757d';
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="loading">Loading project details...</div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="error-message">{error}</div>
    </div>
  );

  if (!spData) return (
    <div>
      <Navbar />
      <div className="error-message">Project data not found</div>
    </div>
  );

  const thumbnailUrl = getGoogleDriveThumbnailUrl(spData.documentPath);
  const downloadUrl = getGoogleDriveDownloadUrl(spData.documentPath);
  const pdfViewerUrl = getGoogleDrivePdfViewerUrl(spData.documentPath);

  return (
    <div className="sp-details-container">
      <Navbar />

      <div className="Acontainer">
        {/* Header Section with deep red background */}
        <header className="sp-header">
          <div className="sp-header-content">
            <h1>{spData.title}</h1>
            {/* Display year and semester */}
            <p>
              Year: {spData.year || 'N/A'} | Semester: {spData.semester || 'N/A'} | Date Issued: {spData.dateIssued ? new Date(spData.dateIssued).toLocaleDateString() : 'N/A'}
            </p>

            {/* Updated tag display with pill styling */}
            <div className="tags-container">
              {tags && tags.length > 0 ?
                getTagsForSp().map((tag, index) => (
                  <span
                    key={index}
                    className="tag-pill"
                    style={{ backgroundColor: getTagColor(tag.tagName || tag.name) }}
                    onClick={() => handleTagClick(tag.tagName || tag.name)}
                  >
                    {tag.tagName || tag.name || 'Unknown Tag'}
                  </span>
                ))
                : <span>No tags available</span>
              }
            </div>

            {downloadUrl && (
              <a href={downloadUrl} className="download-button" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faDownload} /> Download PDF
              </a>
            )}

            <span className="access-info">
              Access provided by University of the Philippines Manila
            </span>

            {/* Moved view counter below access info */}
            <div className="view-counter-header">
              <FontAwesomeIcon icon={faEye} /> {spData.viewCount || 0} views
            </div>
          </div>

          {/* PDF thumbnail only - no default journal image */}
          <div className="journal-image">
            {thumbnailUrl && !thumbnailFailed ? (
              <img
                src={thumbnailUrl}
                alt="PDF Preview"
                className="pdf-thumbnail"
                onError={() => {
                  console.log(thumbnailUrl);
                  console.log("Thumbnail failed to load, removing image.");
                  setThumbnailFailed(true);
                }}
              />
            ) : null}
          </div>
        </header>

        {/* Author section as a column */}
        <section className="contributors-section">
          {/* Display student authors using spData.authors */}
          {spData.authors && spData.authors.length > 0 && (
            <div className="student-authors" >
              <div className="author-header">
                <FontAwesomeIcon icon={faEdit} className="author-icon" />
                <h3>Authors</h3>
              </div>
              <p className= "author-name">
                 {/* Map directly over the authors array from spData */}
                 {spData.authors.map((author, index) => (
                     <span key={index}>
                         {author}
                         {index < spData.authors.length - 1 ? '; ' : ''}
                     </span>
                 ))}
              </p>
            </div>
          )}

          {/* Display adviser with icon */}
          {adviser && (
            <div className="adviser-info" style = {{marginLeft: '1rem'}}>
              <div className="adviser-header">
                <FontAwesomeIcon icon={faUser} className="adviser-icon" />
                <h3>Adviser</h3>
              </div>
              <p>
                <a href={`/adviser/${adviser.adminId}`}> {/* Use adviser.adminId */}
                  {adviser.firstName} {adviser.lastName} {/* Use adviser.firstName and adviser.lastName */}
                </a>
              </p>
            </div>
          )}
           {/* Display Faculty */}
           {spData.facultyId && (
             <div className="faculty-info" style={{ marginLeft: '1rem' }}>
               <div className="faculty-header">
                 <FontAwesomeIcon icon={faUser} className="faculty-icon" /> {/* You might want a different icon */}
                 <h3>Department</h3>
               </div>
               <p>
                 {/* Map facultyId to name - assuming BSBC, BSCS, BSAP are 1, 2, 3 */}
                 {spData.facultyId === 1 && 'BSBC'}
                 {spData.facultyId === 2 && 'BSCS'}
                 {spData.facultyId === 3 && 'BSAP'}
                 {/* Add more cases if you have more faculties */}
               </p>
             </div>
           )}
        </section>

        {/* Abstract section */}
        <section className="abstract-section">
          <h2>Abstract</h2>
          <div className="abstract-content">
            {/* Use spData.abstractText directly */}
            <p className='abstract-text'>{spData.abstractText || 'No abstract available.'}</p>
          </div>
        </section>

        {/* Google Drive PDF Viewer section */}
        {pdfViewerUrl && (
          <section className="pdf-section">
            <h2>Article PDF</h2>
            <div className="pdf-container">
              <div className="google-drive-viewer">
                <iframe
                  src={pdfViewerUrl}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                  allowFullScreen
                  title="PDF Viewer"
                ></iframe>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SPDetails;