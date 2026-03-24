import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { applyMiddleware } from "./middleware/appMiddleware.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import { applyErrorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middleware
applyMiddleware(app);

// Routes
app.use("/", lockerRoutes);
app.use("/api/parking", parkingRoutes);

// Simple Route
app.get("/", (req, res) => {
  res.send("API is running...");
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
