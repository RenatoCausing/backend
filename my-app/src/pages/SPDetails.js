import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { Document, Page, pdfjs } from 'react-pdf';
import '../styles/SPDetails.css';

// Configure PDF.js worker with correct CDN URL and version
// Use specific version that exists on CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

function SPDetails() {
  const { spId } = useParams();
  const [spData, setSpData] = useState(null);
  const [adviser, setAdviser] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  
  // Backend URL
  const BACKEND_URL = 'http://localhost:8080';

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
        
        // Increment view count
        try {
          await fetch(`${BACKEND_URL}/api/sp/${spId}/view`, {
            method: 'POST'
          });
        } catch (viewError) {
          console.error("Error incrementing view count:", viewError);
        }
        
        // Fetch adviser data
        const adviserResponse = await fetch(`${BACKEND_URL}/api/advisers/sp/${spId}`);
        
        if (!adviserResponse.ok) {
          console.error(`Adviser API responded with ${adviserResponse.status}: ${adviserResponse.statusText}`);
        } else {
          const adviserData = await adviserResponse.json();
          console.log('Adviser data:', adviserData);
          setAdviser(adviserData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please check API connection and try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [spId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setPdfError("Failed to load PDF. Please try again later.");
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));

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

  return (
    <div className="sp-details-container">
      <Navbar />
      
      {/* Header Section with deep red background */}
      <div className="Acontainer">
        <header className="sp-header">
          <div className="sp-header-content">
            <h1>{spData.title}</h1>
            <p>Semester: {spData.semester} | Date Issued: {new Date(spData.dateIssued || spData.date_issued).toLocaleDateString()}</p>
            <p>Tags: {Array.isArray(spData.tags) ? spData.tags.join(', ') : (spData.tags || '')}</p>
            
            {(spData.documentPath || spData.uri) && (
              <a href={spData.documentPath || spData.uri} className="download-button" download>
                <FontAwesomeIcon icon={faDownload} /> Download PDF
              </a>
            )}
            
            <span className="access-info">
              Access provided by University of the Philippines Manila
            </span>
          </div>
          
          {/* Journal image on the right */}
          <div className="journal-image">
            <img src="/images/journal-cover.png" alt="Journal Cover" />
          </div>
        </header>
        
        {/* Author information */}
        <section className="author-section">
          {adviser && (
            <p>
              <a href={`/adviser/${adviser.adminId || adviser.admin_id}`}>
                {adviser.firstName || adviser.first_name} {adviser.lastName || adviser.last_name}
              </a>
            </p>
          )}
          
          {/* View counter */}
          <div className="view-counter">
            <FontAwesomeIcon icon={faEye} /> {spData.viewCount || spData.view_count || 0} Views
          </div>
        </section>
        
        {/* Abstract section */}
        <section className="abstract-section">
          <h2>Abstract</h2>
          <div className="abstract-content">
            <p>{spData.abstractText || spData.abstract_text || spData.abstract}</p>
          </div>
        </section>
        
        {/* PDF Viewer section */}
        {(spData.documentPath || spData.uri) && (
          <section className="pdf-section">
            <h2>Article PDF</h2>
            <div className="pdf-container">
              <div className="pdf-controls">
                <button onClick={previousPage} disabled={pageNumber <= 1}>
                  ‹
                </button>
                <span>{pageNumber} / {numPages || '?'}</span>
                <button onClick={nextPage} disabled={!numPages || pageNumber >= numPages}>
                  ›
                </button>
                <span className="zoom-controls">
                  <button onClick={zoomOut}>−</button>
                  <span>{Math.round(scale * 100)}%</span>
                  <button onClick={zoomIn}>+</button>
                </span>
              </div>
              
              {pdfError ? (
                <div className="pdf-error">
                  <p>{pdfError}</p>
                  <p>You can still download the PDF using the download button above.</p>
                </div>
              ) : (
                <Document
                  file={spData.documentPath || spData.uri}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  className="pdf-document"
                  loading="Loading PDF..."
                >
                  {numPages > 0 && (
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading="Loading page..."
                    />
                  )}
                </Document>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SPDetails;