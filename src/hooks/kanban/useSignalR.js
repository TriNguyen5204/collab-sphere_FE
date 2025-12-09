import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const useSignalR = (hubUrl, token, workspaceId) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!token || !hubUrl || !workspaceId) return;

    // Create connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = newConnection;

    // Start connection
    
    newConnection
      .start()
      .then(() => {
        console.log('SignalR Connected!');
        setIsConnected(true);
        setConnection(newConnection);

        // Automatically join workspace
        return newConnection.invoke('JoinWorkspace', workspaceId);
      })
      .then(() => {
        console.log(`Joined workspace ${workspaceId}`);
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        setIsConnected(false);
      });

    // Cleanup khi unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .invoke('LeaveWorkspace', workspaceId)
          .then(() => connectionRef.current.stop())
          .catch(err => console.error('Error leaving workspace:', err));
      }
    };
  }, [hubUrl, token, workspaceId]);

  return { connection, isConnected };
};

export default useSignalR;