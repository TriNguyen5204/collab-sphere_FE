// CustomPageMenu.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useEditor } from "tldraw";

/**
 * Custom Page Menu - replicates DefaultPageMenu behaviour:
 * - Shows pages
 * - Click to switch
 * - Inline rename (PUT to /api/whiteboards/pages/{pageId} with { title })
 * - + New Page (POST to /api/whiteboards/{whiteboardId}/pages with { pageTitle })
 *
 * Props:
 * - whiteboardId (number|string) -- passed by TldrawBoard when injecting component
 *
 * Note: This component manipulates the tldraw store (editor.store) for immediate local update,
 * and calls your backend. The backend will broadcast "new_page" / "update_page" via websockets
 * to other clients. The useWhiteboardSync hook already in your project will apply those remote changes.
 */
export default function CustomPageMenu({ whiteboardId, onClose, isOpen: externalIsOpen }) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  // editing state
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  // local snapshot of pages (kept in sync with editor.store)
  const pages = useMemo(() => {
    if (!editor) return [];
    return Array.from(editor.store.allRecords())
      .filter((r) => r.typeName === "page")
      .sort((a, b) => {
        // pages have index like "a{pageId}" in your code - fallback to name
        if (a.index && b.index) return String(a.index).localeCompare(String(b.index));
        return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      });
  }, [editor, /* editor.store changes cause rerenders because we will force update via store listener below */]);

  // keep component open state in sync if Tldraw controls it
  useEffect(() => {
    if (typeof externalIsOpen === "boolean") setOpen(externalIsOpen);
  }, [externalIsOpen]);

  // Listen to store updates so the component re-renders when pages change
  useEffect(() => {
    if (!editor) return;
    const unsub = editor.store.listen(() => {
      // small no-op update: toggle a state to force rerender is not needed because pages uses editor.store directly
      // But React won't rerun useMemo unless some dependency changes. We'll force React to update by calling setOpen((v)=>v)
      setOpen((v) => v);
    });
    return () => unsub();
  }, [editor]);

  if (!editor) return null;

  const currentPageId = editor.getCurrentPageId();

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((v) => !v);
    if (onClose && open) onClose();
  };

  const handleSwitchPage = async (tldrawPageId) => {
    if (!editor || !tldrawPageId) return;
    editor.setCurrentPage(tldrawPageId);
    setOpen(false);
  };

  const startEdit = (page) => {
    setEditingPageId(page.id);
    setEditingValue(page.name ?? "");
    // focus will be handled by the input's autoFocus prop
  };

  const cancelEdit = () => {
    setEditingPageId(null);
    setEditingValue("");
  };

  const saveEdit = async (page) => {
    if (!page) return;
    const newTitle = (editingValue ?? "").trim();
    if (!newTitle || newTitle === page.name) {
      cancelEdit();
      return;
    }

    // Optimistically update local tldraw page record
    const updatedRecord = {
      ...page,
      name: newTitle,
    };
    try {
      editor.store.put([updatedRecord]);
      // call backend PUT: /api/whiteboards/pages/{pageId} body { title }
      const numericPageId = page.id.split(":")[1];
      await fetch(`http://localhost:5103/api/whiteboards/pages/${numericPageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      // backend will broadcast update_page; other clients will be updated via websocket
    } catch (err) {
      console.error("Rename page failed:", err);
      // Optionally revert: load page from editor.store.get(page.id) or reload from server
    } finally {
      cancelEdit();
    }
  };

  const handleDelete = async (page) => {
  if (!page) return;

  // Safety: don't allow deleting last page
  const pageList = Array.from(editor.store.allRecords()).filter(r => r.typeName === 'page');
  if (pageList.length <= 1) {
    alert('Cannot delete the last remaining page.');
    return;
  }

  const confirmDelete = window.confirm(`Delete page "${page.name ?? 'Untitled'}"? This action cannot be undone.`);
  if (!confirmDelete) return;

  const numericPageId = page.id.split(":")[1];
  try {
    // Call backend DELETE
    const res = await fetch(`http://localhost:5103/api/whiteboards/pages/${numericPageId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Delete failed', res.status, txt);
      alert('Failed to delete page.');
      return;
    }

    // Immediately remove locally and switch to another page
    // Remove page from store
    editor.store.remove([page.id]);

    // Find another page to switch to (pick the first remaining)
    const remaining = Array.from(editor.store.allRecords()).filter(r => r.typeName === 'page');
    if (remaining.length) {
      const nextPageId = remaining[0].id;
      editor.setCurrentPage(nextPageId);
    } else {
      // safety: create a new default page record if none left (shouldn't happen if API prevented last deletion)
      const fallback = {
        id: `page:page`, typeName: 'page', name: 'New Page', index: 'a0', meta: {}
      };
      editor.store.put([fallback]);
      editor.setCurrentPage(fallback.id);
    }

    // The server already broadcasts delete_page to others.
    // For the deleter, we've already removed and switched.
  } catch (err) {
    console.error('Delete error', err);
    alert('Error deleting page');
  }
};

  const handleCreatePage = async () => {
    const defaultTitle = "New Page";
    const title = window.prompt("Enter new page name:", defaultTitle) ?? defaultTitle;
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      // Call backend: POST /api/whiteboards/{whiteboardId}/pages { pageTitle }
      const res = await fetch(`http://localhost:5103/api/whiteboards/${whiteboardId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageTitle: trimmed }),
      });
      if (!res.ok) {
        console.error("Failed to create page", res.status);
        return;
      }
      const newPage = await res.json();
      // Add to local store and switch to it immediately
      const newRecord = {
        id: `page:${newPage.pageId}`,
        typeName: "page",
        name: newPage.pageTitle,
        index: `a${newPage.pageId}`,
        meta: {},
      };
      editor.store.put([newRecord]);
      editor.setCurrentPage(newRecord.id);
      setOpen(false);
      // Other clients will receive the 'new_page' broadcast from server
    } catch (err) {
      console.error("Create page error:", err);
    }
  };

  // Render UI that visually matches the default: small dropdown, list items, rename pencil, plus button.
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {/* Toggle button (mimic default small button) */}
      <button
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Pages"
        style={{
          background: "var(--tl-color-selected)",
          border: "none",
          padding: 6,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {/* simple icon + label */}
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
          <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13 }}>Pages</span>
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginLeft: 6 }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 8px)",
            minWidth: 220,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 8,
            zIndex: 9999,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "4px 6px" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Các trang</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleCreatePage}
                title="Create page"
                style={{
                  border: "none",
                  background: "var(--tl-color-selected)",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            {pages.length === 0 && (
              <div style={{ padding: 8, color: "#666", fontSize: 13 }}>No pages</div>
            )}

            {pages.map((p) => {
              const isActive = p.id === currentPageId;
              const isEditing = editingPageId === p.id;
              return (
                <div
                  key={p.id}
                  role="menuitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 6,
                    background: isActive ? "rgba(0, 120, 210, 0.08)" : "transparent",
                    cursor: "pointer",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{ flex: 1 }}
                    onClick={() => handleSwitchPage(p.id)}
                    title={p.name}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(p);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        onBlur={() => saveEdit(p)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          fontSize: 13,
                          borderRadius: 4,
                          border: "1px solid #ddd",
                        }}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 13, color: isActive ? "#0b66ff" : "#222" }}>
                          {p.name ?? "Untitled"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rename button */}
                  {!isEditing && (
                    <>
                    <button
                      onClick={() => startEdit(p)}
                      title="Rename"
                      style={{
                        border: "none",
                        background: "var(--tl-color-selected)",
                        cursor: "pointer",
                        padding: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(p)}
                      title="Delete"
                      style={{
                        border: "none",
                        background: "#eb3434",
                        cursor: "pointer",
                        padding: 6,
                      }}
                    >
                    {/* simple trash icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path d="M3 6h18M8 6v13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{
                      "color":" #f4f3f3"
                      }}/>
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
