import React from 'react';
import '../styles/DeleteConfirmationModal.css'; // We'll create this CSS file next

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemToDelete }) => {
  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Determine the title of the item being deleted
  const itemTitle = itemToDelete?.spTitle || 'this item';

  return (
    // Overlay background
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal content wrapper */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          {/* Close button */}

        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p>
            Are you sure you want to delete <strong>"{itemTitle}"</strong>?
            This action cannot be undone.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {/* Cancel button */}
          <button className="cancel-button" onClick={onClose}>
            Cancel</button>
          {/* Confirm Delete button */}
          <button className="delete-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
