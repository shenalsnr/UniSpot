import express from "express";
import {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  addOrUpdateVehicle,
  removeVehicle,
  requestPasswordOtp,
  resetPasswordWithOtp,
  getStudentByQr,
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", upload.single("photo"), registerStudent);
router.post("/login", loginStudent);
router.post("/request-password-otp", requestPasswordOtp);
router.post("/reset-password-with-otp", resetPasswordWithOtp);
router.get("/qr/:studentId", getStudentByQr);

// Protected routes
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, upload.single("photo"), updateStudentProfile);
router.put("/vehicle", protect, addOrUpdateVehicle);
router.delete("/vehicle", protect, removeVehicle);

export default router;