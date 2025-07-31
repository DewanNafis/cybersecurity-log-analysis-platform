import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Create WebSocket server with a specific path to avoid conflicts
const wss = new WebSocketServer({ 
  noServer: true // Changed to noServer to handle upgrade manually
});

// Database setup using libsql (compatible with WebContainer)
const db = createClient({
  url: 'file:cybersecurity.db'
});

// Initialize database tables
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    level TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT,
    message TEXT NOT NULL,
    source_ip TEXT NOT NULL,
    destination_ip TEXT,
    port INTEGER,
    protocol TEXT,
    event_type TEXT NOT NULL,
    severity INTEGER NOT NULL DEFAULT 1,
    tags TEXT,
    raw_log TEXT NOT NULL,
    threat_level TEXT,
    mitre_attack TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS threat_intelligence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    confidence REAL NOT NULL,
    description TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES logs (id)
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create default admin user if not exists
try {
  // First, clear any existing admin user to ensure clean state
  await db.execute({
    sql: 'DELETE FROM users WHERE username = ?',
    args: ['admin']
  });
  
  // Create fresh admin user with known password
  const hashedPassword = bcrypt.hashSync('password', 10);
  const result = await db.execute({
    sql: `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    args: ['admin', 'admin@company.com', hashedPassword, 'admin']
  });
  
  console.log('✅ Default admin user created successfully');
  console.log('   Username: admin');
  console.log('   Password: password');
  console.log('   User ID:', result.lastInsertRowid);
  
  // Verify the user was created
  const createdUser = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: ['admin']
  });
  
  if (createdUser.rows.length > 0) {
    const user = createdUser.rows[0];
    console.log('✅ User verification:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });
  }
  
} catch (error) {
  console.error('❌ Error creating admin user:', error);
}

// Middleware - Order is critical here
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity-platform-secret-key-2024';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create API router to group all API routes
const apiRouter = express.Router();

// Apply rate limiting to API routes
apiRouter.use(limiter);

// API Routes
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Login attempt:', { 
    username, 
    passwordProvided: !!password,
    passwordLength: password ? password.length : 0
  });

  if (!username || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      hasStoredPassword: !!user.password,
      storedPasswordLength: user.password ? user.password.length : 0
    });

    // Test password comparison
    console.log('🔍 Testing password comparison...');
    console.log('   Provided password:', password);
    console.log('   Stored hash length:', user.password.length);
    
    const passwordMatch = bcrypt.compareSync(password, user.password);
    console.log('   Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.log('❌ Password mismatch for user:', username);
      
      // Additional debugging - try creating a new hash with the same password
      const testHash = bcrypt.hashSync(password, 10);
      const testMatch = bcrypt.compareSync(password, testHash);
      console.log('   Test hash comparison (should be true):', testMatch);
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.execute({
      sql: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      args: [user.id]
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for user:', username);
    console.log('   Generated token length:', token.length);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: getUserPermissions(user.role)
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.get('/auth/validate', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, username, email, role FROM users WHERE id = ?',
      args: [req.user.id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: getUserPermissions(user.role)
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.get('/logs', authenticateToken, async (req, res) => {
  try {
    console.log('📊 API /api/logs called');
    const { limit = 1000, offset = 0 } = req.query;
    
    const logsResult = await db.execute({
      sql: `SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)]
    });

    const totalResult = await db.execute('SELECT COUNT(*) as count FROM logs');
    const total = totalResult.rows[0].count;

    // Convert database format to frontend format
    const formattedLogs = logsResult.rows.map(log => ({
      id: log.id,
      timestamp: new Date(log.timestamp),
      level: log.level,
      source: log.source,
      destination: log.destination,
      message: log.message,
      sourceIp: log.source_ip,
      destinationIp: log.destination_ip,
      port: log.port,
      protocol: log.protocol,
      eventType: log.event_type,
      severity: log.severity,
      tags: log.tags ? JSON.parse(log.tags) : [],
      rawLog: log.raw_log,
      threatLevel: log.threat_level,
      mitreAttack: log.mitre_attack ? JSON.parse(log.mitre_attack) : []
    }));

    console.log(`✅ Returning ${formattedLogs.length} logs out of ${total} total`);
    res.json({
      logs: formattedLogs,
      total
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/logs/ingest', authenticateToken, async (req, res) => {
  try {
    const logEntry = req.body;
    
    // Generate unique ID
    const id = generateLogId();
    
    // Analyze log for threats using AI (simulated)
    const threatAnalysis = analyzeLogForThreats(logEntry);
    
    // Insert log into database
    await db.execute({
      sql: `
        INSERT INTO logs (
          id, timestamp, level, source, destination, message,
          source_ip, destination_ip, port, protocol, event_type,
          severity, tags, raw_log, threat_level, mitre_attack
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        logEntry.timestamp || new Date().toISOString(),
        logEntry.level,
        logEntry.source,
        logEntry.destination,
        logEntry.message,
        logEntry.sourceIp,
        logEntry.destinationIp,
        logEntry.port,
        logEntry.protocol,
        logEntry.eventType,
        logEntry.severity || 1,
        JSON.stringify(logEntry.tags || []),
        logEntry.rawLog || logEntry.message,
        threatAnalysis.threatLevel,
        JSON.stringify(threatAnalysis.mitreAttack || [])
      ]
    });

    // Broadcast to connected clients
    const formattedLog = {
      id,
      timestamp: new Date(logEntry.timestamp || new Date()),
      level: logEntry.level,
      source: logEntry.source,
      message: logEntry.message,
      sourceIp: logEntry.sourceIp,
      destinationIp: logEntry.destinationIp,
      eventType: logEntry.eventType,
      severity: logEntry.severity || 1,
      tags: logEntry.tags || [],
      rawLog: logEntry.rawLog || logEntry.message,
      threatLevel: threatAnalysis.threatLevel,
      mitreAttack: threatAnalysis.mitreAttack || []
    };

    broadcast({
      type: 'new_log',
      log: formattedLog
    });

    if (threatAnalysis.threatLevel && ['medium', 'high', 'critical'].includes(threatAnalysis.threatLevel)) {
      broadcast({
        type: 'threat_detected',
        threat: formattedLog
      });
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error('Error ingesting log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoints
apiRouter.get('/debug/users', async (req, res) => {
  try {
    const result = await db.execute('SELECT id, username, email, role, created_at FROM users');
    console.log('📋 Current users in database:', result.rows);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/debug/test-password', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    
    if (result.rows.length === 0) {
      return res.json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const match = bcrypt.compareSync(password, user.password);
    const newHash = bcrypt.hashSync(password, 10);
    const newMatch = bcrypt.compareSync(password, newHash);
    
    res.json({
      username: user.username,
      providedPassword: password,
      storedHashLength: user.password.length,
      passwordMatch: match,
      testHashMatch: newMatch,
      bcryptWorking: newMatch
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'cybersecurity-platform'
  });
});

// Mount API router - this MUST come before static file serving
app.use('/api', apiRouter);

// Static file serving
app.use(express.static(path.join(__dirname, '../dist')));

// Handle client-side routing - serve index.html for all non-API routes
// This MUST be the last route defined
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes and non-WebSocket routes
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/ws')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Handle WebSocket upgrade requests manually
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// WebSocket handling
wss.on('connection', (ws, req) => {
  console.log('🔌 Client connected to WebSocket from:', req.socket.remoteAddress);
  
  // Send a welcome message to confirm connection
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'WebSocket connection successful',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 Received WebSocket message:', data);
      
      // Echo back for testing
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log('🔌 Client disconnected from WebSocket:', { code, reason: reason.toString() });
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

wss.on('error', (error) => {
  console.error('❌ WebSocket Server error:', error);
});

function broadcast(data) {
  const message = JSON.stringify(data);
  let successCount = 0;
  let errorCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message);
        successCount++;
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        errorCount++;
      }
    }
  });
  
  if (successCount > 0 || errorCount > 0) {
    console.log(`📡 Broadcast sent to ${successCount} clients, ${errorCount} errors`);
  }
}

// Utility functions
function getUserPermissions(role) {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'configure'],
    analyst: ['read', 'write', 'analyze'],
    viewer: ['read']
  };
  return permissions[role] || permissions.viewer;
}

function generateLogId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function analyzeLogForThreats(logEntry) {
  // Simulated AI threat analysis
  const message = logEntry.message.toLowerCase();
  const sourceIp = logEntry.sourceIp;
  
  let threatLevel = null;
  let mitreAttack = [];
  
  // Simple rule-based threat detection (in real implementation, this would use AI)
  if (message.includes('failed login') || message.includes('authentication failed')) {
    threatLevel = 'medium';
    mitreAttack = ['T1110']; // Brute Force
  } else if (message.includes('sql injection') || message.includes('xss')) {
    threatLevel = 'high';
    mitreAttack = ['T1190']; // Exploit Public-Facing Application
  } else if (message.includes('malware') || message.includes('virus')) {
    threatLevel = 'critical';
    mitreAttack = ['T1055']; // Process Injection
  } else if (message.includes('suspicious') || message.includes('anomaly')) {
    threatLevel = 'low';
  }
  
  // Check for suspicious IPs (simplified)
  if (sourceIp && (sourceIp.startsWith('10.0.0.') || sourceIp.includes('192.168.'))) {
    // Internal IP, lower threat
  } else if (sourceIp && Math.random() > 0.8) {
    // Random external IP threat simulation
    threatLevel = threatLevel || 'medium';
  }
  
  return { threatLevel, mitreAttack };
}

// Generate sample data
async function generateSampleLogs() {
  const sources = ['firewall', 'web-server', 'database', 'auth-service', 'proxy'];
  const levels = ['info', 'warning', 'error', 'critical'];
  const eventTypes = ['login', 'request', 'error', 'security', 'system'];
  
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
    'Malware signature detected'
  ];

  for (let i = 0; i < 50; i++) {
    const logEntry = {
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
      destinationIp: Math.random() > 0.5 ? `10.0.0.${Math.floor(Math.random() * 255)}` : null,
      port: Math.random() > 0.5 ? Math.floor(Math.random() * 65535) : null,
      protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: Math.floor(Math.random() * 10) + 1,
      tags: ['automated', 'sample'],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    };

    const id = generateLogId();
    const threatAnalysis = analyzeLogForThreats(logEntry);

    await db.execute({
      sql: `
        INSERT INTO logs (
          id, timestamp, level, source, destination, message,
          source_ip, destination_ip, port, protocol, event_type,
          severity, tags, raw_log, threat_level, mitre_attack
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        logEntry.timestamp,
        logEntry.level,
        logEntry.source,
        logEntry.destination,
        logEntry.message,
        logEntry.sourceIp,
        logEntry.destinationIp,
        logEntry.port,
        logEntry.protocol,
        logEntry.eventType,
        logEntry.severity,
        JSON.stringify(logEntry.tags),
        `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`,
        threatAnalysis.threatLevel,
        JSON.stringify(threatAnalysis.mitreAttack)
      ]
    });
  }
}

// Generate sample data on startup
const logCountResult = await db.execute('SELECT COUNT(*) as count FROM logs');
const logCount = logCountResult.rows[0].count;
if (logCount === 0) {
  console.log('📊 Generating sample log data...');
  await generateSampleLogs();
  console.log('✅ Sample data generated');
}

// Cleanup old logs (runs daily at midnight)
cron.schedule('0 0 * * *', async () => {
  const retentionDays = 90; // Default retention period
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  
  const result = await db.execute({
    sql: 'DELETE FROM logs WHERE timestamp < ?',
    args: [cutoffDate]
  });
  console.log(`🧹 Cleaned up ${result.rowsAffected} old log entries`);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Cybersecurity Platform server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔐 Demo credentials: admin / password`);
  console.log(`🔌 WebSocket server listening on /ws path`);
  console.log(`🐛 Debug endpoints available at /api/debug/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});