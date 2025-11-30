import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import TildrawBoard from '../components/whiteboard/TldrawBoard';
import 'tldraw/tldraw.css';
import { getWhiteboardId } from '../../services/userService';
import { useProjectContext } from '../../hooks/useProjectContext';

export default function Whiteboard() {
  const drawerId = useSelector(state => state.user.userId);
  const drawerName = useSelector(state => state.user.fullName);
  const [whiteboardId, setWhiteBoardId] = useState(1);
  const { projectContext } = useProjectContext();

  const teamId = useMemo(() => {
    return projectContext?.teamId || '';
  }, [projectContext]);
  useState(() => {
    const fetchId = async () => {
      try {
        const response = await getWhiteboardId(teamId);
        setWhiteBoardId(response.whiteboardId);
      } catch (error) {
        console.log('Error fetching ID', error);
      }
    };
    if (teamId) {
    fetchId();
  }
  }, [teamId]);
  return (
    <div style={{touchAction: "none"}}>
      <TildrawBoard
        drawerId={drawerId}
        drawerName={drawerName}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}
