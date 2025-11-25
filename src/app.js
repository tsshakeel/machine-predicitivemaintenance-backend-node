import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import machinetimedownRouter from "./routes/machinetimedown.js";
import { swaggerSpec, swaggerUiMiddleware } from "./swagger.js";
import { AlertService } from "./services/AlertService.js";
import logger from "./utils/logger.js";
import 'dotenv/config';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const app = express();

// Create HTTP server and Socket.io instance FIRST
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = parseInt(process.env.PORT) || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger Docs
app.use("/api-docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

// CRUD Routes (/data prefix)
app.use("/data", machinetimedownRouter);

// Health Check
app.get("/health", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

// Improved singleton for AlertService (Nodemon-safe)
let alertService;
if (!global._alertServiceInitialized) {
  global._alertServiceInitialized = true;
  alertService = new AlertService();
  alertService.subscribeToRealtime(io);
  logger.info('AlertService initialized once');
} else {
  alertService = global._alertServiceInitialized ? new AlertService() : null;  // Reuse or recreate safely
  if (alertService && io) alertService.subscribeToRealtime(io);
}

// Socket.io Events
io.on("connection", (socket) => {
  logger.info("Client connected");
  socket.on("error", (err) => logger.error("Socket error:", err));
  socket.on("disconnect", () => logger.info("Client disconnected"));
});

// Graceful listen with retry
function startServer(port) {
  server.listen(port, () => {
    logger.info(`Server running → http://localhost:${port}`);
    logger.info(`Swagger → http://localhost:${port}/api-docs`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} in use. Retrying on ${port + 1}...`);
      startServer(port + 1);
    } else {
      logger.error('Server listen failed:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);