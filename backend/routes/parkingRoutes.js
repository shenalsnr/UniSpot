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
  securityScanQR
} from "../controllers/parkingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base routes: /api/parking
router.route("/")
  .get(getParkingSpots)
  .post(createParkingSpot);

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

// Route to reserve a specific parking spot
router.route("/:id/reserve")
  .put(reserveParkingSpot);

// Route to release a specific parking spot
router.route("/:id/release")
  .put(releaseParkingSpot);

// Route to cancel a specific parking spot booking (student side)
router.route("/:id/cancel")
  .put(cancelParkingSpot);

// Route to toggle maintenance status for a specific spot
router.route("/:id/maintain")
  .put(toggleMaintenance);

// Route to get, update and delete a specific parking spot
router.route("/:id")
  .get(getParkingSpotById)
  .put(updateParkingSpot)
  .delete(deleteParkingSpot);

export default router;
