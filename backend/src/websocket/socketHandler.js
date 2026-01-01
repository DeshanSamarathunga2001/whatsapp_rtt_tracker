const WebSocket = require("ws");
const whatsappService = require("../services/whatsappService");
const rttAnalyzer = require("../services/rttAnalyzer");

let wss = null;

/**
 * Create and initialize WebSocket server
 */
function setupWebSocket(httpServer) {
  wss = new WebSocket.Server({ server: httpServer });

  console.log("WebSocket handler initialized");

  wss.on("connection", handleConnection);

  whatsappService.on("rtt-measurement", handleRTTMeasurement);
  whatsappService.on("error", handleWhatsAppError);
}

/* ---------------- Connection Handling ---------------- */

function handleConnection(ws, req) {
  const clientIP = req.socket.remoteAddress;
  console.log(`WebSocket client connected from ${clientIP}`);

  send(ws, {
    type: "connected",
    message: "Connected to RTT tracking server",
    timestamp: new Date().toISOString(),
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleClientMessage(ws, message);
    } catch (error) {
      send(ws, {
        type: "error",
        message: "Invalid message format",
        timestamp: new Date().toISOString(),
      });
    }
  });

  ws.on("close", () => {
    console.log(`WebSocket client disconnected from ${clientIP}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error.message);
  });

  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      send(ws, {
        type: "heartbeat",
        timestamp: new Date().toISOString(),
      });
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
}

/* ---------------- Client Messages ---------------- */

function handleClientMessage(ws, message) {
  const { type } = message;

  switch (type) {
    case "ping":
      send(ws, { type: "pong", timestamp: new Date().toISOString() });
      break;

    case "get-status":
      send(ws, {
        type: "status",
        data: {
          connected: whatsappService.isConnected(),
          activeTargets: whatsappService.getActiveTargets(),
          count: whatsappService.getActiveTargets().length,
        },
      });
      break;

    default:
      console.log("Unknown message type:", type);
  }
}

/* ---------------- WhatsApp Events ---------------- */

function handleRTTMeasurement(measurement) {
  const { phoneNumber, rtt, timestamp, status } = measurement;

  rttAnalyzer.addMeasurement(phoneNumber, rtt, status);

  const analysis = rttAnalyzer.getAnalysis(phoneNumber);

  broadcast({
    type: "rtt-update",
    data: {
      phoneNumber,
      rtt,
      timestamp,
      status,
      analysis,
    },
  });
}

function handleWhatsAppError(error) {
  broadcast({
    type: "error",
    data: error,
    timestamp: new Date().toISOString(),
  });
}

/* ---------------- Utilities ---------------- */

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(message) {
  if (!wss) return;

  const payload = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

function getClientCount() {
  return wss ? wss.clients.size : 0;
}

function closeAll() {
  if (!wss) return;

  wss.clients.forEach((client) => client.close());
}

/* ---------------- Exports ---------------- */

module.exports = {
  setupWebSocket,
  broadcast,
  getClientCount,
  closeAll,
};
