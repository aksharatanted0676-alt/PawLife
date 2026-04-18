import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";
import dietRoutes from "./routes/dietRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

export function createApp() {
  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsPath = path.resolve(__dirname, "../uploads");

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use("/uploads", express.static(uploadsPath));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "OK",
      data: { status: "ok", service: "PawLife AI API" }
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/pets", petRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/push", pushRoutes);
  app.use("/api/diet", dietRoutes);
  app.use("/api/subscribe", subscriptionRoutes);
  app.use("/api/matches", matchRoutes);

  app.use(errorHandler);

  return app;
}
