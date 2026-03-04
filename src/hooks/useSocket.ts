import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { SOCKET_URL } from '../config/env';

export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Conectar al servidor Socket.IO (URL desde configuración)
    
    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Unirse a la sala del usuario
    socket.emit('join-user-room', user.id);

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    // Limpiar al desmontar
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  return socketRef.current;
};

