// CustomPageMenu.jsx
import React, { useEffect, useState } from 'react';
import { useEditor } from 'tldraw';
import {
  createPage,
  updatePageTitle,
  deletePage,
} from '../../../services/whiteboardService';

export default function CustomPageMenu({
  whiteboardId,
  onClose,
  isOpen: externalIsOpen,
  websocket
}) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  // ✅ Calculate pages on every render
  const pages = editor ? Array.from(editor.store.allRecords())
    .filter(r => r.typeName === 'page')
    .sort((a, b) => {
      if (a.index && b.index)
        return String(a.index).localeCompare(String(b.index));
      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    }) : [];

  // Keep component open state in sync if Tldraw controls it
  useEffect(() => {
    if (typeof externalIsOpen === 'boolean') setOpen(externalIsOpen);
  }, [externalIsOpen]);

  // ✅ Listen to ALL store updates for page changes
  useEffect(() => {
    if (!editor) return;
    
    const unsub = editor.store.listen((entry) => {
      // Check if there are any page-related changes
      const hasPageChanges = 
        (entry.changes?.added && Object.values(entry.changes.added).some(r => r.typeName === 'page')) ||
        (entry.changes?.updated && Object.values(entry.changes.updated).some(([from, to]) => to.typeName === 'page')) ||
        (entry.changes?.removed && Object.values(entry.changes.removed).some(r => r.typeName === 'page'));
      
      if (hasPageChanges) {
        console.log('🔄 Page changes detected in CustomPageMenu');
      }
    });
    
    return () => unsub();
  }, [editor]);

  if (!editor) return null;

  const currentPageId = editor.getCurrentPageId();

  const handleToggle = e => {
    e.stopPropagation();
    setOpen(v => !v);
    if (onClose && open) onClose();
  };

  const handleSwitchPage = async tldrawPageId => {
    if (!editor || !tldrawPageId) return;
    editor.setCurrentPage(tldrawPageId);
    setOpen(false);
  };

  const startEdit = page => {
    setEditingPageId(page.id);
    setEditingValue(page.name ?? '');
  };

  const cancelEdit = () => {
    setEditingPageId(null);
    setEditingValue('');
  };

  const saveEdit = async page => {
    if (!page) return;
    const newTitle = (editingValue ?? '').trim();
    if (!newTitle || newTitle === page.name) {
      cancelEdit();
      return;
    }

    const numericPageId = page.id.split(':')[1];
    
    try {
      // 1. Update API first
      await updatePageTitle(numericPageId, newTitle);
      console.log(`✅ API: Page renamed to: ${newTitle}`);

      // 2. Update local store (this will trigger the listener)
      const updatedRecord = {
        ...page,
        name: newTitle,
      };
      editor.store.put([updatedRecord]);
      
      // 3. Broadcast to other users via WebSocket
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'update_page',
          page: {
            pageId: numericPageId,
            pageTitle: newTitle,
          },
        }));
        console.log('📡 Broadcasted page update from CustomPageMenu');
      } else {
        console.warn('⚠️ WebSocket not ready, cannot broadcast rename');
      }
    } catch (err) {
      console.error('💥 Rename page failed:', err);
      alert('Failed to rename page: ' + err.message);
    } finally {
      cancelEdit();
    }
  };

  const handleDelete = async page => {
    if (!page) return;

    // Safety: don't allow deleting last page
    const pageList = Array.from(editor.store.allRecords()).filter(
      r => r.typeName === 'page'
    );
    if (pageList.length <= 1) {
      alert('Cannot delete the last remaining page.');
      return;
    }

    const confirmDelete = window.confirm(
      `Delete page "${page.name ?? 'Untitled'}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const numericPageId = page.id.split(':')[1];
    try {
      // 1. Delete from API
      await deletePage(numericPageId);
      console.log(`✅ API: Page deleted: ${page.name}`);

      // 2. Remove locally and switch to another page
      editor.store.remove([page.id]);

      // Find another page to switch to (pick the first remaining)
      const remaining = Array.from(editor.store.allRecords()).filter(
        r => r.typeName === 'page'
      );
      if (remaining.length) {
        const nextPageId = remaining[0].id;
        editor.setCurrentPage(nextPageId);
      } else {
        // safety: create a new default page record if none left
        const fallback = {
          id: `page:page`,
          typeName: 'page',
          name: 'New Page',
          index: 'a0',
          meta: {},
        };
        editor.store.put([fallback]);
        editor.setCurrentPage(fallback.id);
      }
      
      // 3. Broadcast deletion via WebSocket
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'delete_page',
          page: {
            pageId: numericPageId,
            pageTitle: page.name,
          },
        }));
        console.log('📡 Broadcasted page deletion from CustomPageMenu');
      } else {
        console.warn('⚠️ WebSocket not ready, cannot broadcast deletion');
      }
    } catch (err) {
      console.error('💥 Delete error', err);
      alert('Error deleting page: ' + err.message);
    }
  };

  const handleCreatePage = async () => {
    const defaultTitle = 'New Page';
    const title =
      window.prompt('Enter new page name:', defaultTitle) ?? defaultTitle;
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      // 1. Create via API
      const newPage = await createPage(whiteboardId, trimmed);
      console.log(`✅ API: Page created:`, newPage);
      
      let pageData;
      if (typeof newPage.message === 'string') {
        pageData = JSON.parse(newPage.message);
      } else {
        pageData = newPage.message || newPage;
      }

      console.log('✅ Parsed page data:', pageData);
      
      // 2. Add to local store and switch to it
      const newRecord = {
        id: `page:${pageData.PageId}`,
        typeName: 'page',
        name: pageData.PageTitle,
        index: `a${pageData.PageId}`,
        meta: {},
      };
      editor.store.put([newRecord]);
      editor.setCurrentPage(newRecord.id);
      
      // 3. Broadcast new page via WebSocket
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'new_page',
          page: {
            pageId: pageData.PageId,
            pageTitle: pageData.PageTitle,
          },
        }));
        console.log('📡 Broadcasted new page from CustomPageMenu');
      } else {
        console.warn('⚠️ WebSocket not ready, cannot broadcast new page');
      }
      
      setOpen(false);
    } catch (err) {
      console.error('💥 Create page error:', err);
      alert('Error creating page: ' + err.message);
    }
  };

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
    >
      <button
        onClick={handleToggle}
        aria-haspopup='menu'
        aria-expanded={open}
        title='Pages'
        style={{
          background: 'var(--tl-color-selected)',
          border: 'none',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          style={{ marginRight: 6 }}
        >
          <path
            d='M4 6h16v12H4z'
            stroke='currentColor'
            strokeWidth='1.5'
            fill='none'
          />
          <path
            d='M8 3v3'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </svg>
        <span style={{ fontSize: 13 }}>Pages</span>
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          style={{ marginLeft: 6 }}
        >
          <path
            d='M6 9l6 6 6-6'
            stroke='currentColor'
            strokeWidth='1.5'
            fill='none'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      {open && (
        <div
          role='menu'
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 8px)',
            minWidth: 220,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            padding: 8,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '4px 6px',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Các trang ({pages.length})</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCreatePage}
                title='Create page'
                style={{
                  border: 'none',
                  background: 'var(--tl-color-selected)',
                  cursor: 'pointer',
                  padding: 6,
                }}
              >
                <svg width='16' height='16' viewBox='0 0 24 24'>
                  <path
                    d='M12 5v14M5 12h14'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            {pages.length === 0 && (
              <div style={{ padding: 8, color: '#666', fontSize: 13 }}>
                No pages
              </div>
            )}

            {pages.map(p => {
              const isActive = p.id === currentPageId;
              const isEditing = editingPageId === p.id;
              return (
                <div
                  key={p.id}
                  role='menuitem'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: isActive
                      ? 'rgba(0, 120, 210, 0.08)'
                      : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{ flex: 1 }}
                    onClick={() => !isEditing && handleSwitchPage(p.id)}
                    title={p.name}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => {
                          e.stopPropagation();
                          if (e.key === 'Enter') saveEdit(p);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={() => saveEdit(p)}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: 13,
                          borderRadius: 4,
                          border: '1px solid #ddd',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: isActive ? '#0b66ff' : '#222',
                          }}
                        >
                          {p.name ?? 'Untitled'}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(p);
                        }}
                        title='Rename'
                        style={{
                          border: 'none',
                          background: 'var(--tl-color-selected)',
                          cursor: 'pointer',
                          padding: 6,
                        }}
                      >
                        <svg width='14' height='14' viewBox='0 0 24 24'>
                          <path
                            d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'
                            fill='currentColor'
                          />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p);
                        }}
                        title='Delete'
                        style={{
                          border: 'none',
                          background: '#eb3434',
                          cursor: 'pointer',
                          padding: 6,
                        }}
                      >
                        <svg width='14' height='14' viewBox='0 0 24 24'>
                          <path
                            d='M3 6h18M8 6v13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2'
                            stroke='currentColor'
                            strokeWidth='1.2'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            style={{ color: '#f4f3f3' }}
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}