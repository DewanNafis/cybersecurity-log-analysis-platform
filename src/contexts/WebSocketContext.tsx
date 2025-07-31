import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateRealTimeLogEntry } from '../utils/mockData';

interface MockSocket {
  onmessage: ((event: { data: string }) => void) | null;
}

interface WebSocketContextType {
  socket: MockSocket | null;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<MockSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    const token = localStorage.getItem('mock_auth_token');
    if (!token) {
      console.log('No auth token, skipping mock WebSocket connection');
      return;
    }

    console.log('✅ Mock WebSocket connected successfully');
    
    // Create mock socket
    const mockSocket: MockSocket = {
      onmessage: null
    };
    
    setSocket(mockSocket);
    setConnected(true);

    // Simulate real-time log updates
    const interval = setInterval(() => {
      if (mockSocket.onmessage) {
        // Generate new log entry
        const newLog = generateRealTimeLogEntry();
        
        // Send new log event
        mockSocket.onmessage({
          data: JSON.stringify({
            type: 'new_log',
            log: newLog,
            timestamp: new Date().toISOString()
          })
        });

        // If it's a threat, also send threat detection event
        if (newLog.threatLevel && ['medium', 'high', 'critical'].includes(newLog.threatLevel)) {
          setTimeout(() => {
            if (mockSocket.onmessage) {
              mockSocket.onmessage({
                data: JSON.stringify({
                  type: 'threat_detected',
                  threat: newLog,
                  timestamp: new Date().toISOString()
                })
              });
            }
          }, 100);
        }
      }
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    // Cleanup
    return () => {
      clearInterval(interval);
      setConnected(false);
      setSocket(null);
      console.log('🔌 Mock WebSocket disconnected');
    };
  }, []);

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