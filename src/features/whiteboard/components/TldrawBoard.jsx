import { useState, useEffect, useRef, useCallback } from 'react';
import { Tldraw, Editor } from 'tldraw';
import { useWhiteboardSync } from '../hooks/useWhiteboardSync';
import CustomPageMenu from './CustomPageMenu';
import {
  getPagesByWhiteboardId,
  getShapesByPageId,
  parseShapeJson,
} from '../services/whiteboardService';
import 'tldraw/tldraw.css';

export default function TldrawBoard({ drawerId, drawerName, whiteboardId }) {
  const [editor, setEditor] = useState(null);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const hasInitialized = useRef(false);
  const containerRef = useRef(null);

  // 🚀 OPTIMIZATION: Cache shapes per page
  const shapesCache = useRef(new Map());
  const loadingPages = useRef(new Set());

  const tildrawKey = import.meta.env.VITE_TILDRAW_LICENSE_KEY;
  const defaultTldrawPageId = 'page:page';

  // 🔧 FIX: Setup non-passive event listeners BEFORE React attaches them
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Store original addEventListener
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    // Override addEventListener for this container
    const addNonPassiveListener = (type, listener, options) => {
      let modifiedOptions = options;

      // Force non-passive for touch and wheel events
      if (
        type === 'touchstart' ||
        type === 'touchmove' ||
        type === 'touchend' ||
        type === 'wheel'
      ) {
        if (typeof options === 'object') {
          modifiedOptions = { ...options, passive: false };
        } else if (typeof options === 'boolean') {
          modifiedOptions = { capture: options, passive: false };
        } else {
          modifiedOptions = { passive: false };
        }
      }

      return originalAddEventListener.call(
        this,
        type,
        listener,
        modifiedOptions
      );
    };

    // Temporarily override
    EventTarget.prototype.addEventListener = addNonPassiveListener;

    // Add our own handlers with {passive: false}
    const preventDefaultHandler = e => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', preventDefaultHandler, {
      passive: false,
      capture: true,
    });
    container.addEventListener('touchmove', preventDefaultHandler, {
      passive: false,
      capture: true,
    });
    container.addEventListener('touchend', preventDefaultHandler, {
      passive: false,
      capture: true,
    });

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', preventDefaultHandler, {
        capture: true,
      });
      container.removeEventListener('touchmove', preventDefaultHandler, {
        capture: true,
      });
      container.removeEventListener('touchend', preventDefaultHandler, {
        capture: true,
      });

      // Restore original
      EventTarget.prototype.addEventListener = originalAddEventListener;
    };
  }, []);

  // Initialize WebSocket and get reference
  const ws = useWhiteboardSync(
    whiteboardId,
    currentPageId?.split(':')[1],
    drawerId,
    drawerName,
    editor
  );

  useEffect(() => {
    setWebsocket(ws);
  }, [ws]);

  // 🚀 OPTIMIZATION: Memoized shape loader with caching
  const loadShapesForPage = useCallback(
    async pageId => {
      if (!editor || !pageId) return;

      const numericId = pageId.split(':')[1];

      // Check if already loading
      if (loadingPages.current.has(numericId)) {
        console.log(`⏳ Already loading page ${pageId}, skipping...`);
        return;
      }

      // Check cache first
      if (shapesCache.current.has(numericId)) {
        console.log(`💾 Using cached shapes for page: ${pageId}`);
        const cachedShapes = shapesCache.current.get(numericId);

        // Clear current shapes
        const oldShapeIds = Array.from(editor.store.allRecords())
          .filter(r => r.typeName === 'shape' && r.parentId === pageId)
          .map(r => r.id);
        if (oldShapeIds.length) {
          editor.store.remove(oldShapeIds);
        }

        // Put cached shapes (if any)
        if (cachedShapes.length) {
          editor.store.put(cachedShapes);
        }
        return;
      }

      // Load from API
      loadingPages.current.add(numericId);
      console.log(`📄 Loading shapes from API for page: ${pageId}`);

      try {
        if (!numericId) throw new Error('Invalid page ID format');

        const shapesFromApi = await getShapesByPageId(numericId);
        console.log(
          `📦 Received ${shapesFromApi.shapes?.length || 0} shapes from API`
        );

        const formattedShapes = shapesFromApi.shapes.map(s =>
          parseShapeJson(s)
        );

        // Cache the shapes
        shapesCache.current.set(numericId, formattedShapes);

        // Clear old shapes for this page only
        const oldShapeIds = Array.from(editor.store.allRecords())
          .filter(r => r.typeName === 'shape' && r.parentId === pageId)
          .map(r => r.id);
        if (oldShapeIds.length) {
          editor.store.remove(oldShapeIds);
        }

        // Put new shapes
        if (formattedShapes.length) {
          editor.store.put(formattedShapes);
          console.log(
            `✅ Loaded ${formattedShapes.length} shapes for ${pageId}`
          );
        } else {
          console.log(`ℹ️ No shapes found for ${pageId}`);
        }
      } catch (e) {
        console.error('💥 load shapes error:', e);
      } finally {
        loadingPages.current.delete(numericId);
      }
    },
    [editor]
  );

  // 🚀 OPTIMIZATION: Update cache when user makes changes
  useEffect(() => {
    if (!editor || !currentPageId) return;

    const unsub = editor.store.listen(
      entry => {
        if (entry.source !== 'user') return;

        // Update cache whenever user makes changes
        const numericId = currentPageId.split(':')[1];
        if (!numericId) return;

        // Get all shapes for current page
        const allShapes = Array.from(editor.store.allRecords()).filter(
          r => r.typeName === 'shape' && r.parentId === currentPageId
        );

        // Update cache
        shapesCache.current.set(numericId, allShapes);
      },
      { source: 'user' }
    );

    return () => unsub();
  }, [editor, currentPageId]);

  // ========== INITIAL PAGE LOAD (ONCE) ==========
  useEffect(() => {
    if (!editor || hasInitialized.current) return;

    const initializePages = async () => {
      try {
        if (whiteboardId != null) {
          console.log('📋 Fetching pages for whiteboard:', whiteboardId);

          const responseData = await getPagesByWhiteboardId(whiteboardId);
          console.log('📦 Full API Response:', responseData);

          const pages = responseData.pages || [];
          console.log(`✅ Pages loaded from DB: ${pages.length} pages`);

          if (!pages.length) {
            console.warn('⚠️ No pages found, using default.');
            hasInitialized.current = true;
            setCurrentPageId(editor.getCurrentPageId());
            return;
          }

          const pageRecords = pages.map(p => ({
            id: `page:${p.pageId}`,
            typeName: 'page',
            name: p.pageTitle,
            index: `a${p.pageId}`,
            meta: {},
          }));
          editor.store.put(pageRecords);

          // Remove default Tldraw page
          if (editor.store.has(defaultTldrawPageId)) {
            const fakeShapes = Array.from(editor.store.allRecords())
              .filter(
                r =>
                  r.typeName === 'shape' && r.parentId === defaultTldrawPageId
              )
              .map(r => r.id);
            if (fakeShapes.length) editor.store.remove(fakeShapes);
            editor.store.remove([defaultTldrawPageId]);
            console.log('🗑️ Removed default Tldraw page');
          }

          const firstPageId = pageRecords[0].id;

          // Set current page FIRST
          editor.setCurrentPage(firstPageId);
          setCurrentPageId(firstPageId);

          // Load shapes for first page
          await loadShapesForPage(firstPageId);

          hasInitialized.current = true;
          console.log('✅ Initialization complete');
        }
      } catch (e) {
        console.error('💥 init pages error:', e);
        console.error('💥 Error message:', e.message);
        console.warn('⚠️ Falling back to default page due to error');
        hasInitialized.current = true;
        setCurrentPageId(editor.getCurrentPageId());
      }
    };

    initializePages();
  }, [editor, whiteboardId, loadShapesForPage]);

  // ========== 🚀 OPTIMIZED PAGE SWITCH LISTENER ==========
  useEffect(() => {
    if (!editor) return;

    const unsub = editor.store.listen(
      async entry => {
        if (entry.source !== 'user' || !entry.changes?.updated) return;

        const changed = Object.values(entry.changes.updated).some(
          ([from, to]) =>
            to.typeName === 'instance' &&
            from.currentPageId !== to.currentPageId
        );
        if (!changed) return;

        const newPageId = editor.getCurrentPageId();
        if (!newPageId || newPageId === currentPageId) return;

        console.log('🔄 User switched to page:', newPageId);
        setCurrentPageId(newPageId);

        // Load shapes (will use cache if available)
        await loadShapesForPage(newPageId);
      },
      { source: 'user' }
    );

    return () => unsub();
  }, [editor, currentPageId, loadShapesForPage]);

  return (
    <div
      ref={containerRef}
      className='tldraw-whiteboard-container'
      style={{
        position: 'fixed',
        inset: 0,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        overscrollBehavior: 'none',
        overflow: 'hidden',
      }}
    >
      <Tldraw
        onMount={e => {
          setEditor(e);
          console.log('✅ tldraw ready');
        }}
        licenseKey={tildrawKey}
        components={{
          PageMenu: props => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                zIndex: 999999,
                pointerEvents: 'all',
              }}
            >
              <CustomPageMenu
                {...props}
                whiteboardId={whiteboardId}
                websocket={websocket}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
