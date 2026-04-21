import express from "express";
import {
  adminLogin,
  getAllStudents,
  getStudentDetailsById,
  blockStudent,
  unblockStudent,
  resetStudentMarks,
  restoreParkingPoints,
  resetParkingPoints,
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/students", protectAdmin, getAllStudents);
router.get("/students/:id", protectAdmin, getStudentDetailsById);
router.put("/students/block/:id", protectAdmin, blockStudent);
router.put("/students/unblock/:id", protectAdmin, unblockStudent);
router.put("/students/reset-marks/:id", protectAdmin, resetStudentMarks);

// Parking points management
router.put("/students/restore-points/:id", protectAdmin, restoreParkingPoints);
router.put("/students/reset-points/:id", protectAdmin, resetParkingPoints);

export default router;