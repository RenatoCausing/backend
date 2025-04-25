// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserProvider } from './contexts/UserContext';

const rootElement = document.getElementById('root'); // Get the root element

// --- TEMPORARY DEBUGGING CODE: START ---
// This will observe changes made to the #root element's children
if (rootElement) {
    const observer = new MutationObserver((mutationsList, observer) => {
        console.log('Root element change detected!');
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('Mutation: Child nodes added:', mutation.addedNodes);
                // Log details about the added nodes
                mutation.addedNodes.forEach(node => {
                    console.log('  Added node:', node);
                    console.log('  Node Type:', node.nodeType); // Node.TEXT_NODE is 3, Node.ELEMENT_NODE is 1
                    if (node.nodeType === Node.TEXT_NODE) {
                         console.log('  Text Content:', `'${node.textContent}'`); // Log text content
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                         console.log('  Element Tag:', node.tagName); // Log element tag
                    }
                });
            }
        }
        // If you want to stop observing after the first few changes, you can disconnect:
        // observer.disconnect();
        // console.log('Root observer disconnected');
    });

    // Start observing #root for changes in its direct children
    observer.observe(rootElement, { childList: true });
    console.log('MutationObserver started for #root');
} else {
    console.error('Could not find root element!');
}
// --- TEMPORARY DEBUGGING CODE: END ---


const root = ReactDOM.createRoot(rootElement); // Use the same rootElement

root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// Note: Keep the observer code BEFORE the root.render call.