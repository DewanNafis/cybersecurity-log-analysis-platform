const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173; // Default Vite dev server port

const getBackendBaseUrl = () => {
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
// Add /ws path to the WebSocket URL to match the server configuration
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + '/ws';