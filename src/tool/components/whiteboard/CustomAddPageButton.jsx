//CustomeAddPageButton.jsx
import React from 'react';
import { useEditor } from '@tldraw/tldraw';
import { createPage } from '../../../services/whiteboardService';

// This component receives whiteboardId as a prop
export function CustomAddPageButton({ whiteboardId }) {
  const editor = useEditor();

  const handleCreatePage = async () => {
    const newPageTitle = prompt('Enter new page name:', 'New Page');
    if (!newPageTitle) return;

    // 1. Call your backend API with the absolute URL
    const newPage = await createPage(whiteboardId, newPageTitle);

    console.log(`✅ Page created:`, newPage);
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
      title='Create new page'
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Simple '+' icon */}
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M8 3.5V12.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.5 8H12.5'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
}
