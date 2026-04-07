import express from "express";
import {
  getMyNotifications,
  markOneRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes require authentication
// GET /api/notifications/ — get all notifications for logged-in student
router.route("/").get(protect, getMyNotifications);

// PUT /api/notifications/mark-all-read — mark all as read
// IMPORTANT: This must be defined BEFORE /:id/read to avoid route conflicts
router.route("/mark-all-read").put(protect, markAllRead);

// PUT /api/notifications/:id/read — mark single notification as read
router.route("/:id/read").put(protect, markOneRead);

export default router;
