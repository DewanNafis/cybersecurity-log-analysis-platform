import React, { createContext, useContext, useEffect, useState } from 'react';
import { WS_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Ensure connection is closed when user logs out.
      if (socket) {
        socket.close();
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    const ws = new WebSocket(WS_BASE_URL);
    setSocket(ws);

    ws.onopen = () => {
      setConnected(true);
      console.log('✅ WebSocket connected');
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('🔌 WebSocket disconnected');
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
    };

    return () => {
      ws.close();
      setConnected(false);
      setSocket(null);
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ socket, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}