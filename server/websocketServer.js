let WebSocketServer = null;
try {
  ({ WebSocketServer } = require('ws'));
} catch {
  WebSocketServer = null;
}
const { handleTwilioStreamConnection } = require('./twilioStreamHandler');

function initWebSocketServer(httpServer) {
  if (!WebSocketServer) {
    console.warn('`ws` is not installed. WebSocket media streaming is disabled.');
    return null;
  }

  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    handleTwilioStreamConnection(ws, req);
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error.message);
  });

  return wss;
}

module.exports = initWebSocketServer;
