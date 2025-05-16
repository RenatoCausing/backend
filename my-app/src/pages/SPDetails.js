import React, { useState, useEffect, useRef } from 'react';
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
  faUser,
  faUniversity,
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import '../styles/SPDetails.css';

function SPDetails() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const [spData, setSpData] = useState(null);
  const [adviser, setAdviser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';
  
  // Default journal image path
  const defaultJournalImage = '/images/journal.jpg';

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

        // Fetch adviser data if available
        if (spDataResponse.adviserId) {
          const adviserResponse = await fetch(`${BACKEND_URL}/api/advisers/${spDataResponse.adviserId}`);

          if (!adviserResponse.ok) {
            console.error(`Adviser API responded with ${adviserResponse.status}: ${adviserResponse.statusText}`);
          } else {
            const adviserData = await adviserResponse.json();
            console.log('Adviser data:', adviserData);
            setAdviser(adviserData);
          }
        } else {
          console.log('No adviserId found in SP data.');
          setAdviser(null);
        }

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
  }, [spId, BACKEND_URL]); 

  // Get tags for this SP
  const getTagsForSp = () => {
    if (!tags || !Array.isArray(tags) || !spData || !spData.tagIds || !Array.isArray(spData.tagIds)) return [];
    return tags.filter(tag => spData.tagIds.includes(tag.tagId));
  };

  // Handle tag click to redirect to search page with selected tag
  const handleTagClick = (tagName) => {
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

  // Instead of directly using Google Drive URLs, create a backend proxy endpoint
  // This will avoid CSP issues by having your backend fetch the content
  const getFileProxyUrl = (type, fileId) => {
    if (!fileId) return null;
    return `${BACKEND_URL}/api/files/proxy/${type}/${fileId}`;
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

  // Build URLs for resources
  const getResourceUrls = () => {
    if (!spData?.documentPath) return { thumbnail: null, download: null, viewerUrl: null };
    
    const fileId = extractGoogleDriveFileId(spData.documentPath);
    if (!fileId) return { thumbnail: null, download: null, viewerUrl: null };

    return {
      // Use proxy for thumbnail
      thumbnail: getFileProxyUrl('thumbnail', fileId),
      // Use direct Google Drive URL for download
      download: getGoogleDriveDownloadUrl(spData.documentPath),
      // Use direct Google Drive URL for preview
      viewerUrl: getGoogleDrivePdfViewerUrl(spData.documentPath),
    };
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

  // Get resource URLs
  const { thumbnail, download, viewerUrl } = getResourceUrls();

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

            {download && (
              <a href={download} className="download-button" target="_blank" rel="noopener noreferrer">
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

          {/* PDF thumbnail with fallback to default image */}
          <div className="journal-image">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt="PDF Preview"
                className="pdf-thumbnail"
                style={{
                  width: '180px', 
                  height: 'auto',
                  minHeight: '180px',
                  objectFit: 'contain',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  console.log('Thumbnail failed to load, using default image');
                  e.target.src = defaultJournalImage;
                }}
              />
            ) : (
              <div className="default-document-icon" style={{
                width: '180px',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa'
              }}>
                <FontAwesomeIcon icon={faFilePdf} size="5x" color="#c71f37" />
              </div>
            )}
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
                <a href={`/adviser/${adviser.adminId}`}>
                  {adviser.firstName} {adviser.lastName}
                </a>
              </p>
            </div>
          )}
           {/* Display Faculty */}
           {spData.facultyId && (
             <div className="adviser-info" style={{ marginLeft: '1rem' }}>
               <div className="adviser-header">
                 <FontAwesomeIcon icon={faUniversity} className="faculty-icon" />
                 <h3>Department</h3>
               </div>
               <p>
                 {/* Map facultyId to name */}
                 {spData.facultyId === 1 && 'BSBC'}
                 {spData.facultyId === 2 && 'BSCS'}
                 {spData.facultyId === 3 && 'BSAP'}
               </p>
             </div>
           )}
        </section>

        {/* Abstract section */}
        <section className="abstract-section">
          <h2>Abstract</h2>
          <div className="abstract-content">
            <p className='abstract-text'>{spData.abstractText || 'No abstract available.'}</p>
          </div>
        </section>

        {/* PDF Viewer section using iframe with Google Drive viewer */}
        {viewerUrl && (
          <section className="pdf-section">
            <h2>Article PDF</h2>
            <div className="pdf-container">
              <div className="google-drive-viewer">
                <iframe
                  src={viewerUrl}
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