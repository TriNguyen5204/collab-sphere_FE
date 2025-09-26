import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
} from 'agora-rtc-react';
export const LiveVideo = () => {
  const appId = '15623f32123a43cd965737f3d7f95b28';
  const { channelName } = useParams();
  const [activeConnection, setActiveConnection] = useState(false);

  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const navigate = useNavigate();

  // Join the channel
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: null,
    },
    activeConnection
  );
  usePublish([localMicrophoneTrack, localCameraTrack]);

  //remote users
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  // play the remote user audio tracks
  audioTracks.forEach(track => track.play());
  return (
    <div className='relative w-full h-screen bg-gray-900 text-white flex flex-col'>
      {/* Remote video grid */}
      <div
        id='remoteVideoGrid'
        className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 p-4'
      >
        {remoteUsers.map(user => (
          <div
            key={user.uid}
            className='remote-video-container bg-black rounded-xl overflow-hidden shadow-lg'
          >
            <RemoteUser user={user} />
          </div>
        ))}
      </div>

      {/* Local video (picture-in-picture) */}
      <div
        id='localVideo'
        className='absolute bottom-24 right-6 w-48 h-32 rounded-lg overflow-hidden border-2 border-white shadow-xl'
      >
        <LocalUser
          audioTrack={localMicrophoneTrack}
          videoTrack={localCameraTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          playAudio={micOn}
          playVideo={cameraOn}
        />
      </div>

      {/* Control bar */}
      <div className='absolute bottom-0 w-full bg-gray-800 bg-opacity-90 py-4 flex justify-center gap-6'>
        <button
          className={`p-4 rounded-full shadow-md ${
            micOn
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          onClick={() => setMic(a => !a)}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          className={`p-4 rounded-full shadow-md ${
            cameraOn
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          onClick={() => setCamera(a => !a)}
        >
          {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

        <button
          id='endConnection'
          className='p-4 rounded-full shadow-md bg-red-600 hover:bg-red-700'
          onClick={() => {
            setActiveConnection(false);
            navigate('/');
          }}
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
};
