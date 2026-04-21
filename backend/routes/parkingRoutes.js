import express from "express";
import {
  getParkingSpots,
  getParkingSpotById,
  createParkingSpot,
  reserveParkingSpot,
  releaseParkingSpot,
  deleteParkingSpot,
  updateParkingSpot,
  getMyActiveBooking,
  getActiveBookingByStudent,
  cancelParkingSpot,
  toggleMaintenance,
  securityScanQR,
  getNextSlotNumber,
  getSlotBookings,
  getWaitingBookings,
  reassignWaitingBooking,
} from "../controllers/parkingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base routes: /api/parking
router.route("/")
  .get(getParkingSpots)
  .post(createParkingSpot);

router.route("/next-slot-number")
  .get(getNextSlotNumber);

// Route to get strictly active booking of the currently authenticated student
router.route("/my-active")
  .get(protect, getMyActiveBooking);

// Route to get active booking by student ID
router.route("/my-booking/:studentId")
  .get(getActiveBookingByStudent);

// Security QR scan endpoint — handles both ARRIVAL and DEPARTURE scans
// Open (no JWT) matching existing security portal pattern
router.route("/security/scan-qr")
  .post(securityScanQR);

// Waiting queue — all booking in waiting_for_slot status
router.route("/waiting")
  .get(getWaitingBookings);

// Route to reserve a specific parking spot
router.route("/:id/reserve")
  .put(reserveParkingSpot);

// Route to release a specific parking spot (admin force-release)
router.route("/:id/release")
  .put(releaseParkingSpot);

// Route to cancel a specific booking (student side)
router.route("/:id/cancel")
  .put(cancelParkingSpot);

// Route to toggle maintenance status for a specific spot
router.route("/:id/maintain")
  .put(toggleMaintenance);

// Security: manually reassign a waiting_for_slot booking to a new slot
router.route("/:id/reassign")
  .put(reassignWaitingBooking);

// Route to get all active bookings (time blocks) for a slot on a given date
// GET /api/parking/:id/bookings?date=YYYY-MM-DD
router.route("/:id/bookings")
  .get(getSlotBookings);

// Route to get, update and delete a specific parking spot
router.route("/:id")
  .get(getParkingSpotById)
  .put(updateParkingSpot)
  .delete(deleteParkingSpot);

export default router;
