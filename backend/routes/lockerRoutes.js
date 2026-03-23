import express from "express";
import { createMap, getMaps, updateMap, deleteMap, createBooking, getBookingsByMap, deleteBooking } from "../controllers/LockerController.js";

const router = express.Router();

router.post("/create-map", createMap);
router.get("/maps", getMaps);
router.put("/update-map/:id", updateMap);
router.delete("/delete-map/:id", deleteMap);

router.post("/bookings", createBooking);
router.get("/bookings/map/:mapId", getBookingsByMap);
router.delete("/bookings/map/:mapId/locker/:lockerId", deleteBooking);

export default router;
