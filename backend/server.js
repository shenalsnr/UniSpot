import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { applyMiddleware } from "./middleware/appMiddleware.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import lockerMaintenanceRoutes from "./routes/lockerMaintenanceRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { applyErrorMiddleware } from "./middleware/errorMiddleware.js";
import { startLockerCleanupJob } from "./services/lockerCleanupService.js";

// Import models to ensure they're registered with mongoose
import Student from "./models/Student.js";
import ParkingSpot from "./models/ParkingSpot.js";
import SecurityStaff from "./models/SecurityStaff.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
applyMiddleware(app);

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/locker", lockerRoutes);
app.use("/api/lockers", lockerMaintenanceRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

// Simple Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

// Error Handling Middleware
applyErrorMiddleware(app);

// Connect Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start background services
  startLockerCleanupJob();
});