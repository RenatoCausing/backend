import React from 'react';
import '../styles/DeleteConfirmationModal.css'; // Assuming your CSS file is in this path

// Receive the isDeleting and isRefreshingList props
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemToDelete, isDeleting, isRefreshingList }) => {
  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Determine the title of the item being deleted
  const itemTitle = itemToDelete?.spTitle || 'this item';

  // Determine if buttons should be disabled (either deleting or refreshing)
  const isProcessing = isDeleting || isRefreshingList;

  return (
    // Overlay background
    // Prevent closing the modal by clicking the overlay while processing
    <div className="modal-overlay" onClick={isProcessing ? null : onClose}>
      {/* Modal content wrapper */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Show message based on current state */}
          {isDeleting ? (
              <p>Deleting <strong>"{itemTitle}"</strong>... Please wait.</p>
          ) : isRefreshingList ? (
              <p>Deletion successful! Refreshing list... Please wait.</p>
          ) : (
              <p>
                Are you sure you want to delete <strong>"{itemTitle}"</strong>?
                This action cannot be undone.
              </p>
          )}
           {/* Optional: Add a simple loading spinner while processing */}
           {isProcessing && (
               <div className="loading-spinner"></div>
           )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {/* Cancel button - Disable while processing */}
          <button className="cancel-button" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          {/* Confirm Delete button - Disable while processing */}
          <button className="delete-button" onClick={onConfirm} disabled={isProcessing}>
            {isDeleting ? 'Deleting...' : isRefreshingList ? 'Deleting...' : 'Delete'} {/* Change button text based on state */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
