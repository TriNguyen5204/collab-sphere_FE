import React, { createContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

// ✅ Export context so hook can use it
export const SignalRContext = createContext(null);

export const SignalRProvider = ({ children, hubUrl, token, workspaceId }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !hubUrl || !workspaceId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return Math.random() * 10000;
          } else {
            return null;
          }
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onreconnecting(error => {
      console.log('SignalR Reconnecting...', error);
      setIsConnected(false);
    });

    newConnection.onreconnected(connectionId => {
      console.log('SignalR Reconnected!', connectionId);
      setIsConnected(true);
      newConnection.invoke('JoinWorkspace', workspaceId);
    });

    newConnection.onclose(error => {
      console.log('SignalR Connection Closed', error);
      setIsConnected(false);
    });

    newConnection
      .start()
      .then(() => {
        console.log('SignalR Connected!');
        setIsConnected(true);
        setConnection(newConnection);
        return newConnection.invoke('JoinWorkspace', workspaceId);
      })
      .then(() => {
        console.log(`Joined workspace ${workspaceId}`);
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        setIsConnected(false);
      });

    return () => {
      if (newConnection) {
        newConnection
          .invoke('LeaveWorkspace', workspaceId)
          .then(() => newConnection.stop())
          .catch(err => console.error('Error during cleanup:', err));
      }
    };
  }, [hubUrl, token, workspaceId]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};
