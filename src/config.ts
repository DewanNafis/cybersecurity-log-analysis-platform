const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173; // Default Vite dev server port

const getBackendBaseUrl = () => {
  // Prefer explicit env var (cloud deployments)
  // Example: VITE_API_BASE_URL=https://your-backend.onrender.com
  const configured = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (configured && configured.trim().length > 0) {
    return configured.replace(/\/+$/, '');
  }

  const currentProtocol = window.location.protocol;
  const currentHostname = window.location.hostname;

  // In a webcontainer, the hostname often includes the port (e.g., <some-id>-5173.webcontainer.io).
  // We want to connect to the corresponding backend port (e.g., <some-id>-3001.webcontainer.io).
  if (currentHostname.includes(`-${FRONTEND_PORT}`)) {
    const backendHostname = currentHostname.replace(`-${FRONTEND_PORT}`, `-${BACKEND_PORT}`);
    return `${currentProtocol}//${backendHostname}`;
  } else {
    // Fallback for local development (localhost)
    return `${currentProtocol}//${currentHostname}:${BACKEND_PORT}`;
  }
};

export const API_BASE_URL = getBackendBaseUrl();

const getWebSocketBaseUrl = () => {
  const configuredWs = (import.meta as any).env?.VITE_WS_BASE_URL as string | undefined;
  if (configuredWs && configuredWs.trim().length > 0) {
    return configuredWs.replace(/\/+$/, '');
  }
  // Add /ws path to the WebSocket URL to match the server configuration
  return API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
};

export const WS_BASE_URL = getWebSocketBaseUrl();