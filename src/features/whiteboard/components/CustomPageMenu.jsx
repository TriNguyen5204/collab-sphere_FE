import React, { useEffect, useState, useRef } from 'react';
import { useEditor, useValue, getIndexAbove } from 'tldraw';
import {
  createPage,
  updatePageTitle,
  deletePage,
} from '../services/whiteboardService';
import { toast } from 'sonner';
import useToastConfirmation from '../../../hooks/useToastConfirmation';

export default function CustomPageMenu({
  whiteboardId,
  onClose,
  isOpen: externalIsOpen,
  websocket,
}) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const confirmWithToast = useToastConfirmation();

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  const DEFAULT_TLDRAW_PAGE_ID = 'page:page';

  // ✅ Calculate pages dynamically
  const pages = useValue(
    'pages list',
    () => {
      if (!editor) return [];
      return Array.from(editor.store.allRecords())
        .filter(r => r.typeName === 'page')
        .sort((a, b) => {
          if (a.index && b.index)
            return String(a.index).localeCompare(String(b.index));
          return String(a.name ?? '').localeCompare(String(b.name ?? ''));
        });
    },
    [editor]
  ); // Dependency là editor

  useEffect(() => {
    if (typeof externalIsOpen === 'boolean') setOpen(externalIsOpen);
  }, [externalIsOpen]);

  // Click outside handler
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = e => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open, onClose]);

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

  // ========== CREATE PAGE ==========
  const handleCreatePage = async () => {
    const nextIndex = pages.length + 1;
    const defaultTitle = `Page ${nextIndex}`;

    const createPromise = async () => {
      try {
        const newPage = await createPage(whiteboardId, defaultTitle);

        // Parse response
        let pageData = newPage;
        if (newPage.message && typeof newPage.message === 'string') {
          try {
            pageData = JSON.parse(newPage.message);
          } catch (e) {
            console.warn('Failed to parse message:', e);
          }
        } else if (newPage.message) {
          pageData = newPage.message;
        }

        // Extract page ID and title (handle different response formats)
        const pId = pageData.PageId || pageData.pageId || pageData.id;
        const pTitle =
          pageData.PageTitle ||
          pageData.pageTitle ||
          pageData.title ||
          defaultTitle;

        if (!pId) {
          throw new Error('No page ID returned from server');
        }

        console.log('✅ Creating page with ID:', pId, 'Title:', pTitle);

        // Create page record
        let newIndex = 'a1'; // Default for first page
        if (pages.length > 0) {
          const sortedPages = [...pages].sort((a, b) =>
            (a.index || '').localeCompare(b.index || '')
          );
          const lastPage = sortedPages[sortedPages.length - 1];
          newIndex = getIndexAbove(lastPage.index || 'a1');
        }

        const newRecord = {
          id: `page:${pId}`,
          typeName: 'page',
          name: pTitle,
          index: newIndex, // Proper fractional index
          meta: {},
        };

        // Add to store and switch to it
        editor.store.put([newRecord]);
        editor.setCurrentPage(newRecord.id);

        // ✅ Broadcast via WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          const payload = {
            type: 'new_page',
            page: {
              pageId: pId,
              pageTitle: pTitle,
            },
          };
          websocket.send(JSON.stringify(payload));
          console.log(' Broadcasted new_page:', payload);
        } else {
          console.warn('WebSocket not ready, cannot broadcast new page');
        }

        return pTitle;
      } catch (error) {
        console.error('Create page error:', error);
        throw error;
      }
    };

    toast.promise(createPromise(), {
      loading: 'Đang tạo trang mới...',
      success: name => `Đã tạo: ${name}`,
      error: err => `Lỗi: ${err.message}`,
    });

    setOpen(false);
  };

  // ========== RENAME PAGE ==========
  const startEdit = page => {
    if (page.id === DEFAULT_TLDRAW_PAGE_ID) {
      toast.warning('Không thể đổi tên trang mặc định');
      return;
    }
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

    // Nếu không có thay đổi, hủy edit ngay
    if (!newTitle || newTitle === page.name) {
      cancelEdit();
      return;
    }

    const numericPageId = page.id.split(':')[1];

    if (!numericPageId || numericPageId === 'page') {
      toast.error('Không thể đổi tên trang mặc định');
      cancelEdit();
      return;
    }

    // Lưu tên cũ để revert nếu lỗi
    const oldName = page.name;

    // 1. CẬP NHẬT UI NGAY LẬP TỨC (Không chờ API)
    editor.updatePage({ id: page.id, name: newTitle });

    cancelEdit();

    const updatePromise = async () => {
      try {
        // Gọi API Background
        await updatePageTitle(numericPageId, newTitle);
        console.log('✅ API: Page renamed to:', newTitle);

        // Broadcast WebSocket
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          const payload = {
            type: 'update_page',
            page: {
              pageId: numericPageId,
              pageTitle: newTitle,
            },
          };
          websocket.send(JSON.stringify(payload));
        }
      } catch (error) {
        console.error(' Rename error:', error);
        // Revert lại tên cũ nếu API lỗi
        editor.updatePage({ id: page.id, name: oldName });
        throw error;
      }
    };

    // Vẫn hiện toast để báo trạng thái lưu
    toast.promise(updatePromise(), {
      loading: 'Đang lưu tên mới...',
      success: 'Đã lưu tên trang',
      error: 'Lỗi lưu tên trang (đã hoàn tác)',
    });
  };

  // ========== DELETE PAGE ==========
  const handleDelete = async page => {
    // ✅ Kiểm tra nếu chỉ còn 1 page thì không cho xóa
    if (pages.length <= 1) {
      toast.warning('Không thể xóa trang cuối cùng. Whiteboard phải có ít nhất 1 trang.');
      return;
    }

    const confirmed = await confirmWithToast({
      message: `Xóa trang "${page.name}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      // 1. Gọi API
      console.log('Deleting page with ID:', page.id);
      const numericId = page.id.replace('page:', '');
      const response = await deletePage(numericId);
      console.log('API: Page deleted:', response);
      // 2. Cập nhật local editor ngay lập tức
      editor.deletePage(page.id);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const isFakePage = pageId => pageId === DEFAULT_TLDRAW_PAGE_ID;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Page Menu Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-haspopup='menu'
        aria-expanded={open}
        title='Pages'
        style={{
          background: 'var(--tl-color-selected)',
          border: 'none',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, marginRight: 6 }}>
          {pages.find(p => p.id === currentPageId)?.name || 'Pages'}
        </span>
        <svg width='10' height='10' viewBox='0 0 24 24'>
          <path
            d='M6 9l6 6 6-6'
            stroke='currentColor'
            strokeWidth='3'
            fill='none'
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          ref={menuRef}
          role='menu'
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 8px)',
            minWidth: 260,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            padding: 8,
            zIndex: 99999,
            border: '1px solid #eee',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 8,
              paddingBottom: 8,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 11,
                color: '#888',
                letterSpacing: '0.5px',
              }}
            >
              PAGES ({pages.length})
            </span>
            <button
              onClick={handleCreatePage}
              title='Create New Page'
              style={{
                border: 'none',
                background: '#e6f7ff',
                color: '#0066ff',
                cursor: 'pointer',
                borderRadius: 4,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 'bold',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = 'scale(1.1)')
              }
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              +
            </button>
          </div>

          {/* Page List */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {pages.length === 0 && (
              <div
                style={{
                  padding: 8,
                  color: '#666',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                No pages
              </div>
            )}

            {pages.map(p => {
              const isActive = p.id === currentPageId;
              const isEditing = editingPageId === p.id;
              const isFake = isFakePage(p.id);

              return (
                <div
                  key={p.id}
                  role='menuitem'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: 6,
                    background: isActive ? '#f0f8ff' : 'transparent',
                    marginBottom: 2,
                    transition: '0.2s',
                    cursor: isEditing ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isEditing && !isActive) {
                      e.currentTarget.style.background = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isEditing && !isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Page Name / Edit Input */}
                  <div
                    style={{
                      flex: 1,
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isActive ? '#000' : '#444',
                      fontWeight: isActive ? '600' : '400',
                    }}
                    onClick={() => !isEditing && handleSwitchPage(p.id)}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(p)}
                        onKeyDown={e => {
                          e.stopPropagation();
                          if (e.key === 'Enter') saveEdit(p);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid #2b9eff',
                          fontSize: 13,
                        }}
                      />
                    ) : (
                      <>
                        {p.name || 'Untitled'}
                        {isFake && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              color: '#999',
                              fontStyle: 'italic',
                            }}
                          >
                            (mặc định)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && !isFake && (
                    <div style={{ display: 'flex', gap: 6, opacity: 0.7 }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          startEdit(p);
                        }}
                        title='Rename'
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: 4,
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(p);
                        }}
                        title='Delete'
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#ff4d4f',
                          fontSize: 14,
                          padding: 4,
                        }}
                      >
                        🗑️
                      </button>
                    </div>
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