import express from "express";
import {
  getParkingSpots,
  getParkingSpotById,
  createParkingSpot,
  reserveParkingSpot,
  releaseParkingSpot,
  deleteParkingSpot
} from "../controllers/parkingController.js";

const router = express.Router();

// Base routes: /api/parking
router.route("/")
  .get(getParkingSpots)
  .post(createParkingSpot);

// Route to reserve a specific parking spot
router.route("/:id/reserve")
  .put(reserveParkingSpot);

// Route to release a specific parking spot
router.route("/:id/release")
  .put(releaseParkingSpot);

// Route to get and delete a specific parking spot
router.route("/:id")
  .get(getParkingSpotById)
  .delete(deleteParkingSpot);

export default router;
