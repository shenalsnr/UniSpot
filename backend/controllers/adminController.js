import Student from "../models/Student.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Student.findOne({ email: email.toLowerCase(), role: "admin" });

    if (!admin) {
      return res.status(400).json({ message: "Invalid admin email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin email or password" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students only
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one student by id
const getStudentDetailsById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block student (admin-manual block, separate from penalty-based block)
const blockStudent = async (req, res) => {
  try {
    const { blockReason } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = "blocked";
    student.blockReason = blockReason || "Blocked by admin";

    await student.save();

    res.json({ message: "Student blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock student (manual override — does NOT restore points)
const unblockStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = "active";
    student.blockReason = "";

    await student.save();

    res.json({ message: "Student unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Restore Parking Points
 *
 * PUT /api/admin/students/restore-points/:id
 * Body: { points: number }  — positive integer, 1–10
 *
 * Rules:
 * - Adds the given points to the student's current marks (capped at 10)
 * - If resulting points > 0, student status becomes 'active' automatically
 * - Sends a notification to the student
 */
const restoreParkingPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const restoreAmount = parseInt(points, 10);

    if (!restoreAmount || restoreAmount < 1 || restoreAmount > 10) {
      return res.status(400).json({ message: "Restore amount must be between 1 and 10" });
    }

    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const currentPoints = student.marks ?? 0;
    const newPoints = Math.min(10, currentPoints + restoreAmount);
    const wasBlocked = student.status === "blocked";

    student.marks = newPoints;

    // Auto-unblock if points are now above 0
    if (newPoints > 0 && student.status === "blocked") {
      student.status = "active";
      student.blockReason = "";
    }

    await student.save();

    // Notify student about point restoration
    try {
      await Notification.create({
        userId: student.studentId,
        title: "Parking Points Restored 🎉",
        message: `${restoreAmount} parking point${restoreAmount > 1 ? "s" : ""} have been restored by administration. Your current parking points: ${newPoints}/10.${wasBlocked && newPoints > 0 ? " Your parking access has been reinstated." : ""}`,
        type: "penalty_applied", // reuse as point-change notification
        metadata: {
          action: "restore",
          pointsRestored: restoreAmount,
          previousPoints: currentPoints,
          newPoints,
          autoUnblocked: wasBlocked && newPoints > 0,
        },
      });
    } catch (notifErr) {
      console.error("[Notification] Failed to notify student of point restore:", notifErr.message);
    }

    res.json({
      message: `Restored ${restoreAmount} point${restoreAmount > 1 ? "s" : ""}. Parking points: ${newPoints}/10.${wasBlocked && newPoints > 0 ? " Student has been automatically unblocked." : ""}`,
      parkingPoints: newPoints,
      studentStatus: student.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reset Parking Points to Full (10)
 *
 * PUT /api/admin/students/reset-points/:id
 *
 * Always resets to 10, always unblocks if blocked.
 */
const resetParkingPoints = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const wasBlocked = student.status === "blocked";
    const previousPoints = student.marks ?? 0;

    student.marks = 10;
    student.status = "active";
    student.blockReason = "";

    await student.save();

    // Notify student
    try {
      await Notification.create({
        userId: student.studentId,
        title: "Parking Points Reset ✅",
        message: `Your parking points have been fully reset to 10/10 by administration.${wasBlocked ? " Your parking access has been reinstated." : ""}`,
        type: "penalty_applied",
        metadata: {
          action: "reset",
          previousPoints,
          newPoints: 10,
          autoUnblocked: wasBlocked,
        },
      });
    } catch (notifErr) {
      console.error("[Notification] Failed to notify student of points reset:", notifErr.message);
    }

    res.json({
      message: `Parking points reset to 10/10.${wasBlocked ? " Student has been unblocked." : ""}`,
      parkingPoints: 10,
      studentStatus: "active",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Legacy: kept for backward compatibility but now just calls resetParkingPoints logic
const resetStudentMarks = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.marks = 10;
    student.status = "active";
    student.blockReason = "";
    await student.save();

    res.json({ message: "Student marks reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  adminLogin,
  getAllStudents,
  getStudentDetailsById,
  blockStudent,
  unblockStudent,
  resetStudentMarks,
  restoreParkingPoints,
  resetParkingPoints,
};