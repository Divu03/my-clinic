import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QueueStatus, Token } from '../models/types';

interface QueueContextType {
  socket: Socket | null;
  activeToken: Token | null;
  queueStatus: QueueStatus | null;
  joinQueue: (token: Token) => void;
  leaveQueue: () => void;
}

const QueueContext = createContext<QueueContextType>({} as any);

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  // Initialize Socket on App Start
  useEffect(() => {
    const initSocket = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // Replace with your Laptop IP if testing on physical device (e.g., http://192.168.1.5:3000)
        const newSocket = io('http://localhost:3000', {
          auth: { token },
        });

        newSocket.on('connect', () => console.log('Socket Connected:', newSocket.id));
        setSocket(newSocket);
      }
    };
    initSocket();

    return () => { socket?.disconnect(); };
  }, []);

  // Handle Joining a Queue
  const joinQueue = (token: Token) => {
    setActiveToken(token);
    if (socket) {
      socket.emit('join-queue', token.queueId);

      // Listen for updates from backend: "queue:status_update"
      socket.on('queue:status_update', (status: QueueStatus) => {
        setQueueStatus(status);
      });

      // Listen for personal updates: "queue:your_token_called"
      socket.on('queue:your_token_called', (updatedToken: Token) => {
        setActiveToken(updatedToken);
        alert("Your token has been called!");
      });
    }
  };

  const leaveQueue = () => {
    if (socket && activeToken) {
      socket.emit('leave-queue', activeToken.queueId);
      socket.off('queue:status_update');
    }
    setActiveToken(null);
    setQueueStatus(null);
  };

  return (
    <QueueContext.Provider value={{ socket, activeToken, queueStatus, joinQueue, leaveQueue }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);