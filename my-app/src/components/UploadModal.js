import React, { useState, useEffect, useRef } from 'react';
import '../styles/UploadModal.css';
import { useUser } from '../contexts/UserContext';

const UploadModal = ({ show, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

     
     

     
    const { currentUser: user, loading: userContextLoading } = useUser();

     
    useEffect(() => {
        console.log("UploadModal: User context loading state:", userContextLoading);
        console.log("UploadModal: Current user from context:", user);
         
        if (show && !userContextLoading && (!user || user.adminId === null || user.adminId === undefined)) {
            console.warn("UploadModal: Modal is shown, user context finished loading, but user or adminId is missing.", { user, userContextLoading });
             
        }
    }, [user, userContextLoading, show]);

     
     
    const uploadedById = (!userContextLoading && user) ? user.adminId : undefined;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
            setUploadError(null);
            setUploadResult(null);
        } else {
            setSelectedFile(null);  
            setUploadError('Please select a valid CSV file.');
            setUploadResult(null);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            if (file.type === 'text/csv') {
                setSelectedFile(file);
                setUploadError(null);
                setUploadResult(null);
            } else {
                setSelectedFile(null);  
                setUploadError('Please select a valid CSV file.');
                setUploadResult(null);
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

     
     
     
     


    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file first.');
            return;
        }

         
        if (userContextLoading) {
            setUploadError('User data is still loading. Please wait.');
            console.warn("UploadModal: Upload attempted while user context is loading.");
            return;
        }

        if (user === null || user === undefined || uploadedById === null || uploadedById === undefined) {
            console.error("UploadModal: Upload attempted but user or adminId is null/undefined.", { user, uploadedById });
            setUploadError('Error: Uploader user not identified. Please ensure you are logged in.');
            return;
        }

         
         
         
         
         


        setUploading(true);
        setUploadError(null);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('uploadedById', uploadedById);
         
         


        try {
            const response = await fetch('http://localhost:8080/api/sp/upload-csv', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

             
            const result = await response.json();

            if (response.ok) {
                setUploadResult(result);
                 
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                 
                console.error('Upload failed response:', response.status, result);
                setUploadError(result.error || `Upload failed with status: ${response.status}`);
                setUploadResult(result);  
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(`An error occurred during upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

     
    if (!show) {
        return null;
    }

    const handleSelectFilesClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button
                    className="close-modal-button"
                    onClick={onClose}
                    disabled={uploading}
                >
                    ×
                </button>

                <h2>Upload SPs with CSV</h2>
                <p className="upload-description">
                    Select the CSV file to upload. Ensure it includes the Department column.
                </p>

                 {/* Removed Department (Faculty) Select */}
                 {/* <div className="form-group">
                     <label htmlFor="upload-faculty" className="upload-label">Department:</label>
                     <select
                         id="upload-faculty"
                         className="upload-select"
                         value={selectedFacultyId}
                         onChange={handleFacultyChange}
                         disabled={uploading || userContextLoading || !user || uploadedById === undefined}
                     >
                         <option value="">Select Department</option>
                         <option value="1">BSBC</option>
                         <option value="2">BSCS</option>
                         <option value="3">BSAP</option>
                     </select>
                 </div> */}


                <div
                    className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="upload-icon">
                        {selectedFile ? (
                            <svg viewBox="0 0 24 24" width="40" height="40">
                                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="40" height="40">
                                <path fill="currentColor" d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04M19,18H6A4,4 0 0,1 2,14C2,11.95 3.53,10.24 5.56,10.03L6.63,9.92L7.13,8.97C8.08,7.14 9.94,6 12,6C14.62,6 16.88,7.86 17.39,10.43L17.69,11.93L19.22,12.04C20.78,12.14 22,13.45 22,15A3,3 0 0,1 19,18M8,13H10.55V16H13.45V13H16L12,9L8,13Z" />
                            </svg>
                        )}
                    </div>

                    <div className="upload-prompt">
                        {selectedFile ? (
                            <p className="selected-filename">{selectedFile.name}</p>
                        ) : (
                            <>
                                <p>Drag and drop CSV file to upload</p>
                                <p className="upload-note">Your file will be private until you publish.</p>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={uploading || userContextLoading || !user || uploadedById === undefined}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="select-files-button"
                        onClick={handleSelectFilesClick}
                        disabled={uploading || userContextLoading || !user || uploadedById === undefined}
                    >
                        Select file
                    </button>
                </div>

                {uploadError && (
                    <p className="upload-error">Error: {uploadError}</p>
                )}

                {uploadResult && (
                    <div className="upload-results">
                        <h3>Upload Summary:</h3>
                        <p>Processed Rows: {uploadResult.processedRows}</p>
                        <p>Successfully Uploaded: {uploadResult.successCount}</p>
                        <p>Failed Rows: {uploadResult.errorCount}</p>
                        {uploadResult.errors && uploadResult.errors.length > 0 && (
                            <div>
                                <h4>Details:</h4>
                                <ul>
                                    {uploadResult.errors.map((error, index) => (
                                        <li key={index} className="upload-error-detail">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="cancel-button"
                        disabled={uploading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || userContextLoading || !user || uploadedById === undefined}  
                        className="upload-button"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>

                <div className="upload-guide">
                    <details>
                        <summary>Required CSV format</summary>
                        <div className="guide-content">
                            <p>Your CSV file should have these columns (in this order):</p>
                             <p><code>title, authors, adviser, uri, abstract_text, documentPath, faculty (BSBC, BSCS, BSAP), tags, year, semester (1st, 2nd, Midyear)</code></p>
                            <p>- NULLABLE Columns: <code>uri</code>, <code>tags</code>,  </p> {/* Updated nullable columns */}
                            <p>- Author and Adviser names should be in "LastName, FirstName" format.</p>
                            <p>- Authors and Tags should be separated by semicolons (;).</p>
                            <p>- **Faculty column must contain 'BSBC', 'BSCS', or 'BSAP'.**</p>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;