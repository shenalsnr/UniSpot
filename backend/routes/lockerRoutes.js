import express from "express";
import {
  createMap,
  getMaps,
  updateMap,
  deleteMap,
  createBooking,
  getBookingsByMap,
  deleteBooking,
  getStudentCurrentBooking,
  getAllBookings,
  getStudentBookings,
  deleteBookingById
} from "../controllers/LockerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// MAP ROUTES (Admin only - no auth middleware for now)
router.post("/create-map", createMap);
router.get("/maps", getMaps);
router.put("/update-map/:id", updateMap);
router.delete("/delete-map/:id", deleteMap);

//  BOOKING ROUTES (Student authentication required)
router.post("/bookings", protect, createBooking);
router.get("/bookings/map/:mapId", getBookingsByMap);
router.get("/bookings/student/current", protect, getStudentCurrentBooking);
router.get("/bookings/student/my-bookings", protect, getStudentBookings);
router.get("/bookings/all", getAllBookings);
router.delete("/bookings/map/:mapId/locker/:lockerId", protect, deleteBooking);
router.delete("/bookings/:id", protect, deleteBookingById);

export default router;