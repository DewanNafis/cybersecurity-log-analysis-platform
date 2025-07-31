import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';
import { generateMockLogs } from '../utils/mockData';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  destination?: string;
  message: string;
  sourceIp: string;
  destinationIp?: string;
  port?: number;
  protocol?: string;
  eventType: string;
  severity: number;
  tags: string[];
  rawLog: string;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  mitreAttack?: string[];
}

export interface LogFilter {
  dateRange: { start: Date; end: Date };
  levels: string[];
  sources: string[];
  sourceIp?: string;
  destinationIp?: string;
  searchQuery?: string;
  threatLevel?: string[];
  tags?: string[];
}

interface LogContextType {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  filters: LogFilter;
  setFilters: (filters: LogFilter) => void;
  loading: boolean;
  totalCount: number;
  threats: LogEntry[];
  refreshLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { socket } = useWebSocket();

  const [filters, setFilters] = useState<LogFilter>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    },
    levels: [],
    sources: [],
    threatLevel: []
  });

  const threats = filteredLogs.filter(log => 
    log.threatLevel && ['medium', 'high', 'critical'].includes(log.threatLevel)
  );

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (socket && socket.onmessage) {
      const originalOnMessage = socket.onmessage;
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_log') {
          setLogs(prev => [data.log, ...prev.slice(0, 999)]); // Keep last 1000 logs
        } else if (data.type === 'threat_detected') {
          // Handle real-time threat notifications
          console.log('New threat detected:', data.threat);
        }
        // Call original handler if it exists
        if (originalOnMessage !== socket.onmessage) {
          originalOnMessage(event);
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock logs
      const mockLogs = generateMockLogs(150);
      
      setLogs(mockLogs);
      setTotalCount(mockLogs.length);
      
      console.log(`✅ Loaded ${mockLogs.length} mock logs`);
    } catch (error) {
      console.error('Failed to fetch mock logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Date range filter
    filtered = filtered.filter(log => 
      log.timestamp.getTime() >= filters.dateRange.start.getTime() && 
      log.timestamp.getTime() <= filters.dateRange.end.getTime()
    );

    // Level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter(log => filters.levels.includes(log.level));
    }

    // Source filter
    if (filters.sources.length > 0) {
      filtered = filtered.filter(log => filters.sources.includes(log.source));
    }

    // IP filters
    if (filters.sourceIp) {
      filtered = filtered.filter(log => 
        log.sourceIp.includes(filters.sourceIp!)
      );
    }

    if (filters.destinationIp) {
      filtered = filtered.filter(log => 
        log.destinationIp?.includes(filters.destinationIp!)
      );
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.sourceIp.includes(query) ||
        log.destinationIp?.includes(query) ||
        log.source.toLowerCase().includes(query)
      );
    }

    // Threat level filter
    if (filters.threatLevel && filters.threatLevel.length > 0) {
      filtered = filtered.filter(log => 
        log.threatLevel && filters.threatLevel!.includes(log.threatLevel)
      );
    }

    setFilteredLogs(filtered);
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  return (
    <LogContext.Provider value={{
      logs,
      filteredLogs,
      filters,
      setFilters,
      loading,
      totalCount,
      threats,
      refreshLogs
    }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
}