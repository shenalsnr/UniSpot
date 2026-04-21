import express from "express";
import {
  handleAssignLocker,
  handleGetStudentLocker,
  handleReleaseLocker,
  handleGetAllLockers,
  handleGetActiveLockers,
  handleCreateLocker
} from "../controllers/lockerQRController.js";

const router = express.Router();

// Assign locker to a student
router.post("/assign", handleAssignLocker);

// Get locker details for a student
router.get("/student/:studentId", handleGetStudentLocker);

// Release a student's locker
router.put("/release/:studentId", handleReleaseLocker);

// Get all lockers overview
router.get("/all", handleGetAllLockers);

// Get only currently booked/active lockers
router.get("/active", handleGetActiveLockers);

// Add a new locker to the pool
router.post("/create", handleCreateLocker);

export default router;
