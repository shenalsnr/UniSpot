import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { applyMiddleware } from "./middleware/appMiddleware.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { applyErrorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middleware
applyMiddleware(app);

// Routes
app.use("/api/locker", lockerRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/students", studentRoutes);

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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
