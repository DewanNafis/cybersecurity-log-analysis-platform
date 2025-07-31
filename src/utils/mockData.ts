import { LogEntry } from '../contexts/LogContext';

// Mock user data
export const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    password: 'password',
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete', 'manage_users', 'configure']
  },
  analyst: {
    id: '2',
    username: 'analyst',
    email: 'analyst@company.com',
    password: 'analyst123',
    role: 'analyst' as const,
    permissions: ['read', 'write', 'analyze']
  },
  viewer: {
    id: '3',
    username: 'viewer',
    email: 'viewer@company.com',
    password: 'viewer123',
    role: 'viewer' as const,
    permissions: ['read']
  }
};

// Mock log sources and event types
const sources = ['firewall', 'web-server', 'database', 'auth-service', 'proxy', 'dns-server', 'mail-server'];
const levels = ['info', 'warning', 'error', 'critical'] as const;
const eventTypes = ['login', 'request', 'error', 'security', 'system', 'network', 'authentication'];
const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'FTP'];

const sampleMessages = [
  'User login successful',
  'Failed authentication attempt',
  'Database connection established',
  'Suspicious file upload detected',
  'Rate limit exceeded',
  'SQL injection attempt blocked',
  'System backup completed',
  'Memory usage high',
  'Network connection timeout',
  'Malware signature detected',
  'Brute force attack detected',
  'Unauthorized access attempt',
  'Certificate expired',
  'Port scan detected',
  'DDoS attack mitigated',
  'Privilege escalation attempt',
  'Data exfiltration detected',
  'Ransomware activity blocked',
  'Phishing email detected',
  'Insider threat activity'
];

const suspiciousIPs = [
  '203.0.113.1', '198.51.100.5', '192.0.2.10', '203.0.113.25',
  '198.51.100.100', '192.0.2.50', '10.0.0.100', '172.16.0.50'
];

const internalIPs = [
  '192.168.1.', '10.0.0.', '172.16.0.', '192.168.0.'
];

// Generate a unique log ID
export function generateLogId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Analyze log for threats (simulated AI analysis)
export function analyzeLogForThreats(logEntry: Partial<LogEntry>) {
  const message = logEntry.message?.toLowerCase() || '';
  const sourceIp = logEntry.sourceIp || '';
  
  let threatLevel: LogEntry['threatLevel'] = undefined;
  let mitreAttack: string[] = [];
  
  // Simple rule-based threat detection
  if (message.includes('failed login') || message.includes('authentication failed') || message.includes('brute force')) {
    threatLevel = 'medium';
    mitreAttack = ['T1110']; // Brute Force
  } else if (message.includes('sql injection') || message.includes('xss') || message.includes('injection')) {
    threatLevel = 'high';
    mitreAttack = ['T1190']; // Exploit Public-Facing Application
  } else if (message.includes('malware') || message.includes('virus') || message.includes('ransomware')) {
    threatLevel = 'critical';
    mitreAttack = ['T1055']; // Process Injection
  } else if (message.includes('ddos') || message.includes('dos attack')) {
    threatLevel = 'high';
    mitreAttack = ['T1498']; // Network Denial of Service
  } else if (message.includes('privilege escalation') || message.includes('unauthorized access')) {
    threatLevel = 'high';
    mitreAttack = ['T1078']; // Valid Accounts
  } else if (message.includes('data exfiltration') || message.includes('insider threat')) {
    threatLevel = 'critical';
    mitreAttack = ['T1041']; // Exfiltration Over C2 Channel
  } else if (message.includes('port scan') || message.includes('reconnaissance')) {
    threatLevel = 'medium';
    mitreAttack = ['T1046']; // Network Service Scanning
  } else if (message.includes('phishing') || message.includes('social engineering')) {
    threatLevel = 'high';
    mitreAttack = ['T1566']; // Phishing
  } else if (message.includes('suspicious') || message.includes('anomaly') || message.includes('unusual')) {
    threatLevel = 'low';
  }
  
  // Check for suspicious IPs
  if (sourceIp && suspiciousIPs.some(ip => sourceIp.includes(ip))) {
    threatLevel = threatLevel || 'medium';
  }
  
  // Random threat assignment for demonstration
  if (!threatLevel && Math.random() > 0.85) {
    const levels: LogEntry['threatLevel'][] = ['low', 'medium', 'high'];
    threatLevel = levels[Math.floor(Math.random() * levels.length)];
  }
  
  return { threatLevel, mitreAttack };
}

// Generate a single mock log entry
export function generateMockLogEntry(): LogEntry {
  const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
  const level = levels[Math.floor(Math.random() * levels.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  // Generate IP addresses
  const isInternal = Math.random() > 0.3;
  const sourceIp = isInternal 
    ? `${internalIPs[Math.floor(Math.random() * internalIPs.length)]}${Math.floor(Math.random() * 255)}`
    : suspiciousIPs[Math.floor(Math.random() * suspiciousIPs.length)];
  
  const destinationIp = Math.random() > 0.5 
    ? `${internalIPs[Math.floor(Math.random() * internalIPs.length)]}${Math.floor(Math.random() * 255)}`
    : null;
  
  const port = Math.random() > 0.5 ? Math.floor(Math.random() * 65535) : undefined;
  const protocol = Math.random() > 0.5 ? protocols[Math.floor(Math.random() * protocols.length)] : undefined;
  
  const logEntry: Partial<LogEntry> = {
    level,
    source,
    message,
    sourceIp,
    destinationIp,
    port,
    protocol,
    eventType,
    severity: Math.floor(Math.random() * 10) + 1,
    tags: ['automated', 'mock-data'],
    timestamp
  };

  const threatAnalysis = analyzeLogForThreats(logEntry);
  const id = generateLogId();
  
  return {
    id,
    timestamp,
    level,
    source,
    destination: logEntry.destinationIp || undefined,
    message,
    sourceIp,
    destinationIp,
    port,
    protocol,
    eventType,
    severity: logEntry.severity!,
    tags: logEntry.tags!,
    rawLog: `[${timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`,
    threatLevel: threatAnalysis.threatLevel,
    mitreAttack: threatAnalysis.mitreAttack
  };
}

// Generate multiple mock log entries
export function generateMockLogs(count: number = 100): LogEntry[] {
  const logs: LogEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    logs.push(generateMockLogEntry());
  }
  
  // Sort by timestamp (newest first)
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate a real-time log entry (for WebSocket simulation)
export function generateRealTimeLogEntry(): LogEntry {
  const log = generateMockLogEntry();
  // Make it more recent
  log.timestamp = new Date();
  return log;
}

// Validate mock user credentials
export function validateCredentials(username: string, password: string) {
  const user = Object.values(mockUsers).find(u => u.username === username);
  return user && user.password === password ? user : null;
}

// Get mock user by ID
export function getMockUserById(id: string) {
  return Object.values(mockUsers).find(u => u.id === id) || null;
}