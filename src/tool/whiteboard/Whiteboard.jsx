import React from 'react';
import { useSelector } from 'react-redux';
import TildrawBoard from '../components/whiteboard/TldrawBoard';
import 'tldraw/tldraw.css'

export default function Whiteboard() {
  const drawerId = useSelector(state => state.user.userId);
  const drawerName = useSelector(state => state.user.userName);
  const whiteboardId = 1;
  return (
    <div>
      <TildrawBoard
        drawerId={drawerId}
        drawerName={drawerName}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}
