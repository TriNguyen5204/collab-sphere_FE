import { useEffect, useState } from 'react';
import {
  StreamVideoClient,
  StreamVideo,
  StreamTheme,
  StreamCall,
  CallControls,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useSelector } from 'react-redux';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamVideoMeeting() {
  const userRedux = useSelector(state => state.user);
  const user_id =
    userRedux?.userId?.toString() ||
    'guest_' + Math.random().toString(36).substring(2, 8);

  const user = { id: user_id };

  const tokenProvider = async () => {
    const res = await fetch('http://localhost:3001/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user_id }),
    });
    const { token } = await res.json();
    return token;
  };

  const [client, setClient] = useState();
  const [call, setCall] = useState();

  useEffect(() => {
    const myClient = StreamVideoClient.getOrCreateInstance({
      apiKey,
      user,
      tokenProvider,
    });

    setClient(myClient);
    return () => myClient.disconnectUser();
  }, []);

  useEffect(() => {
    if (!client) return;
    const callId = 'csb-' + Math.random().toString(16).substring(2);
    const myCall = client.call('default', callId);
    myCall.join({ create: true }).catch(console.error);
    setCall(myCall);

    return () => myCall.leave().catch(console.error);
  }, [client]);

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <SpeakerLayout />
          <CallControls />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
