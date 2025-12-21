import { 
  GridLayout, 
  ParticipantTile, 
  useTracks, 
  VideoTrack 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Users } from 'lucide-react';

// ==========================================
// 3. Main Stage (Grid Layout)
// ==========================================
export default function GoogleMeetStage() {
  // 1. Fetch screen share tracks
  const screenShareTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: true }
  );

  // 2. Fetch camera tracks (participants)
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: true }
  );

  // Determine if we are in "Presentation Mode"
  const isScreenSharing = screenShareTracks.length > 0;

  return (
    <div className="flex-1 flex overflow-hidden p-3 gap-3">
      
      {isScreenSharing ? (
        /* --- PRESENTATION MODE LAYOUT --- */
        <>
          {/* Primary Focus Stage: Shared Content */}
          <div className="flex-1 bg-[#18191b] rounded-xl overflow-hidden flex items-center justify-center border border-[#3C4043]">
            {/* Render the screen share track directly */}
            <VideoTrack 
              trackRef={screenShareTracks[0]} 
              className="w-full h-full object-contain" 
              manageSubscription={true}
            />
          </div>

          {/* Secondary Sidebar: Participant List */}
          <div className="w-[280px] flex flex-col gap-3 overflow-y-auto pr-1 hidden md:flex">
            {cameraTracks.map((track) => (
              <div key={track.participant.identity} className="h-[180px] w-full flex-shrink-0">
                <ParticipantTile 
                  trackRef={track} 
                  className="rounded-xl border border-[#3C4043] overflow-hidden w-full h-full"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* --- STANDARD DYNAMIC GRID LAYOUT --- */
        cameraTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-[#9aa0a6] w-full h-full">
            <div className="w-24 h-24 bg-[#3c4043] rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">No one else is here</p>
            <p className="text-sm">Share the meeting code to invite others</p>
          </div>
        ) : (
          <GridLayout
            tracks={cameraTracks}
            style={{ height: '100%', width: '100%' }}
          >
            <ParticipantTile 
              className="rounded-xl border border-[#3C4043] overflow-hidden" 
            />
          </GridLayout>
        )
      )}
      
    </div>
  );
}
