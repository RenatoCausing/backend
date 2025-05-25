import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // Required for createPortal
import '../styles/GraphModal.css'
const GraphModal = ({ isOpen, onClose, children, title, chartContainerClassName = '' }) => { // Added chartContainerClassName prop
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset'; // Always ensure scrolling is restored on unmount
    };
  }, [isOpen]);

  // If the modal is not open, don't render anything (this conditional return is fine AFTER hooks)
  if (!isOpen) return null;

  // Use React Portal to render the modal outside the component's DOM hierarchy
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header for Title and Close Button */}
        <div className="modal-header"> {/* New div for header content */}
          {title && <h2 className="modal-title">{title}</h2>} {/* Apply a title class */}
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* The container for the graph */}
        <div className={`modal-graph-container ${chartContainerClassName}`}> {/* Apply the passed class here */}
          {children} {/* This is where your zoomed graph component will go */}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default GraphModal;