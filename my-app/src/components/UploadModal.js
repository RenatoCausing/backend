import React, { useState, useEffect } from 'react'; // Import useEffect
import '../styles/UploadModal.css'; // Make sure you have this CSS file
import { useUser } from '../contexts/UserContext';

const UploadModal = ({ show, onClose, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);

    // Get user object and loading state from UserContext
    const { currentUser: user, loading: userContextLoading } = useUser();

    // Log the user object and loading state whenever they change
    useEffect(() => {
        console.log("UploadModal: User context loading state:", userContextLoading);
        console.log("UploadModal: Current user from context:", user);
         // Check if user is loaded and has adminId when the modal becomes visible
        if (show && !userContextLoading && (!user || user.adminId === null || user.adminId === undefined)) {
             console.warn("UploadModal: Modal is shown, user context finished loading, but user or adminId is missing.", { user, userContextLoading });
             // Optionally display a message to the user or disable upload button
         }
    }, [user, userContextLoading, show]); // Re-run effect if user, loading state, or show prop changes


    // Ensure user is available and has an adminId (for uploadedBy)
    // Access user?.adminId only after context is not loading
    const uploadedById = (!userContextLoading && user) ? user.adminId : undefined;


    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadError(null); // Clear previous errors
        setUploadResult(null); // Clear previous results
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file first.');
            return;
        }

        // *** FIX: Add check for user context loading and valid user/adminId before proceeding ***
        if (userContextLoading) {
            setUploadError('User data is still loading. Please wait.');
            console.warn("UploadModal: Upload attempted while user context is loading.");
            return;
        }

        if (user === null || user === undefined || uploadedById === null || uploadedById === undefined) {
             // This is the check that is throwing the error if user or adminId is missing
             console.error("UploadModal: Upload attempted but user or adminId is null/undefined.", { user, uploadedById });
             setUploadError('Error: Uploader user not identified. Please ensure you are logged in.');
             return;
         }
        // *** END FIX ***


        setUploading(true);
        setUploadError(null);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('uploadedById', uploadedById); // Send the uploader's ID

        try {
            const response = await fetch('http://localhost:8080/api/sp/upload-csv', {
                method: 'POST',
                body: formData,
                // 'Content-Type': 'multipart/form-data' is automatically set with FormData
                credentials: 'include' // Include cookies for authentication if needed
            });

             // Always attempt to read the response body for more details
            const result = await response.json();

            if (response.ok) {
                setUploadResult(result);
                // Optionally trigger a data refresh in the parent component
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                // Handle backend errors (e.g., validation errors from CSV processing)
                console.error('Upload failed response:', response.status, result); // Log the failed response and body
                setUploadError(result.error || `Upload failed with status: ${response.status}`);
                setUploadResult(result); // Show partial results or backend error details if available
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(`An error occurred during upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Render null if not shown
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Upload SPs via CSV</h2>
                <p>Please upload a CSV file with the following columns (order matters):</p>
                <p><code>title, authors, adviser, date_issued (YYYY-MM-DD), uri, abstract_text, documentPath, tags, year, semester (1st, 2nd, Midyear)</code></p>
                <p>Authors and Tags should be separated by semicolons (;). Author and Adviser names should be in "LastName, FirstName" format.</p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={uploading || userContextLoading || !user || uploadedById === undefined} // Disable input if loading, uploading, or user/adminId is missing
                />

                {selectedFile && (
                    <p>Selected file: {selectedFile.name}</p>
                )}

                {uploadError && (
                    <p className="upload-error">Error: {uploadError}</p>
                )}

                 {/* Display upload result summary if available */}
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


                <button
                    onClick={handleUpload}
                    // Disable if no file, uploading, user context is loading, or user/adminId is missing
                    disabled={!selectedFile || uploading || userContextLoading || !user || uploadedById === undefined}
                    className="upload-button"
                >
                    {uploading ? 'Uploading...' : userContextLoading ? 'Loading User...' : 'Upload CSV'}
                </button>

                <button
                    onClick={() => {
                        onClose();
                        setSelectedFile(null); // Clear file input on close
                        setUploadError(null); // Clear errors on close
                        setUploadResult(null); // Clear results on close
                    }}
                    className="close-button"
                    disabled={uploading} // Disable close button while uploading
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default UploadModal;
