import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  LiveKitRoom,
  GridLayout,
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  useTrackRefContext,
  VideoTrack,
  useIsSpeaking,
  useConnectionState,
  useDataChannel,
  useChat,
} from '@livekit/components-react';
import { Track, RoomEvent, ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createContext, useContext } from 'react';

// API for team info
import { getTeamDetail } from '../../services/teamApi';
// API for meeting lookup (to get teamId from meetingUrl when direct URL access)
import { getMeeting } from '../../features/meeting/services/meetingApi';
// Recording hook for LiveKit
import useLiveKitRecorder from '../../features/meeting/hooks/useLiveKitRecorder';

const RaisedHandsContext = createContext({});

// Helper function to extract just the name without the userId from identity
// Identity format: "Name (userId)" - we extract just "Name"
const extractDisplayName = (nameOrIdentity) => {
  if (!nameOrIdentity) return 'Unknown';
  const match = nameOrIdentity.match(/^(.+?)\s*\(.*\)$/);
  return match ? match[1].trim() : nameOrIdentity;
};

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MessageSquare,
  Users,
  Info,
  Hand,
  MoreVertical,
  Loader2,
  Copy,
  Check,
  XCircle,
  Link,
  Smile,
  Heart,
  ThumbsUp,
  PartyPopper,
  Sparkles,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// Floating Reaction Animation Component
// ==========================================
function FloatingReaction({ emoji, id, senderName, leftPosition, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div
      className="fixed flex flex-col items-center pointer-events-none z-[100] animate-float-up"
      style={{ bottom: '100px', left: `${leftPosition}%` }}
    >
      <span className="text-5xl mb-1">{emoji}</span>
      <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded-full whitespace-nowrap">
        {senderName}
      </span>
    </div>
  );
}

// CSS for floating animation (injected inline)
const floatingReactionStyles = `
  @keyframes floatUpBalloon {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-70vh);
    }
  }
  .animate-float-up {
    animation: floatUpBalloon 4s linear forwards;
  }
`;

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://collabsphere-iy6tsvij.livekit.cloud';

// ==========================================
// 1. Custom Participant Tile (Google Meet Style)
// ==========================================
function GoogleMeetTile({ trackRef, raisedHand, ...props }) {
  const raisedHands = useContext(RaisedHandsContext);

  // If trackRef is passed as prop, use it.
  // If NOT passed, we assume we are inside a context provider (like GridLayout)
  if (trackRef) {
    return <GoogleMeetTileInner trackRef={trackRef} raisedHands={raisedHands} {...props} />;
  } else {
    return <GoogleMeetTileWithContext raisedHands={raisedHands} {...props} />;
  }
}

function GoogleMeetTileWithContext({ raisedHands, ...props }) {
  const trackRef = useTrackRefContext();
  return <GoogleMeetTileInner trackRef={trackRef} raisedHands={raisedHands} {...props} />;
}

