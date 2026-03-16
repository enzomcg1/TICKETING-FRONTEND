import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_ENABLED, SOCKET_URL } from '../config/env';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!SOCKET_ENABLED || !user || !token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    socket.emit('join-user-room', user.id);

    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('Socket.IO connected:', socket.id);
      }
    });

    socket.on('disconnect', () => {
      if (import.meta.env.DEV) {
        console.log('Socket.IO disconnected');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  return socketRef.current;
};
