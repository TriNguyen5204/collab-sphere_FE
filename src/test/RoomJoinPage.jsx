import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinPage() {
  const [myName, setMyName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [myRoomId, setMyRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);
    navigate(`/room/${newRoomId}`, { state: { myName } });
  };

  const joinRoom = () => {
    if (groupId && myName) {
      navigate(`/room/${groupId}`, { state: { myName } });
    } else {
      alert('Please enter your name and room ID');
    }
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center mb-6 text-gray-800'>Fake Zoom</h1>
        <div className='flex flex-col gap-4'>
          <input
            type='text'
            placeholder='Enter your name'
            value={myName}
            onChange={e => setMyName(e.target.value)}
            className='px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          {myRoomId ? (
            <div className='text-center'>
              <p className='mb-2 text-gray-600'>Your Room ID: {myRoomId}</p>
              <button
                onClick={() => copyToClipboard(myRoomId)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold'
              >
                Copy Room ID
              </button>
            </div>
          ) : (
            <button
              onClick={createRoom}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold'
            >
              Create New Room
            </button>
          )}
          <input
            type='text'
            placeholder='Enter Room ID'
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            className='px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={joinRoom}
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold'
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;