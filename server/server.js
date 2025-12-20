import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Store waiting participants per room
const waitingRooms = new Map(); // roomName -> Set of { participantId, participantName, timestamp }

// Store room hosts
const roomHosts = new Map(); // roomName -> hostIdentity

// Store host presence tracking
const hostPresence = new Map(); // roomName -> { lastHeartbeat: timestamp, gracePeriodTimeout: timeoutId, isEnded: boolean }

// Grace period in milliseconds (15 seconds to allow for refresh/reconnection)
const HOST_GRACE_PERIOD = 15000;
// Heartbeat interval expected from host (5 seconds)
const HEARTBEAT_INTERVAL = 5000;
// If no heartbeat for 2 intervals, start grace period
const HEARTBEAT_TIMEOUT = HEARTBEAT_INTERVAL * 2;

const createToken = async (roomName, participantName, isHost = false, canPublish = true) => {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: '10m',
    metadata: JSON.stringify({ isHost, canPublish }),
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish, canSubscribe: true });

  return await at.toJwt();
};

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('LiveKit Token Server is running');
});

// Token endpoint with host/guest logic
app.get('/api/meeting/token', async (req, res) => {
  const { roomName, participantName, isTeamMember, isLecturer } = req.query;

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'Missing roomName or participantName' });
  }

  try {
    const isTeam = isTeamMember === 'true';
    const isLecturerFlag = isLecturer === 'true';
    
    // Determine host status
    let isHost = false;
    
    // Lecturer is always considered host
    if (isLecturerFlag) {
      roomHosts.set(roomName, participantName);
      isHost = true;
    } else if (!roomHosts.has(roomName)) {
      // First person to join becomes host (if no lecturer yet)
      roomHosts.set(roomName, participantName);
      isHost = true;
    } else if (roomHosts.get(roomName) === participantName) {
      isHost = true;
    }

    // Team members join directly, non-team members need waiting room
    if (isTeam || isHost) {
      const token = await createToken(roomName, participantName, isHost, true);
      res.json({ token, isHost, needsApproval: false });
    } else {
      // Non-team member needs to wait for approval
      res.json({ token: null, isHost: false, needsApproval: true, participantName });
    }
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Request to join waiting room
app.post('/api/meeting/waiting-room/join', (req, res) => {
  const { roomName, participantId, participantName } = req.body;

  if (!roomName || !participantId || !participantName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!waitingRooms.has(roomName)) {
    waitingRooms.set(roomName, new Map());
  }

  const waitingRoom = waitingRooms.get(roomName);
  waitingRoom.set(participantId, {
    participantId,
    participantName,
    timestamp: Date.now(),
  });

  res.json({ success: true, message: 'Added to waiting room' });
});

// Get waiting room participants (for host)
app.get('/api/meeting/waiting-room/:roomName', (req, res) => {
  const { roomName } = req.params;
  
  const waitingRoom = waitingRooms.get(roomName);
  if (!waitingRoom) {
    return res.json({ participants: [] });
  }

  const participants = Array.from(waitingRoom.values()).sort((a, b) => a.timestamp - b.timestamp);
  res.json({ participants });
});

// Approve participant
app.post('/api/meeting/waiting-room/approve', async (req, res) => {
  const { roomName, participantId, participantName } = req.body;

  if (!roomName || !participantId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Remove from waiting room
    const waitingRoom = waitingRooms.get(roomName);
    if (waitingRoom) {
      waitingRoom.delete(participantId);
    }

    // Generate token for approved participant
    const token = await createToken(roomName, participantName, false, true);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Error approving participant:', error);
    res.status(500).json({ error: 'Failed to approve participant' });
  }
});

// Reject participant
app.post('/api/meeting/waiting-room/reject', (req, res) => {
  const { roomName, participantId } = req.body;

  if (!roomName || !participantId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const waitingRoom = waitingRooms.get(roomName);
  if (waitingRoom) {
    waitingRoom.delete(participantId);
  }

  res.json({ success: true, message: 'Participant rejected' });
});

// Approve all waiting participants
app.post('/api/meeting/waiting-room/approve-all', async (req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400).json({ error: 'Missing roomName' });
  }

  try {
    const waitingRoom = waitingRooms.get(roomName);
    if (!waitingRoom || waitingRoom.size === 0) {
      return res.json({ success: true, approved: [] });
    }

    const approved = [];
    for (const [participantId, participant] of waitingRoom.entries()) {
      const token = await createToken(roomName, participant.participantName, false, true);
      approved.push({ participantId, participantName: participant.participantName, token });
    }

    // Clear waiting room
    waitingRoom.clear();

    res.json({ success: true, approved });
  } catch (error) {
    console.error('Error approving all participants:', error);
    res.status(500).json({ error: 'Failed to approve participants' });
  }
});

