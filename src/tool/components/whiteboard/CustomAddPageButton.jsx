//CustomeAddPageButton.jsx
import React from 'react';
import { useEditor } from '@tldraw/tldraw';

// This component receives whiteboardId as a prop
export function CustomAddPageButton({ whiteboardId }) {
  const editor = useEditor();

  const handleCreatePage = async () => {
    const newPageTitle = prompt('Enter new page name:', 'New Page');
    if (!newPageTitle) return;

    // 1. Call your backend API with the absolute URL
    const response = await fetch(`http://localhost:5103/api/whiteboards/${whiteboardId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Your DTO has "PageTitle" (uppercase P)
      body: JSON.stringify({ PageTitle: newPageTitle }), 
    });

    if (!response.ok) {
        console.error("Failed to create page");
        return;
    }

    // 2. Get the new page back from the API
    const newPage = await response.json();

    // 3. Your backend will now broadcast the 'new_page' event,
    //    so all *other* users will see it.
    
    // 4. For the *current user*, we can add and switch to it instantly.
    const newPageRecord = {
      id: `page:${newPage.pageId}`,
      typeName: 'page',
      name: newPage.pageTitle,
      index: `a${newPage.pageId}`, // Use the "a" prefix
      meta: {},
    };

    editor.store.put([newPageRecord]);
    editor.setCurrentPage(newPageRecord.id);
  };

  return (
    <button
      onClick={handleCreatePage}
      title="Create new page"
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Simple '+' icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}