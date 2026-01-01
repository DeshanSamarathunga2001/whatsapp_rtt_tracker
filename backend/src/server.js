const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const trackingRouter = require("./routes/tracking.routes");
const { setupWebSocket } = require("./websocket/socketHandler");

const app = express();
const server = http.createServer(app);

/* ---------------- Middleware ---------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- Routes ---------------- */
app.use("/api/tracking", trackingRouter);

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ---------------- WebSocket ---------------- */
setupWebSocket(server);

/* ---------------- Start Server ---------------- */
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("WebSocket server is set up");
});
