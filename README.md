# CyberGuard - Cybersecurity Log Analysis Platform

A comprehensive web-based platform for monitoring, analyzing, and managing cybersecurity logs with real-time threat detection and AI-powered analysis capabilities.

## 🚀 Project Overview

CyberGuard is a modern cybersecurity dashboard that helps organizations monitor their security infrastructure by collecting, analyzing, and visualizing security logs from various sources. The platform provides real-time threat detection, comprehensive reporting, and an intuitive interface for security analysts.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Multi-role user system (Admin, Analyst, Viewer)
- Secure JWT-based authentication
- Role-based access control with different permission levels

### 📊 Interactive Dashboard
- Real-time log activity monitoring
- Threat level distribution charts
- Top log sources visualization
- System health indicators
- Live statistics and metrics

### 🔍 Advanced Log Analysis
- Powerful search and filtering capabilities
- Date range filtering
- Log level categorization (Info, Warning, Error, Critical)
- Source IP filtering
- Detailed log inspection with modal views
- Export functionality (CSV format)

### 🛡️ Intelligent Threat Detection
- AI-powered threat classification
- MITRE ATT&CK framework integration
- Severity-based threat categorization
- Real-time threat alerts
- Automated threat analysis with recommended actions

### 📈 Comprehensive Reporting
- Executive summary reports
- Detailed technical analysis
- Threat intelligence reports
- Scheduled report generation
- Multiple export formats

### ⚙️ System Configuration
- General settings (log retention, refresh intervals)
- Alert configuration (email, Slack integration)
- Security settings (session timeout, MFA)
- AI integration settings
- User management interface

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization library
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation utilities

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **WebSocket (ws)** - Real-time communication
- **SQLite (@libsql/client)** - Lightweight database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **Node-cron** - Task scheduling

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Authentication│    │ • Users         │
│ • Log Analysis  │    │ • Log Management│    │ • Logs          │
│ • Threat Det.   │    │ • Threat Intel  │    │ • Threats       │
│ • Reports       │    │ • WebSocket     │    │ • Settings      │
│ • Settings      │    │ • Real-time     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
cybersecurity-log-analysis-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Layout.tsx      # Main application layout
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   ├── LogContext.tsx  # Log data management
│   │   └── WebSocketContext.tsx # Real-time updates
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.tsx   # Overview dashboard
│   │   ├── LogAnalysis.tsx # Log search and analysis
│   │   ├── ThreatDetection.tsx # Threat monitoring
│   │   ├── Reports.tsx     # Report generation
│   │   ├── Settings.tsx    # System configuration
│   │   └── Login.tsx       # Authentication page
│   ├── utils/              # Utility functions
│   │   └── mockData.ts     # Sample data generation
│   ├── config.ts           # Application configuration
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── server/
│   └── index.js            # Express server with API endpoints
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cybersecurity-log-analysis-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Default Login Credentials
- **Username:** admin
- **Password:** password
- **Role:** Administrator (full access)

## 🔧 Configuration

### Environment Variables
The application uses dynamic configuration based on the deployment environment. No manual environment setup is required for development.

### Database
The application uses SQLite for data storage with the following tables:
- `users` - User accounts and roles
- `logs` - Security log entries
- `threat_intelligence` - Threat analysis data
- `settings` - Application configuration

## 📊 Features in Detail

### Real-time Monitoring
- WebSocket connection for live log updates
- Automatic threat detection and alerts
- Real-time dashboard statistics

### AI-Powered Analysis
- Simulated AI threat detection algorithms
- MITRE ATT&CK framework integration
- Automated threat classification and scoring

### Comprehensive Filtering
- Date range selection
- Log level filtering
- Source-based filtering
- IP address filtering
- Full-text search capabilities

### Export and Reporting
- CSV export for log data
- PDF report generation
- Scheduled report delivery
- Multiple report formats (Executive, Technical, Threat Intelligence)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Security headers with Helmet
- Role-based access control
- Session timeout management

## 🧪 Sample Data

The application includes a comprehensive mock data generator that creates:
- Realistic log entries with various severity levels
- Simulated threat scenarios
- Multiple log sources (firewall, web server, database, etc.)
- MITRE ATT&CK tactic mappings
- User accounts with different roles

## 🚀 Deployment

### Development
```bash
npm run dev    # Start frontend
npm run server # Start backend
```

### Production Build
```bash
npm run build  # Build frontend for production
npm run preview # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Examine the mock data generators for examples

## 🔮 Future Enhancements

- Integration with real SIEM systems
- Machine learning-based anomaly detection
- Advanced visualization options
- Mobile application support
- Multi-tenant architecture
- Integration with external threat intelligence feeds

---
