import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TildrawBoard from './components/TldrawBoard';
import 'tldraw/tldraw.css';
import { getWhiteboardId } from './services/whiteboardService';
import useTeam from '../../context/useTeam';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';

export default function Whiteboard() {
  const drawerId = useSelector(state => state.user.userId);
  const drawerName = useSelector(state => state.user.fullName);
  const [whiteboardId, setWhiteBoardId] = useState(null);
  const { team } = useTeam();
  const navigate = useNavigate();

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
        position: 'absolute',
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          bottom: 20, // Cách đáy 20px
          right: 20, // Cách trái 20px
          zIndex: 999999, // Luôn nằm trên cùng
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px 16px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#333',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <ChevronLeftIcon/> <span>Back</span>
      </button>
      <TildrawBoard
        drawerId={drawerId}
        drawerName={drawerName}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}
