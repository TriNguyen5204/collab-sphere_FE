import { useState, useEffect, useRef } from 'react';
import { Tldraw, Editor } from 'tldraw';
import { useWhiteboardSync } from '../../hooks/whiteboard/useWhiteboardSync';
import CustomPageMenu from '../whiteboard/CustomPageMenu';
import {
  getPagesByWhiteboardId,
  getShapesByPageId,
  parseShapeJson,
} from '../../../services/whiteboardService';
import 'tldraw/tldraw.css';

export default function TldrawBoard({ drawerId, drawerName, whiteboardId }) {
  const [editor, setEditor] = useState(null);
  const [currentPageId, setCurrentPageId] = useState(null); // "page:1", "page:2", ...
  const hasInitialized = useRef(false);
  const isLoadingPage = useRef(false);
  const [websocket, setWebsocket] = useState(null);

  const defaultTldrawPageId = 'page:page';

  // LƯU WebSocket instance từ useWhiteboardSync
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
  useEffect(() => {
    if (!editor || hasInitialized.current) return;

    const initializePages = async () => {
      try {
        console.log('🔍 Fetching pages for whiteboard:', whiteboardId);

        const responseData = await getPagesByWhiteboardId(whiteboardId);
        console.log('📦 Full API Response:', responseData);

        const pages = responseData.pages || [];
        console.log('✅ Pages loaded from DB:', pages);

        if (!pages.length) {
          console.warn('⚠️ No pages found, using default.');
          hasInitialized.current = true;
          // setCurrentPageId(editor.getCurrentPageId());
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

        if (editor.store.has(defaultTldrawPageId)) {
          const fakeShapes = Array.from(editor.store.allRecords())
            .filter(
              r => r.typeName === 'shape' && r.parentId === defaultTldrawPageId
            )
            .map(r => r.id);
          if (fakeShapes.length) editor.store.remove(fakeShapes);
          editor.store.remove([defaultTldrawPageId]);
          console.log("🗑️ Removed default Tldraw page: 'page:page'");
        }

        const firstPageId = pageRecords[0].id;

        editor.setCurrentPage(firstPageId);
        setCurrentPageId(firstPageId);
        await loadShapesForPage(firstPageId);

        hasInitialized.current = true;
      } catch (e) {
        console.error('💥 init pages error:', e);
        console.error('💥 Error message:', e.message);

        // Fallback: use default page if API fails
        console.warn('⚠️ Falling back to default page due to error');
        hasInitialized.current = true;
        setCurrentPageId(editor.getCurrentPageId());
      }
    };

    initializePages();
  }, [editor, whiteboardId]);

  const loadShapesForPage = async pageId => {
    if (!editor || isLoadingPage.current || !pageId) return;
    isLoadingPage.current = true;
    console.log(`🔄 Loading shapes for page: ${pageId}`);

    try {
      const numericId = pageId.split(':')[1];
      if (!numericId) throw new Error('Invalid page ID format');

      // Use service instead of direct fetch
      const shapesFromApi = await getShapesByPageId(numericId);
      console.log('📦 Shapes API Response:', shapesFromApi);

      const oldShapeIds = Array.from(editor.store.allRecords())
        .filter(r => r.typeName === 'shape')
        .map(r => r.id);
      if (oldShapeIds.length) editor.store.remove(oldShapeIds);

      // Use helper function to parse shapes
      const formattedShapes = shapesFromApi.shapes.map(s => parseShapeJson(s));

      if (formattedShapes.length) {
        editor.store.put(formattedShapes);
        console.log(`✅ Loaded ${formattedShapes.length} shapes for ${pageId}`);
      } else {
        console.log(`ℹ️ No shapes found for ${pageId}`);
      }
    } catch (e) {
      console.error('💥 load shapes error:', e);
    } finally {
      isLoadingPage.current = false;
    }
  };

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

        const newId = editor.getCurrentPageId();
        if (!newId || newId === currentPageId) return;

        console.log('🔄 User switched to page:', newId);
        setCurrentPageId(newId);
        await loadShapesForPage(newId);
      },
      { source: 'user' }
    );

    return () => unsub();
  }, [editor, currentPageId]);

  return (
    <div style={{ position: 'fixed', inset: 0, touchAction: 'none' }}>
      <Tldraw
        onMount={e => {
          setEditor(e);
          console.log('✅ tldraw ready');
        }}
        licenseKey={import.meta.env.VITE_TILDRAW_LICENSE_KEY}
        components={{
          // Replace the PageMenu completely with our custom menu
          PageMenu: props => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                zIndex: 999999,
                pointerEvents: 'all',
              }}
            >
              {/* CustomPageMenu expects whiteboardId prop */}
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
