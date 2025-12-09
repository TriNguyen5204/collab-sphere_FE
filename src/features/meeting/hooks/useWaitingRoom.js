import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook to manage waiting room functionality for meeting access control
 * Handles guest approval/rejection flow via WebSocket
 * 
 * @param {Object} socket - Socket.io instance
 * @param {string} roomId - Current room ID
 * @param {boolean} isHost - Whether current user is the host
 * @param {Object} userInfo - Current user info { userId, name }
 */
export const useWaitingRoom = (socket, roomId, isHost, userInfo) => {
  // Guest states
  const [waitingStatus, setWaitingStatus] = useState('idle'); // 'idle' | 'waiting' | 'approved' | 'rejected'
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  
  // Host states
  const [waitingGuests, setWaitingGuests] = useState([]);
  
  // Request to join room (for non-team members)
  const requestToJoin = useCallback(() => {
    if (!socket || !roomId || !userInfo) return;
    
    console.log('📤 Requesting to join room:', roomId);
    setWaitingStatus('waiting');
    setIsInWaitingRoom(true);
    
    socket.emit('request-to-join', {
      roomId,
      guestId: userInfo.userId,
      guestName: userInfo.name,
      guestSocketId: socket.id,
    });
  }, [socket, roomId, userInfo]);

  // Cancel waiting request
  const cancelWaiting = useCallback(() => {
    if (!socket || !roomId) return;
    
    console.log('📤 Cancelling join request');
    socket.emit('cancel-join-request', {
      roomId,
      guestSocketId: socket.id,
    });
    
    setWaitingStatus('idle');
    setIsInWaitingRoom(false);
  }, [socket, roomId]);

  // Approve a guest (host only)
  const approveGuest = useCallback((guest) => {
    if (!socket || !isHost) return;
    
    console.log('✅ Approving guest:', guest.name);
    socket.emit('approve-guest', {
      roomId,
      guestSocketId: guest.socketId,
      guestId: guest.id,
      guestName: guest.name,
    });
    
    // Remove from waiting list
    setWaitingGuests(prev => prev.filter(g => g.socketId !== guest.socketId));
    toast.success(`${guest.name} has been admitted to the meeting`);
  }, [socket, roomId, isHost]);

  // Reject a guest (host only)
  const rejectGuest = useCallback((guest) => {
    if (!socket || !isHost) return;
    
    console.log('❌ Rejecting guest:', guest.name);
    socket.emit('reject-guest', {
      roomId,
      guestSocketId: guest.socketId,
      guestId: guest.id,
    });
    
    // Remove from waiting list
    setWaitingGuests(prev => prev.filter(g => g.socketId !== guest.socketId));
    toast.info(`${guest.name}'s request has been declined`);
  }, [socket, roomId, isHost]);

  // Approve all waiting guests
  const approveAllGuests = useCallback(() => {
    if (!socket || !isHost || waitingGuests.length === 0) return;
    
    console.log('✅ Approving all guests');
    waitingGuests.forEach(guest => {
      socket.emit('approve-guest', {
        roomId,
        guestSocketId: guest.socketId,
        guestId: guest.id,
        guestName: guest.name,
      });
    });
    
    toast.success(`Admitted ${waitingGuests.length} participant(s) to the meeting`);
    setWaitingGuests([]);
  }, [socket, roomId, isHost, waitingGuests]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Host receives join request
    const handleJoinRequest = (data) => {
      // Only host should handle join requests
      if (!isHost) {
        console.log('📥 Ignoring join request - not the host');
        return;
      }
      
      console.log('📥 [Host] Received join request:', data);
      
      const newGuest = {
        id: data.guestId,
        name: data.guestName,
        socketId: data.guestSocketId,
        requestedAt: new Date(),
      };
      
      setWaitingGuests(prev => {
        // Avoid duplicates - check by both socketId and guestId
        if (prev.some(g => g.socketId === data.guestSocketId || g.id === data.guestId)) {
          console.log('📥 [Host] Duplicate request, ignoring');
          return prev;
        }
        
        // Show toast notification to host (only when adding new guest)
        toast.info(`${data.guestName} wants to join the meeting`, {
          duration: 10000,
          id: `join-request-${data.guestSocketId}`, // Unique ID to prevent duplicate toasts
        });
        
        return [...prev, newGuest];
      });
    };

    // Guest receives approval
    const handleApproved = (data) => {
      console.log('📥 [Guest] Join request approved:', data);
      setWaitingStatus('approved');
      setIsInWaitingRoom(false);
      toast.success('You have been admitted to the meeting!');
    };

    // Guest receives rejection
    const handleRejected = (data) => {
      console.log('📥 [Guest] Join request rejected:', data);
      setWaitingStatus('rejected');
    };

    // Guest cancelled their request (for host to update list)
    const handleRequestCancelled = (data) => {
      console.log('📥 [Host] Join request cancelled:', data);
      setWaitingGuests(prev => prev.filter(g => g.socketId !== data.guestSocketId));
    };

    // Guest disconnected while waiting
    const handleGuestDisconnected = (data) => {
      console.log('📥 [Host] Waiting guest disconnected:', data);
      setWaitingGuests(prev => prev.filter(g => g.socketId !== data.guestSocketId));
    };

    socket.on('join-request', handleJoinRequest);
    socket.on('join-approved', handleApproved);
    socket.on('join-rejected', handleRejected);
    socket.on('request-cancelled', handleRequestCancelled);
    socket.on('waiting-guest-disconnected', handleGuestDisconnected);

    return () => {
      socket.off('join-request', handleJoinRequest);
      socket.off('join-approved', handleApproved);
      socket.off('join-rejected', handleRejected);
      socket.off('request-cancelled', handleRequestCancelled);
      socket.off('waiting-guest-disconnected', handleGuestDisconnected);
    };
  }, [socket, isHost]); // Add isHost to dependencies

  return {
    // Guest states & actions
    waitingStatus,
    isInWaitingRoom,
    requestToJoin,
    cancelWaiting,
    
    // Host states & actions
    waitingGuests,
    approveGuest,
    rejectGuest,
    approveAllGuests,
  };
};

export default useWaitingRoom;
