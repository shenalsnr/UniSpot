import LockerStation from "../models/LockerQR/LockerQRModel.js";
import LockerAssignmentLog from "../models/LockerQR/LockerQRBookingModel.js";
import Student from "../models/Student.js";
import { createStudentNotification } from "../utils/notificationHelper.js";

/**
 * LockerQR Service — student-ID-based locker assignment.
 * No QR codes are generated. QR scanner is used only to read student IDs.
 */

// ─── Look up student from existing database ─────────────────────────────────
export const findStudent = async (studentId) => {
  const student = await Student.findOne({
    studentId: studentId.toUpperCase().trim()
  }).select("name studentId faculty email photo phone status").lean();
  return student;
};

// ─── Get locker assignment for a student ─────────────────────────────────────
export const getStudentLocker = async (studentId) => {
  const sid = studentId.toUpperCase().trim();

  // Find student first
  const student = await findStudent(sid);
  if (!student) {
    return { found: false, student: null, locker: null };
  }

  // Auto-expire any past-due assignment
  const now = new Date();
  const expiredLocker = await LockerStation.findOne({
    assignedTo: sid,
    status: "assigned",
    expiresAt: { $lte: now }
  });

  if (expiredLocker) {
    // Fully clean the locker back to available so it's immediately reusable
    expiredLocker.status = "available";
    expiredLocker.assignedTo = null;
    expiredLocker.assignedStudentName = null;
    expiredLocker.assignedStudentFaculty = null;
    expiredLocker.assignedStudentPhone = null;
    expiredLocker.assignedAt = null;
    expiredLocker.expiresAt = null;
    await expiredLocker.save();

    await LockerAssignmentLog.create({
      studentId: sid,
      studentName: student.name,
      lockerNumber: expiredLocker.lockerNumber,
      action: "expired"
    });
  }

  // Check for active assignment
  const activeLocker = await LockerStation.findOne({
    assignedTo: sid,
    status: "assigned"
  }).lean();

  // After auto-expire cleanup above, expired lockers are already set to available,
  // so there won't be any lingering expired assignments for this student

  return {
    found: true,
    student,
    locker: activeLocker || null,
    hasActiveLocker: !!activeLocker
  };
};

// ─── Assign a locker to a student ────────────────────────────────────────────
export const assignLocker = async (studentId, durationHours = 4) => {
  const sid = studentId.toUpperCase().trim();

  const student = await findStudent(sid);
  if (!student) throw new Error("Student not found in the system");
  if (student.status === "blocked") throw new Error("Student account is blocked");

  // Check if student already has an active locker
  const existing = await LockerStation.findOne({
    assignedTo: sid,
    status: "assigned"
  });
  if (existing) {
    throw new Error(`Student already has Locker ${existing.lockerNumber} assigned`);
  }

  // Clear any expired assignments for this student
  await LockerStation.updateMany(
    { assignedTo: sid, status: "expired" },
    { $set: { status: "available", assignedTo: null, assignedStudentName: null, assignedStudentFaculty: null, assignedStudentPhone: null, assignedAt: null, expiresAt: null } }
  );

  // Find first available locker
  const availableLocker = await LockerStation.findOne({ status: "available" }).sort({ lockerNumber: 1 });
  if (!availableLocker) throw new Error("No lockers available at the moment");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  availableLocker.status = "assigned";
  availableLocker.assignedTo = sid;
  availableLocker.assignedStudentName = student.name;
  availableLocker.assignedStudentFaculty = student.faculty;
  availableLocker.assignedStudentPhone = student.phone || null;
  availableLocker.assignedAt = now;
  availableLocker.expiresAt = expiresAt;
  await availableLocker.save();

  // Log the assignment
  await LockerAssignmentLog.create({
    studentId: sid,
    studentName: student.name,
    lockerNumber: availableLocker.lockerNumber,
    action: "assigned"
  });

  // Send QR verification notification to the student
  try {
    await createStudentNotification(
      sid,
      "Locker Booking Verified",
      "Your locker booking has been verified via QR scan.",
      "locker_booking_verified",
      { lockerNumber: availableLocker.lockerNumber, assignedAt: now, expiresAt }
    );
  } catch (notifErr) {
    console.error("❌ Error sending QR verification notification:", notifErr);
  }

  return { student, locker: availableLocker.toObject() };
};

// ─── Release a locker ────────────────────────────────────────────────────────
export const releaseLocker = async (studentId) => {
  const sid = studentId.toUpperCase().trim();

  const locker = await LockerStation.findOne({
    assignedTo: sid,
    status: { $in: ["assigned", "expired"] }
  });

  if (!locker) throw new Error("No locker found for this student");

  const studentName = locker.assignedStudentName || sid;

  locker.status = "available";
  locker.assignedTo = null;
  locker.assignedStudentName = null;
  locker.assignedStudentFaculty = null;
  locker.assignedStudentPhone = null;
  locker.assignedAt = null;
  locker.expiresAt = null;
  await locker.save();

  await LockerAssignmentLog.create({
    studentId: sid,
    studentName,
    lockerNumber: locker.lockerNumber,
    action: "released"
  });

  return locker.toObject();
};

// ─── Get all lockers (for overview) ──────────────────────────────────────────
export const getAllLockers = async () => {
  // Auto-expire past-due lockers — fully clean them back to available
  const now = new Date();
  const expiredLockers = await LockerStation.find({
    status: "assigned",
    expiresAt: { $lte: now }
  });

  for (const locker of expiredLockers) {
    await LockerAssignmentLog.create({
      studentId: locker.assignedTo,
      studentName: locker.assignedStudentName || locker.assignedTo,
      lockerNumber: locker.lockerNumber,
      action: "expired"
    });

    locker.status = "available";
    locker.assignedTo = null;
    locker.assignedStudentName = null;
    locker.assignedStudentFaculty = null;
    locker.assignedStudentPhone = null;
    locker.assignedAt = null;
    locker.expiresAt = null;
    await locker.save();
  }

  return LockerStation.find().sort({ lockerNumber: 1 }).lean();
};

// ─── Get only active/booked lockers (with student details) ───────────────────
export const getActiveLockers = async () => {
  // Auto-expire past-due lockers first
  const now = new Date();
  const expiredLockers = await LockerStation.find({
    status: "assigned",
    expiresAt: { $lte: now }
  });

  for (const locker of expiredLockers) {
    await LockerAssignmentLog.create({
      studentId: locker.assignedTo,
      studentName: locker.assignedStudentName || locker.assignedTo,
      lockerNumber: locker.lockerNumber,
      action: "expired"
    });

    locker.status = "available";
    locker.assignedTo = null;
    locker.assignedStudentName = null;
    locker.assignedStudentFaculty = null;
    locker.assignedStudentPhone = null;
    locker.assignedAt = null;
    locker.expiresAt = null;
    await locker.save();
  }

  // Return ONLY currently assigned lockers
  return LockerStation.find({ status: "assigned" }).sort({ lockerNumber: 1 }).lean();
};

// ─── Create a locker (add to pool) ──────────────────────────────────────────
export const createLocker = async (lockerNumber, location) => {
  const exists = await LockerStation.findOne({ lockerNumber });
  if (exists) throw new Error(`Locker "${lockerNumber}" already exists`);

  const locker = new LockerStation({
    lockerNumber,
    location: location || "Main Building",
    status: "available"
  });
  await locker.save();
  return locker.toObject();
};