function GoogleMeetTileInner({ trackRef, raisedHands, ...props }) {
  if (!trackRef) {
    return <div className="w-full h-full bg-[#3c4043] rounded-xl flex items-center justify-center text-white">No Track</div>;
  }

  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const isRaisedHand = raisedHands ? raisedHands[participant.identity] : false;

  // Check if camera is enabled
  const isCameraEnabled = participant.isCameraEnabled;
  const isMicEnabled = participant.isMicrophoneEnabled;

  // Determine display name (extract name without userId)
  const displayName = extractDisplayName(participant.name || participant.identity);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={`relative w-full h-full bg-[#3c4043] rounded-xl overflow-hidden group transition-all duration-200
        ${isSpeaking ? 'ring-2 ring-blue-500' : 'ring-0'}
      `}
    >
      {/* Video Track or Avatar */}
      {isCameraEnabled ? (
        <VideoTrack
          trackRef={trackRef}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-medium shadow-lg">
            {initial}
          </div>
        </div>
      )}

      {/* Name Tag & Status (Bottom Left) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 max-w-[80%]">
        <div className="bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-2 py-1 rounded-md truncate flex items-center gap-2">
          <span className="truncate">{displayName} {participant.isLocal && "(You)"}</span>
          {!isMicEnabled && (
            <MicOff className="w-3 h-3 text-red-400" />
          )}
        </div>
      </div>

      {/* Top Right Status Icons (Hand raise) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        {isRaisedHand && (
          <div className="bg-[#3c4043] p-2 rounded-full shadow-md animate-bounce">
            <Hand className="w-5 h-5 text-[#8ab4f8]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Screen Share Video Component with proper track attachment
// ==========================================
function ScreenShareVideo({ trackRef }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    const track = trackRef?.publication?.track;

    if (!videoEl || !track) {
      console.log('[ScreenShareVideo] Missing video element or track', { videoEl: !!videoEl, track: !!track });
      return;
    }

    console.log('[ScreenShareVideo] Attaching track:', track.sid, track.kind);

    // Attach the track to the video element
    track.attach(videoEl);

    // Force play in case browser blocks autoplay
    videoEl.play().catch(err => {
      console.warn('[ScreenShareVideo] Autoplay blocked:', err);
    });

    return () => {
      console.log('[ScreenShareVideo] Detaching track:', track.sid);
      track.detach(videoEl);
    };
  }, [trackRef?.publication?.track]);

  // Also handle when trackRef changes but track is same object
  useEffect(() => {
    const track = trackRef?.publication?.track;
    if (track && videoRef.current) {
      // Ensure track is attached even if ref didn't change
      const attachedElements = track.attachedElements || [];
      if (!attachedElements.includes(videoRef.current)) {
        console.log('[ScreenShareVideo] Re-attaching track (ref unchanged)');
        track.attach(videoRef.current);
      }
    }
  }, [trackRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-contain"
      style={{ backgroundColor: '#18191b' }}
    />
  );
}

// ==========================================
// 2. Custom Chat Component
// ==========================================
function MeetingChat({ localParticipant }) {
  const { chatMessages, send, isSending } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Extract just the name without the userId from identity
  const extractName = (identity) => {
    if (!identity) return 'Unknown';
    // Identity format: "Name (userId)" - extract just the name
    const match = identity.match(/^(.+?)\s*\(.*\)$/);
    return match ? match[1].trim() : identity;
  };

  // Get local participant's identity for comparison
  const localIdentity = localParticipant?.identity;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    try {
      await send(inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#9aa0a6] text-sm">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center">Messages can only be seen by<br />people in the call</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isOwnMessage = msg.from?.identity === localIdentity;
            const senderName = isOwnMessage ? 'You' : extractName(msg.from?.identity);

            return (
              <div
                key={index}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                {/* Sender name & time */}
                <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-xs font-medium ${isOwnMessage ? 'text-[#8ab4f8]' : 'text-[#e8eaed]'}`}>
                    {senderName}
                  </span>
                  <span className="text-[10px] text-[#9aa0a6]">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${isOwnMessage
                    ? 'bg-[#1a73e8] text-white rounded-tr-sm'
                    : 'bg-[#3c4043] text-[#e8eaed] rounded-tl-sm'
                    }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#3c4043]">
        <div className="flex items-center gap-2 bg-[#3c4043] rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-[#e8eaed] text-sm placeholder-[#9aa0a6] outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={`p-1.5 rounded-full transition-colors ${inputValue.trim() && !isSending
              ? 'text-[#8ab4f8] hover:bg-[#4a4d51] cursor-pointer'
              : 'text-[#5f6368] cursor-not-allowed'
              }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Emoji Reaction Bar Component
// ==========================================
function ReactionBar({ onReact, isOpen, onClose }) {
  const reactions = [
    { emoji: '❤️', label: 'Love' },
    { emoji: '👍', label: 'Thumbs up' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '👏', label: 'Clap' },
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#3c4043] rounded-full px-2 py-1.5 flex items-center gap-1 shadow-lg border border-[#5f6368] animate-in fade-in slide-in-from-bottom-2 duration-200">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => {
            onReact(reaction.emoji);
            onClose();
          }}
          className="p-2 hover:bg-[#5f6368] rounded-full transition-all hover:scale-125 text-xl"
          title={reaction.label}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// 3. Custom Control Bar (Google Meet Style)
// ==========================================
function GoogleMeetControlBar({ 
  roomId, 
  onLeave, 
  onToggleChat, 
  onToggleParticipants, 
  onToggleInfo, 
  isChatOpen, 
  isParticipantsOpen, 
  isInfoOpen, 
  isHandRaised, 
  onToggleHand, 
  onReact, 
  isHost,
  // Recording props
  isRecording,
  onToggleRecording,
  isRecordingDisabled,
  recordingUserId,
  isUploading,
  currentUserId
}) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copied, setCopied] = useState(false);
  const [isReactionBarOpen, setIsReactionBarOpen] = useState(false);
  const { send } = useDataChannel('control-events');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Derive state directly from localParticipant
  const isMicOn = localParticipant?.isMicrophoneEnabled ?? false;
  const isCamOn = localParticipant?.isCameraEnabled ?? false;
  const isScreenShareOn = localParticipant?.isScreenShareEnabled ?? false;

  const toggleMic = async () => {
    if (localParticipant) {
      const newState = !isMicOn;
      await localParticipant.setMicrophoneEnabled(newState);
    }
  };

  const toggleCam = async () => {
    if (localParticipant) {
      const newState = !isCamOn;
      await localParticipant.setCameraEnabled(newState);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      const newState = !isScreenShareOn;
      await localParticipant.setScreenShareEnabled(newState);
    }
  };

  const handleRaiseHand = async () => {
    if (localParticipant && send && onToggleHand) {
      const payload = JSON.stringify({
        type: isHandRaised ? 'LOWER_HAND' : 'RAISE_HAND',
        userId: localParticipant.identity,
        userName: extractDisplayName(localParticipant.name || localParticipant.identity)
      });

      try {
        await send(new TextEncoder().encode(payload), { reliable: true });
        onToggleHand(); // Toggle local state
      } catch (error) {
        console.error("Failed to send hand event:", error);
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Meeting code copied!");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-20 bg-[#202124] flex items-center justify-between px-6 shrink-0 z-50">
      {/* LEFT: Meeting Details */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <span className="text-white font-medium text-lg tracking-wide">
          {formatTime(currentTime)}
        </span>
        <div className="h-6 w-[1px] bg-[#5f6368]"></div>
        <div className="flex items-center gap-2">
          <span className="text-[#e8eaed] font-medium text-sm">{roomId}</span>
          <button
            onClick={copyRoomId}
            className="text-[#a8c7fa] hover:bg-[#3c4043] p-1.5 rounded-full transition-colors"
            title="Copy meeting code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CENTER: Controls */}
      <div className="flex items-center gap-3">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all duration-200 ${isMicOn
            ? 'bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent'
            : 'bg-[#ea4335] hover:bg-[#d93025] text-white border border-transparent'
            }`}
          title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition-all duration-200 ${isCamOn
            ? 'bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent'
            : 'bg-[#ea4335] hover:bg-[#d93025] text-white border border-transparent'
            }`}
          title={isCamOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Hand Raise */}
        <button
          onClick={handleRaiseHand}
          className={`p-4 rounded-full transition-all duration-200 ${isHandRaised
            ? 'bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] ring-2 ring-[#8ab4f8] ring-offset-2 ring-offset-[#202124]'
            : 'bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent'
            }`}
          title={isHandRaised ? "Lower hand" : "Raise hand"}
        >
          <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
        </button>

        {/* Emoji Reactions */}
        <div className="relative">
          <ReactionBar
            isOpen={isReactionBarOpen}
            onReact={onReact}
            onClose={() => setIsReactionBarOpen(false)}
          />
          <button
            onClick={() => setIsReactionBarOpen(!isReactionBarOpen)}
            className={`p-4 rounded-full transition-all duration-200 ${isReactionBarOpen
              ? 'bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]'
              : 'bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent'
              }`}
            title="Send a reaction"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Recording Button - Only show for host */}
        {isHost && (
          <div className="relative">
            <button
              onClick={onToggleRecording}
              disabled={isRecordingDisabled || isUploading}
              className={`p-4 rounded-full transition-all duration-200 relative ${
                isRecording
                  ? 'bg-[#ea4335] hover:bg-[#d93025] text-white animate-pulse'
                  : isRecordingDisabled
                    ? 'bg-[#3c4043] text-[#5f6368] cursor-not-allowed opacity-60'
                    : 'bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent'
              }`}
              title={
                isUploading 
                  ? 'Uploading recording...' 
                  : isRecordingDisabled && recordingUserId !== currentUserId
                    ? `Another user is recording`
                    : isRecording 
                      ? 'Stop recording' 
                      : 'Start recording'
              }
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Circle className={`w-5 h-5 ${isRecording ? 'fill-current' : ''}`} />
              )}
              {/* Recording indicator dot */}
              {isRecording && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
            {/* Recording status tooltip */}
            {isRecordingDisabled && recordingUserId && recordingUserId !== currentUserId && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#3c4043] text-white text-xs rounded whitespace-nowrap">
                Recording in progress
              </div>
            )}
          </div>
        )}

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-all duration-200 ${isScreenShareOn
            ? 'bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124]'
            : 'bg-[#3c4043] hover:bg-[#4b4f54] text-white'
            }`}
          title="Present now"
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        {/* More Options */}
        <button
          className="p-4 rounded-full bg-[#3c4043] hover:bg-[#4b4f54] text-white border border-transparent transition-all"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* End Call */}
        <button
          onClick={onLeave}
          className="ml-2 px-6 py-3 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center gap-2 transition-all"
          title={isHost ? "End meeting for all" : "Leave call"}
        >
          <PhoneOff className="w-5 h-5" />
          {isHost && <span className="text-sm font-medium">End</span>}
        </button>
      </div>

      {/* RIGHT: Info Icons */}
      <div className="flex items-center gap-2 min-w-[200px] justify-end">
        <button
          onClick={onToggleInfo}
          className={`p-3 rounded-full transition-colors ${isInfoOpen
            ? 'bg-[#8ab4f8] text-[#202124]'
            : 'hover:bg-[#3c4043] text-white'
            }`}
          title="Meeting details"
        >
          <Info className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleParticipants}
          className={`p-3 rounded-full transition-colors ${isParticipantsOpen
            ? 'bg-[#8ab4f8] text-[#202124]'
            : 'hover:bg-[#3c4043] text-white'
            }`}
          title="People"
        >
          <Users className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleChat}
          className={`p-3 rounded-full transition-colors ${isChatOpen
            ? 'bg-[#8ab4f8] text-[#202124]'
            : 'hover:bg-[#3c4043] text-white'
            }`}
          title="Chat with everyone"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 3. Main Stage (Grid Layout)
// ==========================================
function GoogleMeetStage() {
  // 1. Fetch screen share tracks - CRITICAL: onlySubscribed must be false to see local shares
  const screenShareTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  // 2. Fetch camera tracks (participants)
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  // Find the best screen share track to display
  const remoteScreenShare = screenShareTracks.find(t => !t.participant.isLocal && t.publication?.track);
  const localScreenShare = screenShareTracks.find(t => t.participant.isLocal && t.publication?.track);
  const activeScreenShare = remoteScreenShare || localScreenShare;

  const isScreenSharing = !!activeScreenShare;
  const isLocalSharing = activeScreenShare?.participant?.isLocal ?? false;

  // Debug logging
  console.log('[GoogleMeetStage] Debug:', {
    screenShareTracksCount: screenShareTracks.length,
    isScreenSharing,
    isLocalSharing,
  });

  // Limit visible participants
  const MAX_VISIBLE_PARTICIPANTS = 9;
  const visibleParticipants = cameraTracks.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const hiddenParticipantsCount = Math.max(0, cameraTracks.length - MAX_VISIBLE_PARTICIPANTS);

  // ========== PRESENTATION MODE ==========
  if (isScreenSharing) {
    return (
      <div className="flex-1 p-2 flex flex-col relative" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Main Screen Share Area - Takes maximum space */}
        <div className="flex-1 bg-[#202124] rounded-xl relative overflow-hidden">
          {/* Screen share video - object-contain to preserve aspect ratio */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ScreenShareVideo trackRef={activeScreenShare} />
          </div>

          {/* Presenter info badge - bottom left */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded flex items-center gap-2 z-10">
            <MonitorUp className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">
              {isLocalSharing
                ? extractDisplayName(activeScreenShare?.participant?.name || 'You') + ' (You)'
                : extractDisplayName(activeScreenShare?.participant?.identity || activeScreenShare?.participant?.name)}
            </span>
          </div>
        </div>

        {/* Floating Participant Strip - Bottom horizontal bar */}
        {cameraTracks.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20">
            <div className="flex gap-2 bg-[#202124]/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-[#3c4043]/50">
              {cameraTracks.slice(0, 5).map((track) => {
                const participant = track.participant;
                const displayName = extractDisplayName(participant.name || participant.identity);
                const initial = displayName.charAt(0).toUpperCase();
                const isCameraOn = participant.isCameraEnabled;
                const isPresenter = participant.identity === activeScreenShare?.participant?.identity;

                return (
                  <div
                    key={participant.identity}
                    className={`w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#3c4043] relative ${isPresenter ? 'ring-2 ring-green-500' : ''
                      }`}
                  >
                    {isCameraOn ? (
                      <VideoTrack trackRef={track} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {initial}
                        </div>
                      </div>
                    )}
                    {/* Compact name tag */}
                    <div className="absolute bottom-0.5 left-0.5 right-0.5">
                      <span className="text-white text-[10px] bg-black/60 px-1 py-0.5 rounded truncate block text-center">
                        {displayName.split(' ')[0]}
                      </span>
                    </div>
                    {/* Presenter indicator */}
                    {isPresenter && (
                      <div className="absolute top-0.5 right-0.5">
                        <MonitorUp className="w-3 h-3 text-green-400" />
                      </div>
                    )}
                  </div>
                );
              })}
              {cameraTracks.length > 5 && (
                <div className="w-24 h-16 flex-shrink-0 rounded-lg bg-[#3c4043] flex items-center justify-center">
                  <span className="text-white text-xs font-medium">+{cameraTracks.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== STANDARD GRID MODE ==========
  if (cameraTracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-3">
        <div className="w-24 h-24 bg-[#3c4043] rounded-full flex items-center justify-center mb-4">
          <Users className="w-12 h-12" />
        </div>
        <p className="text-xl font-medium">No one else is here</p>
        <p className="text-sm mt-2">Share the meeting link to invite others</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="w-full h-full relative">
        <GridLayout
          tracks={visibleParticipants}
          style={{ height: '100%', width: '100%' }}
        >
          <GoogleMeetTile className="rounded-xl border border-[#3C4043] overflow-hidden" />
        </GridLayout>

        {hiddenParticipantsCount > 0 && (
          <div className="absolute bottom-4 right-4 bg-[#202124] text-white px-4 py-2 rounded-full shadow-lg border border-[#3C4043] flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-medium">+{hiddenParticipantsCount} others</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get teamId from localStorage (where TeamContext stores it)
const getTeamIdFromStorage = () => {
  try {
    const raw = localStorage.getItem('teamDetail');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    // teamDetail might be stored as just the teamId number, or as an object
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed === 'string') return parseInt(parsed, 10) || null;
    if (parsed && typeof parsed === 'object') {
      return parsed.teamId || parsed.id || null;
    }
    return null;
  } catch {
    return null;
  }
};

// ==========================================
// 4. Main Meeting Room Component
// ==========================================
export default function MeetingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get teamId from multiple sources (priority order):
  // 1. Navigation state (from RoomJoinPage)
  // 2. localStorage (from TeamContext - stored when user visits team-workspace)
  // 3. Meeting API lookup (fallback)
  const stateTeamId = location.state?.teamId;
  const storedTeamId = useMemo(() => getTeamIdFromStorage(), []);

  // Get user info from Redux
  const fullName = useSelector(state => state.user.fullName);
  const userId = useSelector(state => state.user.userId);

  const [token, setToken] = useState('');
  const [error, setError] = useState(null);

  // Resolved teamId - from state, localStorage, OR looked up from meeting API
  const [resolvedTeamId, setResolvedTeamId] = useState(stateTeamId || storedTeamId);
  const [isResolvingTeamId, setIsResolvingTeamId] = useState(!stateTeamId && !storedTeamId);

  // Host state
  const [isHost, setIsHost] = useState(false);

  // Use a consistent identity
  const participantIdentity = useMemo(() => {
    return `${fullName || 'Guest'} (${userId || Math.floor(Math.random() * 1000)})`;
  }, [fullName, userId]);

  // Resolve teamId from meeting API if not in navigation state or localStorage (direct URL access)
  useEffect(() => {
    const resolveTeamIdFromMeeting = async () => {
      // If we already have teamId from state or localStorage, use it
      if (stateTeamId || storedTeamId) {
        const teamId = stateTeamId || storedTeamId;
        console.log('[MeetingRoom] Using teamId from', stateTeamId ? 'navigation state' : 'localStorage', ':', teamId);
        setResolvedTeamId(teamId);
        setIsResolvingTeamId(false);
        return;
      }

      // Fallback: Try to find the meeting by URL to get teamId
      try {
        console.log('[MeetingRoom] No teamId in state/localStorage, attempting to look up from meeting API...');

        // Try to find meeting with matching URL
        const response = await getMeeting({ pageNum: 1, pageSize: 100 });

        if (response?.isSuccess && response.paginatedMeeting?.list) {
          const meetings = response.paginatedMeeting.list;

          // Find meeting where meetingUrl contains our roomId
          const matchingMeeting = meetings.find(meeting => {
            if (!meeting.meetingUrl) return false;
            return meeting.meetingUrl.includes(roomId);
          });

          if (matchingMeeting) {
            console.log('[MeetingRoom] Found matching meeting from API:', {
              meetingId: matchingMeeting.meetingId,
              teamId: matchingMeeting.teamId,
              title: matchingMeeting.title
            });
            setResolvedTeamId(matchingMeeting.teamId);
          } else {
            console.log('[MeetingRoom] No matching meeting found for roomId:', roomId);
            setResolvedTeamId(null);
          }
        } else {
          console.log('[MeetingRoom] Failed to fetch meetings for teamId lookup');
          setResolvedTeamId(null);
        }
      } catch (error) {
        console.error('[MeetingRoom] Error resolving teamId from meeting API:', error);
        setResolvedTeamId(null);
      } finally {
        setIsResolvingTeamId(false);
      }
    };

    resolveTeamIdFromMeeting();
  }, [roomId, stateTeamId, storedTeamId]);

  // Fetch token directly
  useEffect(() => {
    if (!roomId || !fullName) return;

    const fetchToken = async () => {
      try {
        const tokenServerUrl = import.meta.env.VITE_TOKEN_SERVER_URL || 'http://localhost:5000';
        console.log('[MeetingRoom] Fetching token');
        const resp = await fetch(
          `${tokenServerUrl}/api/meeting/token?roomName=${roomId}&participantName=${encodeURIComponent(participantIdentity)}&isTeamMember=true`
        );

        if (!resp.ok) {
          throw new Error('Failed to fetch token');
        }

        const data = await resp.json();
        console.log('[MeetingRoom] Token response:', data);

        setToken(data.token);
        if (data.isHost) {
          setIsHost(true);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to connect to meeting server');
      }
    };

    fetchToken();
  }, [roomId, fullName, participantIdentity]);

  const handleLeave = () => {
    navigate('/meeting');
  };

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#202124] text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => navigate('/meeting')}
            className="px-4 py-2 bg-[#3c4043] hover:bg-[#4b4f54] rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (token === '') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#202124] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#8ab4f8]" />
          <p className="text-lg font-medium text-[#e8eaed]">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100vh', backgroundColor: '#202124' }}
      onDisconnected={handleLeave}
    >
      <MeetingContent roomId={roomId} onLeave={handleLeave} isHost={isHost} />
    </LiveKitRoom>
  );
}

function MeetingContent({ roomId, onLeave, isHost }) {
  const connectionState = useConnectionState();
  const room = useRoomContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [raisedHands, setRaisedHands] = useState({});
  const [handNotification, setHandNotification] = useState(null);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [hostDisconnected, setHostDisconnected] = useState(false); // Track if host is temporarily disconnected
  const [meetingEnded, setMeetingEnded] = useState(false); // Track if meeting has ended
  const [meetingEndReason, setMeetingEndReason] = useState(''); // Reason for meeting end
  const { localParticipant } = useLocalParticipant();
  const tokenServerUrl = import.meta.env.VITE_TOKEN_SERVER_URL || 'http://localhost:5000';

  // Create a stable send function for data channel messages
  const sendDataChannelMessage = useCallback((data) => {
    if (localParticipant) {
      const encoder = new TextEncoder();
      localParticipant.publishData(encoder.encode(JSON.stringify(data)), { 
        reliable: true, 
        topic: 'control-events' 
      });
    }
  }, [localParticipant]);

  // Recording hook - integrates with LiveKit data channel
  const {
    isRecording,
    isRecordingDisabled,
    recordingUserId,
    isUploading,
    uploadProgress,
    isDownloading,
    recordingError,
    toggleRecording,
    handleRecordingMessage,
  } = useLiveKitRecorder({
    meetingId: roomId,
    currentUserId: localParticipant?.identity,
    sendDataChannelMessage,
  });

  // Show recording errors via toast
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError, {
        duration: 5000,
        description: 'Recording operation failed',
      });
    }
  }, [recordingError]);

  // Host heartbeat - send periodic heartbeat to server
  useEffect(() => {
    if (!isHost || !localParticipant) return;

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(`${tokenServerUrl}/api/meeting/host/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomId,
            hostIdentity: localParticipant.identity
          }),
        });

        if (response.status === 410) {
          // Meeting was ended (shouldn't happen for host sending heartbeat)
          console.log('[Host Heartbeat] Meeting ended');
        }
      } catch (error) {
        console.error('[Host Heartbeat] Error sending heartbeat:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 5 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 5000);

    return () => clearInterval(heartbeatInterval);
  }, [isHost, localParticipant, roomId, tokenServerUrl]);

  // Handle host disconnect notification (before unload/refresh)
  useEffect(() => {
    if (!isHost || !localParticipant) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon to notify server even when page is closing
      const data = JSON.stringify({
        roomName: roomId,
        hostIdentity: localParticipant.identity
      });
      navigator.sendBeacon(
        `${tokenServerUrl}/api/meeting/host/disconnect`,
        new Blob([data], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isHost, localParticipant, roomId, tokenServerUrl]);

  // Non-host participants: Poll meeting status to detect if host ended meeting
  useEffect(() => {
    if (isHost || meetingEnded) return;

    const checkMeetingStatus = async () => {
      try {
        const response = await fetch(`${tokenServerUrl}/api/meeting/status/${roomId}`);

        // Handle non-OK responses gracefully
        if (!response.ok) {
          // If 404, endpoint might not exist (old server) or meeting cleaned up - ignore silently
          if (response.status === 404) {
            console.log('[Meeting Status] Endpoint not available or meeting cleaned up');
            return;
          }
          console.warn('[Meeting Status] Server returned:', response.status);
          return;
        }

        const data = await response.json();

        if (!data.isActive) {
          // Meeting has ended
          setMeetingEnded(true);
          setMeetingEndReason(data.message || 'The meeting has ended');
          setHostDisconnected(false);

          // Disconnect and leave after a short delay to show the message
          setTimeout(() => {
            room?.disconnect();
            onLeave();
          }, 3000);
        } else if (data.inGracePeriod) {
          // Host temporarily disconnected
          setHostDisconnected(true);
        } else {
          // Meeting is active and host is present
          setHostDisconnected(false);
        }
      } catch (error) {
        // Network error or JSON parse error - ignore silently to prevent console spam
        // This can happen if server is restarting or not running
        console.log('[Meeting Status] Could not check status (server may be unavailable)');
      }
    };

    // Check immediately and then poll every 3 seconds
    checkMeetingStatus();
    const statusInterval = setInterval(checkMeetingStatus, 3000);

    return () => clearInterval(statusInterval);
  }, [isHost, meetingEnded, roomId, tokenServerUrl, room, onLeave]);

  // Handle intentional meeting end by host
  const handleEndMeeting = async () => {
    if (!isHost || !localParticipant) return;

    try {
      await fetch(`${tokenServerUrl}/api/meeting/host/end-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: roomId,
          hostIdentity: localParticipant.identity
        }),
      });

      // Broadcast meeting ended via data channel for immediate notification
      const encoder = new TextEncoder();
      localParticipant.publishData(
        encoder.encode(JSON.stringify({
          type: 'MEETING_ENDED',
          reason: 'host_ended',
          message: 'The host has ended the meeting'
        })),
        { topic: 'control-events', reliable: true }
      );

      // Disconnect and leave
      room?.disconnect();
      onLeave();
    } catch (error) {
      console.error('[End Meeting] Error ending meeting:', error);
    }
  };

  // Single panel toggle - only show one panel at a time
  const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setIsParticipantsOpen(false);
      setIsInfoOpen(false);
    }
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(prev => !prev);
    if (!isParticipantsOpen) {
      setIsChatOpen(false);
      setIsInfoOpen(false);
    }
  };

  const handleToggleInfo = () => {
    setIsInfoOpen(prev => !prev);
    if (!isInfoOpen) {
      setIsChatOpen(false);
      setIsParticipantsOpen(false);
    }
  };



  // Handle emoji reaction - broadcast to all users
  const handleReaction = (emoji) => {
    if (!localParticipant) return;

    const senderName = extractDisplayName(localParticipant.name || localParticipant.identity);
    const reactionData = {
      type: 'EMOJI_REACTION',
      emoji,
      senderName,
      senderId: localParticipant.identity,
      timestamp: Date.now()
    };

    // Broadcast to all participants via data channel
    const encoder = new TextEncoder();
    const leftPosition = Math.random() * 80 + 5; // Random position from 5% to 85%
    localParticipant.publishData(encoder.encode(JSON.stringify({ ...reactionData, leftPosition })), { reliable: true, topic: 'control-events' });

    // Also show locally
    const newReaction = { id: Date.now(), emoji, senderName, leftPosition };
    setFloatingReactions(prev => [...prev, newReaction]);
  };

  const handleReactionComplete = (id) => {
    setFloatingReactions(prev => prev.filter(r => r.id !== id));
  };

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    const meetingUrl = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(meetingUrl);
  };

  // Check if local user has hand raised
  const isLocalHandRaised = localParticipant ? raisedHands[localParticipant.identity] : false;

  // Get all participants for the panel
  const participantTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  // Data Channel for Raise Hand
  useDataChannel('control-events', (msg) => {
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload));
      if (payload.type === 'RAISE_HAND') {
        setRaisedHands(prev => ({
          ...prev,
          [payload.userId]: true
        }));

        // Show custom notification for everyone
        // Notification stays until user lowers their hand
        const isLocalUser = localParticipant && payload.userId === localParticipant.identity;
        const displayName = isLocalUser ? 'You' : payload.userName;
        setHandNotification({ userName: displayName, userId: payload.userId, isLocal: isLocalUser, id: Date.now() });
      } else if (payload.type === 'LOWER_HAND') {
        setRaisedHands(prev => {
          const newState = { ...prev };
          delete newState[payload.userId];
          return newState;
        });

        // Clear notification when user lowers their hand
        setHandNotification(prev => {
          if (prev && prev.userId === payload.userId) {
            return null;
          }
          return prev;
        });
      } else if (payload.type === 'EMOJI_REACTION') {
        // Receive emoji reaction from other users
        const isFromMe = localParticipant && payload.senderId === localParticipant.identity;
        if (!isFromMe) {
          const newReaction = {
            id: payload.timestamp,
            emoji: payload.emoji,
            senderName: payload.senderName,
            leftPosition: payload.leftPosition || (Math.random() * 80 + 5) // Use transmitted position or fallback to random
          };
          setFloatingReactions(prev => [...prev, newReaction]);
        }
      } else if (payload.type === 'MEETING_ENDED') {
        // Host ended the meeting - immediate notification via data channel
        if (!isHost) {
          setMeetingEnded(true);
          setMeetingEndReason(payload.message || 'The host has ended the meeting');
          setHostDisconnected(false);

          // Disconnect and leave after showing message
          setTimeout(() => {
            room?.disconnect();
            onLeave();
          }, 3000);
        }
      } else if (payload.type === 'RECORDING_STARTED' || payload.type === 'RECORDING_STOPPED') {
        // Handle recording state sync from other participants via useLiveKitRecorder hook
        handleRecordingMessage(payload);
      }
    } catch (e) {
      console.error("Failed to parse control event", e);
    }
  });

  // Toggle local hand raise
  const handleToggleHand = () => {
    if (localParticipant) {
      const userId = localParticipant.identity;
      const isCurrentlyRaised = raisedHands[userId];

      setRaisedHands(prev => {
        if (prev[userId]) {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        } else {
          return { ...prev, [userId]: true };
        }
      });

      // Clear local notification when lowering hand
      if (isCurrentlyRaised) {
        setHandNotification(prev => {
          if (prev && prev.userId === userId) {
            return null;
          }
          return prev;
        });
      }
    }
  };

  // Inject floating animation styles
  useEffect(() => {
    const styleId = 'floating-reaction-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = floatingReactionStyles;
      document.head.appendChild(styleEl);
    }
    return () => {
      const styleEl = document.getElementById(styleId);
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <RaisedHandsContext.Provider value={raisedHands}>
      <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden relative">
        {/* Meeting Ended Overlay */}
        {meetingEnded && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center">
            <div className="bg-[#202124] rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-[#3c4043]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Meeting Ended</h2>
              <p className="text-[#9aa0a6] mb-6">{meetingEndReason}</p>
              <div className="flex items-center justify-center gap-2 text-[#8ab4f8]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Redirecting you back...</span>
              </div>
            </div>
          </div>
        )}

        {/* Host Temporarily Disconnected Banner */}
        {hostDisconnected && !meetingEnded && !isHost && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Host temporarily disconnected. Waiting for reconnection...</span>
          </div>
        )}

        {/* Connection State Overlay */}
        {connectionState === ConnectionState.Reconnecting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Reconnecting...</span>
          </div>
        )}

        {/* Custom Hand Raise Notification */}
        {handNotification && (
          <div
            key={handNotification.id}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className={`text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border ${handNotification.isLocal
              ? 'bg-[#1a73e8] border-[#1a73e8]'
              : 'bg-[#3c4043] border-[#5f6368]'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${handNotification.isLocal ? 'bg-white/20' : 'bg-[#8ab4f8]/20'
                }`}>
                <Hand className={`w-3.5 h-3.5 ${handNotification.isLocal ? 'text-white' : 'text-[#8ab4f8]'
                  }`} />
              </div>
              <span className="text-sm font-medium">
                {handNotification.isLocal ? 'You raised your hand' : `${handNotification.userName} raised hand`}
              </span>
            </div>
          </div>
        )}

        {/* Floating Emoji Reactions */}
        {floatingReactions.map(reaction => (
          <FloatingReaction
            key={reaction.id}
            emoji={reaction.emoji}
            id={reaction.id}
            senderName={reaction.senderName}
            leftPosition={reaction.leftPosition}
            onComplete={handleReactionComplete}
          />
        ))}

        <div className="flex flex-1 overflow-hidden h-full">
          {/* Main Stage Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full transition-all duration-300 ease-in-out">
            <GoogleMeetStage />
          </div>

          {/* Info Sidebar */}
          <div
            className={`bg-[#202124] border-l border-[#3C4043] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isInfoOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
              }`}
          >
            <div className="p-4 border-b border-[#3C4043] flex items-center justify-between min-w-[320px]">
              <h3 className="font-medium text-lg">Meeting details</h3>
              <button onClick={() => setIsInfoOpen(false)} className="p-1.5 hover:bg-[#3c4043] rounded-full transition-colors">
                <XCircle className="w-5 h-5 text-[#9aa0a6]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-w-[320px] p-4">
              {/* Meeting Link Section */}
              <div className="mb-6">
                <h4 className="text-[#9aa0a6] text-xs font-medium uppercase tracking-wider mb-3">Joining info</h4>
                <div className="bg-[#303134] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm text-white truncate flex-1">
                      {window.location.origin}/meeting/{roomId}
                    </span>
                    <button
                      onClick={copyMeetingLink}
                      className="p-2 hover:bg-[#3c4043] rounded-full transition-colors flex-shrink-0"
                      title="Copy joining info"
                    >
                      <Copy className="w-4 h-4 text-[#8ab4f8]" />
                    </button>
                  </div>
                  <p className="text-xs text-[#9aa0a6]">
                    Share this link with others you want to join the meeting
                  </p>
                </div>
              </div>

              {/* Meeting ID Section */}
              <div className="mb-6">
                <h4 className="text-[#9aa0a6] text-xs font-medium uppercase tracking-wider mb-3">Meeting ID</h4>
                <div className="flex items-center gap-2 text-white">
                  <Link className="w-4 h-4 text-[#8ab4f8]" />
                  <span className="text-sm font-mono">{roomId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Sidebar */}
          <div
            className={`bg-[#202124] border-l border-[#3C4043] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isParticipantsOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
              }`}
          >
            <div className="p-4 border-b border-[#3C4043] flex items-center justify-between min-w-[320px]">
              <h3 className="font-medium text-lg">People ({participantTracks.length})</h3>
              <button onClick={() => setIsParticipantsOpen(false)} className="p-1.5 hover:bg-[#3c4043] rounded-full transition-colors">
                <XCircle className="w-5 h-5 text-[#9aa0a6]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-w-[320px] p-2">
              {/* Participants */}
              {participantTracks.map((track) => {
                const participant = track.participant;
                const displayName = extractDisplayName(participant.name || participant.identity);
                const initial = displayName.charAt(0).toUpperCase();
                const isRaisedHand = raisedHands[participant.identity];

                return (
                  <div
                    key={participant.identity}
                    className="flex items-center gap-3 p-3 hover:bg-[#3c4043] rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-medium flex-shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {displayName} {participant.isLocal && '(You)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isRaisedHand && (
                        <div className="p-1.5 bg-[#8ab4f8]/20 rounded-full">
                          <Hand className="w-4 h-4 text-[#8ab4f8]" />
                        </div>
                      )}
                      {!participant.isMicrophoneEnabled && (
                        <div className="p-1.5">
                          <MicOff className="w-4 h-4 text-[#9aa0a6]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div
            className={`bg-[#202124] border-l border-[#3C4043] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isChatOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
              }`}
          >
            <div className="p-4 border-b border-[#3C4043] flex items-center justify-between min-w-[320px]">
              <h3 className="font-medium text-lg">In-call messages</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-1.5 hover:bg-[#3c4043] rounded-full transition-colors">
                <XCircle className="w-5 h-5 text-[#9aa0a6]" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-w-[320px] flex flex-col">
              <MeetingChat localParticipant={localParticipant} />
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <GoogleMeetControlBar
          roomId={roomId}
          onLeave={isHost ? handleEndMeeting : onLeave}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          onToggleInfo={handleToggleInfo}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          isInfoOpen={isInfoOpen}
          isHandRaised={isLocalHandRaised}
          onToggleHand={handleToggleHand}
          onReact={handleReaction}
          isHost={isHost}
          // Recording props
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          isRecordingDisabled={isRecordingDisabled}
          recordingUserId={recordingUserId}
          isUploading={isUploading}
          currentUserId={localParticipant?.identity}
        />

        {/* Essential for audio playback */}
        <RoomAudioRenderer />
      </div>
    </RaisedHandsContext.Provider>
  );
}
