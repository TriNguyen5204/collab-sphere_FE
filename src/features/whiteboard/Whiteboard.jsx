import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TildrawBoard from './components/TldrawBoard';
import 'tldraw/tldraw.css';
import { getWhiteboardId } from '../../services/userService';
import useTeam from '../../context/useTeam';

export default function Whiteboard() {
  const drawerId = useSelector(state => state.user.userId);
  const drawerName = useSelector(state => state.user.fullName);
  const [whiteboardId, setWhiteBoardId] = useState(null);
  const { team } = useTeam();

  useEffect(() => {
    const fetchId = async () => {
      try {
        const response = await getWhiteboardId(team?.teamId);
        console.log('Fetched whiteboard ID:', response);
        setWhiteBoardId(response.whiteboardId);
      } catch (error) {
        console.log('Error fetching ID', error);
      }
    };
    if (team?.teamId) {
      fetchId();
    }
  }, [team?.teamId]);
  return (
    <div
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <TildrawBoard
        drawerId={drawerId}
        drawerName={drawerName}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}
