const express = require("express");
const cors = require("cors");
const http = require("http");
const websocket = require("ws");
require("dotenv").config();

//const trackingRouter = require("./routes/tracking.routes");
//const { setupWebSocket } = require("./websocket");

const app = express();
const server = http.createServer(app);
const wss = new websocket.Server({ server });

//middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

//Routes
//app.use("/api/tracking", trackingRouter);

//Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

//setupWebSocket(wss);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('WebSocket server is set up');        
});