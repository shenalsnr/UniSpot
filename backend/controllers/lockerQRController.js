import {
  findStudent,
  getStudentLocker,
  assignLocker,
  releaseLocker,
  getAllLockers,
  getActiveLockers,
  createLocker
} from "../services/lockerQRService.js";

/**
 * LockerQR Controller — student-ID-based locker management endpoints.
 */

// POST /api/locker-qr/assign — assign locker using studentId
export const handleAssignLocker = async (req, res, next) => {
  try {
    const { studentId, durationHours } = req.body;

    if (!studentId?.trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const result = await assignLocker(studentId, durationHours || 4);

    res.json({
      message: `Locker ${result.locker.lockerNumber} assigned to ${result.student.name}`,
      student: result.student,
      locker: result.locker
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("blocked") ||
      error.message.includes("already has") ||
      error.message.includes("No lockers available")
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// GET /api/locker-qr/student/:studentId — get locker details for a student
export const handleGetStudentLocker = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId?.trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const result = await getStudentLocker(studentId);

    if (!result.found) {
      return res.status(404).json({ message: "Student not found in the system" });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// PUT /api/locker-qr/release/:studentId — release locker
export const handleReleaseLocker = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId?.trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const locker = await releaseLocker(studentId);

    res.json({
      message: `Locker ${locker.lockerNumber} released successfully`,
      locker
    });
  } catch (error) {
    if (error.message.includes("No locker found")) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// GET /api/locker-qr/all — get all lockers overview
export const handleGetAllLockers = async (req, res, next) => {
  try {
    const lockers = await getAllLockers();
    res.json({ lockers });
  } catch (error) {
    next(error);
  }
};

// GET /api/locker-qr/active — get only currently booked lockers
export const handleGetActiveLockers = async (req, res, next) => {
  try {
    const lockers = await getActiveLockers();
    res.json({ lockers });
  } catch (error) {
    next(error);
  }
};

// POST /api/locker-qr/create — add a new locker to the pool
export const handleCreateLocker = async (req, res, next) => {
  try {
    const { lockerNumber, location } = req.body;

    if (!lockerNumber?.trim()) {
      return res.status(400).json({ message: "Locker number is required" });
    }

    const locker = await createLocker(lockerNumber.trim(), location?.trim());

    res.status(201).json({
      message: `Locker "${locker.lockerNumber}" added to pool`,
      locker
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};
