import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/AdviserNavbar';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import '../styles/SPDetails.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function SPDetails() {
  const { spId } = useParams();
  const [spData, setSpData] = useState(null);
  const [adviser, setAdviser] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!spId) {
        setError("SP ID not found in URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch SP data
        const spResponse = await axios.get(`http://localhost:8080/api/sp/${spId}`);
        setSpData(spResponse.data);
        
        // Increment view count
        await axios.post(`http://localhost:8080/api/sp/${spId}/view`)
          .catch(error => console.error("Error incrementing view count:", error));
        
        // Fetch adviser data
        const adviserResponse = await axios.get(`http://localhost:8080/api/advisers/sp/${spId}`);
        setAdviser(adviserResponse.data);
        
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
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!spData) return <div className="error-message">SP data not found</div>;

  return (
    <div className="sp-details-container">
      <Navbar />
      
      {/* Header Section with deep red background */}
      <header className="sp-header">
        <div className="sp-header-content">
          <h1>{spData.title}</h1>
          <p>Semester: {spData.semester} | Date Issued: {new Date(spData.date_issued).toLocaleDateString()}</p>
          <p>Tags: {Array.isArray(spData.tags) ? spData.tags.join(', ') : spData.tags}</p>
          
          {spData.uri && (
            <a href={spData.uri} className="download-button" download>
              <FontAwesomeIcon icon={faDownload} /> Download PDF
            </a>
          )}
          
          <span className="access-info">
            Access provided by University of the Philippines Diliman
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
            <a href={`/advisers/${adviser.admin_id}`}>
              {adviser.first_name} {adviser.last_name}
            </a>
          </p>
        )}
        
        {/* View counter */}
        <div className="view-counter">
          <FontAwesomeIcon icon={faEye} /> {spData.view_count || 0} Views
        </div>
      </section>
      
      {/* Abstract section */}
      <section className="abstract-section">
        <h2>Abstract</h2>
        <div className="abstract-content">
          <p>{spData.abstract_text || spData.abstract}</p>
        </div>
      </section>
      
      {/* PDF Viewer section */}
      {spData.uri && (
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
            
            <Document
              file={spData.uri}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error("PDF load error:", error)}
              className="pdf-document"
            >
              {numPages > 0 && (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>
          </div>
        </section>
      )}
    </div>
  );
}

export default SPDetails;