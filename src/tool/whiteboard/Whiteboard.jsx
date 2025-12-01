import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import TildrawBoard from '../components/whiteboard/TldrawBoard';
import 'tldraw/tldraw.css';
import { getWhiteboardId } from '../../services/userService';
import useTeam from '../../context/useTeam';

export default function Whiteboard() {
  const drawerId = useSelector(state => state.user.userId);
  const drawerName = useSelector(state => state.user.fullName);
  const [whiteboardId, setWhiteBoardId] = useState(1);
  const { team } = useTeam();

  useState(() => {
    const fetchId = async () => {
      try {
        const response = await getWhiteboardId(team?.teamId);
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
    <div style={{touchAction: "none"}}>
      <TildrawBoard
        drawerId={drawerId}
        drawerName={drawerName}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}
