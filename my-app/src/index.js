 
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserProvider } from './contexts/UserContext';

const rootElement = document.getElementById('root');  

 
 
if (rootElement) {
    const observer = new MutationObserver((mutationsList, observer) => {
        console.log('Root element change detected!');
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('Mutation: Child nodes added:', mutation.addedNodes);
                 
                mutation.addedNodes.forEach(node => {
                    console.log('  Added node:', node);
                    console.log('  Node Type:', node.nodeType);  
                    if (node.nodeType === Node.TEXT_NODE) {
                         console.log('  Text Content:', `'${node.textContent}'`);  
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                         console.log('  Element Tag:', node.tagName);  
                    }
                });
            }
        }
         
         
         
    });

     
    observer.observe(rootElement, { childList: true });
    console.log('MutationObserver started for #root');
} else {
    console.error('Could not find root element!');
}
 


const root = ReactDOM.createRoot(rootElement);  

root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

 