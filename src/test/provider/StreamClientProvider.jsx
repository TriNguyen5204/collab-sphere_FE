import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-sdk';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const apiKey = import.meta.env.STREAM_API_KEY;

const StreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState();
  const user = useSelector(state => state.user);
  useEffect(() => {
    if (!user) return;
    if (!apiKey) throw new Error('Stream API key is missing');

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.userId,
        name: user.roleName
      },
    });
  });
  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}></StreamCall>
    </StreamVideo>
  );
};
export default StreamVideoProvider;