// Leave waiting room
app.post('/api/meeting/waiting-room/leave', (req, res) => {
  const { roomName, participantId } = req.body;

  if (!roomName || !participantId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const waitingRoom = waitingRooms.get(roomName);
  if (waitingRoom) {
    waitingRoom.delete(participantId);
  }

  res.json({ success: true });
});

// Host heartbeat - called periodically by host to indicate they're still connected
app.post('/api/meeting/host/heartbeat', (req, res) => {
  const { roomName, hostIdentity } = req.body;

  if (!roomName || !hostIdentity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify this is actually the host
  const currentHost = roomHosts.get(roomName);
  if (currentHost !== hostIdentity) {
    return res.status(403).json({ error: 'Not the host of this room' });
  }

  let presence = hostPresence.get(roomName);
  
  // If meeting was ended, don't accept heartbeats
  if (presence && presence.isEnded) {
    return res.status(410).json({ error: 'Meeting has ended', meetingEnded: true });
  }

  // Clear any existing grace period timeout (host reconnected in time)
  if (presence && presence.gracePeriodTimeout) {
    clearTimeout(presence.gracePeriodTimeout);
    console.log(`[Host Heartbeat] Host reconnected to room ${roomName}, grace period cancelled`);
  }

  // Update last heartbeat timestamp
  hostPresence.set(roomName, {
    lastHeartbeat: Date.now(),
    gracePeriodTimeout: null,
    isEnded: false,
    hostIdentity
  });

  res.json({ success: true, message: 'Heartbeat received' });
});

// Host intentionally ends the meeting
app.post('/api/meeting/host/end-meeting', (req, res) => {
  const { roomName, hostIdentity } = req.body;

  if (!roomName || !hostIdentity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify this is actually the host
  const currentHost = roomHosts.get(roomName);
  if (currentHost !== hostIdentity) {
    return res.status(403).json({ error: 'Not the host of this room' });
  }

  // Clear any grace period timeout
  const presence = hostPresence.get(roomName);
  if (presence && presence.gracePeriodTimeout) {
    clearTimeout(presence.gracePeriodTimeout);
  }

  // Mark meeting as ended
  hostPresence.set(roomName, {
    lastHeartbeat: Date.now(),
    gracePeriodTimeout: null,
    isEnded: true,
    hostIdentity,
    endReason: 'host_ended'
  });

  console.log(`[Meeting Ended] Host intentionally ended meeting in room ${roomName}`);

  res.json({ success: true, message: 'Meeting ended' });
});

// Host disconnected (called when host leaves without intentionally ending)
app.post('/api/meeting/host/disconnect', (req, res) => {
  const { roomName, hostIdentity } = req.body;

  if (!roomName || !hostIdentity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify this is actually the host
  const currentHost = roomHosts.get(roomName);
  if (currentHost !== hostIdentity) {
    return res.status(403).json({ error: 'Not the host of this room' });
  }

  let presence = hostPresence.get(roomName);
  
  // If already ended, do nothing
  if (presence && presence.isEnded) {
    return res.json({ success: true, message: 'Meeting already ended' });
  }

  // Clear existing timeout if any
  if (presence && presence.gracePeriodTimeout) {
    clearTimeout(presence.gracePeriodTimeout);
  }

  console.log(`[Host Disconnect] Host disconnected from room ${roomName}, starting ${HOST_GRACE_PERIOD/1000}s grace period`);

  // Start grace period timeout
  const gracePeriodTimeout = setTimeout(() => {
    const currentPresence = hostPresence.get(roomName);
    // Check if host reconnected during grace period
    if (currentPresence && !currentPresence.isEnded && Date.now() - currentPresence.lastHeartbeat > HEARTBEAT_TIMEOUT) {
      // Host didn't reconnect, end the meeting
      hostPresence.set(roomName, {
        ...currentPresence,
        isEnded: true,
        gracePeriodTimeout: null,
        endReason: 'host_disconnected_timeout'
      });
      console.log(`[Meeting Ended] Grace period expired for room ${roomName}, meeting ended`);
    }
  }, HOST_GRACE_PERIOD);

  hostPresence.set(roomName, {
    lastHeartbeat: presence ? presence.lastHeartbeat : Date.now(),
    gracePeriodTimeout,
    isEnded: false,
    hostIdentity,
    gracePeriodStarted: Date.now()
  });

  res.json({ success: true, message: 'Grace period started', gracePeriodMs: HOST_GRACE_PERIOD });
});

// Check meeting status (for participants to poll)
app.get('/api/meeting/status/:roomName', (req, res) => {
  const { roomName } = req.params;

  const presence = hostPresence.get(roomName);
  
  if (!presence) {
    // No presence info - meeting hasn't started or was cleaned up
    return res.json({ isActive: true, hostPresent: true });
  }

  if (presence.isEnded) {
    return res.json({ 
      isActive: false, 
      hostPresent: false, 
      endReason: presence.endReason,
      message: presence.endReason === 'host_ended' 
        ? 'The host has ended the meeting' 
        : 'The host has left and the meeting has ended'
    });
  }

  // Check if host is in grace period
  const inGracePeriod = presence.gracePeriodTimeout !== null;
  const gracePeriodRemaining = inGracePeriod 
    ? Math.max(0, HOST_GRACE_PERIOD - (Date.now() - presence.gracePeriodStarted))
    : 0;

  res.json({ 
    isActive: true, 
    hostPresent: !inGracePeriod,
    inGracePeriod,
    gracePeriodRemaining,
    message: inGracePeriod 
      ? 'Host temporarily disconnected, waiting for reconnection...' 
      : 'Meeting is active'
  });
});

// Clean up when room is empty
app.post('/api/meeting/room/cleanup', (req, res) => {
  const { roomName } = req.body;

  if (roomName) {
    waitingRooms.delete(roomName);
    roomHosts.delete(roomName);
    
    // Clear any grace period timeout before deleting
    const presence = hostPresence.get(roomName);
    if (presence && presence.gracePeriodTimeout) {
      clearTimeout(presence.gracePeriodTimeout);
    }
    hostPresence.delete(roomName);
    
    console.log(`[Room Cleanup] Room ${roomName} cleaned up`);
  }

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
