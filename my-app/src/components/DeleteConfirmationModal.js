import React from 'react';
import '../styles/DeleteConfirmationModal.css';  

 
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemToDelete, isDeleting, isRefreshingList }) => {
   
  if (!isOpen) {
    return null;
  }

   
  const itemTitle = itemToDelete?.spTitle || 'this item';

   
  const isProcessing = isDeleting || isRefreshingList;

  return (
     
     
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
