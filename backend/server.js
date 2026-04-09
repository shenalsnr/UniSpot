import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { applyMiddleware } from "./middleware/appMiddleware.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import lockerMaintenanceRoutes from "./routes/lockerMaintenanceRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { applyErrorMiddleware } from "./middleware/errorMiddleware.js";
import { startLockerCleanupJob } from "./services/lockerCleanupService.js";
import { startParkingCleanupJob } from "./services/parkingCleanupService.js";
import http from 'http';
import { initSocket } from "./utils/socket.js";

// Import models to ensure they're registered with mongoose
import Student from "./models/Student.js";
import ParkingSpot from "./models/ParkingSpot.js";
import ParkingBooking from "./models/ParkingBooking.js";
import Notification from "./models/Notification.js";
import SecurityStaff from "./models/SecurityStaff.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
initSocket(server); // Initialize Socket.io on the server instance

// Middleware
applyMiddleware(app);


<<<<<<< HEAD
=======
// Static file serving for uploads (Simplified for reliability)
app.use("/uploads", express.static("uploads"));

>>>>>>> 54e3b630204f29cc64c97f39efb0d9a7814c9667
// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use("/api/locker", lockerRoutes);
app.use("/api/lockers", lockerMaintenanceRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);


<<<<<<< HEAD
=======


>>>>>>> 54e3b630204f29cc64c97f39efb0d9a7814c9667
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

<<<<<<< HEAD
=======
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    
    // Start Server only after DB connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Start background services after DB connection
      startLockerCleanupJob();
      startParkingCleanupJob();
    });
  })
  .catch((err) => console.log("MongoDB Connection Error:", err));

>>>>>>> 54e3b630204f29cc64c97f39efb0d9a7814c9667
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

  

