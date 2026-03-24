import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { applyMiddleware } from "./middleware/appMiddleware.js";
import { applyErrorMiddleware } from "./middleware/errorMiddleware.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
applyMiddleware(app);

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Only your student routes for now
app.use("/api/students", studentRoutes);

// Error middleware
applyErrorMiddleware(app);

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB Connection Error:", err.message));