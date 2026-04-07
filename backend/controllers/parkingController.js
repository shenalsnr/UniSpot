import ParkingSpot from "../models/ParkingSpot.js";
import ParkingBooking from "../models/ParkingBooking.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";


// ─── Shared helper: release a spot's booking fields ─────────────────────────
const releaseSpotFields = (spot) => {
  spot.isOccupied = false;
  spot.reservedBy = null;
  spot.bookingDate = null;
  spot.arrivalTime = null;
  spot.leavingTime = null;
  spot.vehicleNumber = null;
};


export const getParkingSpots = async (req, res, next) => {
  try {
    const { zone } = req.query;

    const query = {};

    if (zone) {
      query.zone = zone;
    }

    const spots = await ParkingSpot.find(query);

    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots,
    });
  } catch (error) {
    next(error);
  }
};


export const getParkingSpotById = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};


export const createParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.create(req.body);
    res.status(201).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};


export const getNextSlotNumber = async (req, res, next) => {
  try {
    const { zone } = req.query;
    if (!zone) {
      return res.status(400).json({ success: false, message: "Zone is required" });
    }

    const spots = await ParkingSpot.find({ zone });
    
    // Prefix for the slot number (e.g., "Zone 01" -> "Z01", "Zone 03.02" -> "Z03.02")
    // Using simple replace for consistency, keeping dots if present
    const zonePart = zone.replace("Zone ", "Z");
    
    const existingNumbers = spots.map(s => {
      const match = s.slotNumber.match(/-S(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    }).filter(n => n !== null).sort((a,b) => a - b);

    let nextNumInt = 1;
    for (let i = 0; i < existingNumbers.length; i++) {
        if (existingNumbers[i] === nextNumInt) {
            nextNumInt++;
        } else if (existingNumbers[i] > nextNumInt) {
            break;
        }
    }
    
    const nextNumStr = nextNumInt.toString().padStart(2, '0');
    const nextSlotNumber = `${zonePart}-S${nextNumStr}`;

    res.status(200).json({
      success: true,
      data: { nextSlotNumber }
    });
  } catch (error) {
    next(error);
  }
};


export const reserveParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    if (spot.isUnderMaintenance) {
      return res
        .status(400)
        .json({ success: false, message: "This parking slot is currently under maintenance" });
    }

    // Blocked student check — enforced before anything else
    const userId = req.body.userId || 'Anonymous';
    if (userId !== 'Anonymous') {
      const studentRecord = await Student.findOne({ studentId: userId }).select("status marks");
      if (studentRecord && studentRecord.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Your parking privileges have been suspended due to zero remaining points. Please contact administration.",
          blocked: true,
        });
      }
    }

    // Single active booking check
    if (userId !== 'Anonymous') {
      const existingBooking = await ParkingSpot.findOne({ reservedBy: userId, isOccupied: true });
      if (existingBooking) {
        return res
          .status(400)
          .json({ success: false, message: "You already have an active parking booking." });
      }
    }

    if (spot.isOccupied) {
      return res
        .status(400)
        .json({ success: false, message: "This parking slot is no longer available for the selected time. Another booking already exists for this time range." });
    }

    if (!req.body.bookingDate || !req.body.arrivalTime || !req.body.leavingTime) {
      return res
        .status(400)
        .json({ success: false, message: "Booking date, arrival time, and leaving time are required" });
    }

    if (req.body.leavingTime <= req.body.arrivalTime) {
      return res
        .status(400)
        .json({ success: false, message: "Leaving time must be after arrival time" });
    }

    spot.isOccupied = true;
    spot.reservedBy = req.body.userId || 'Anonymous';
    spot.bookingDate = req.body.bookingDate;
    spot.arrivalTime = req.body.arrivalTime;
    spot.leavingTime = req.body.leavingTime;
    spot.vehicleNumber = req.body.vehicleNumber || null;

    const updatedSpot = await spot.save();

    // ── Create ParkingBooking history record ──────────────────────────────────
    if (userId !== 'Anonymous') {
      try {
        await ParkingBooking.create({
          studentId: userId,
          spotId: spot._id,
          slotNumber: spot.slotNumber,
          zone: spot.zone,
          vehicleType: spot.vehicleType,
          vehicleNumber: req.body.vehicleNumber || null,
          bookingDate: req.body.bookingDate,
          arrivalTime: req.body.arrivalTime,
          leavingTime: req.body.leavingTime,
          status: "active",
        });
      } catch (bookingErr) {
        console.error("[ParkingBooking] Failed to create booking record:", bookingErr.message);
      }
    }

    // ── Create booking_success notification ───────────────────────────────────
    if (userId !== 'Anonymous') {
      try {
        await Notification.create({
          userId: userId,
          title: "Parking Slot Booked Successfully 🚗",
          message: `Your parking slot ${spot.slotNumber} (${spot.zone}) has been booked successfully.`,
          type: "booking_success",
          metadata: {
            slotNumber: spot.slotNumber,
            zone: spot.zone,
            vehicleType: spot.vehicleType,
            vehicleNumber: req.body.vehicleNumber || null,
            bookingDate: req.body.bookingDate,
            arrivalTime: req.body.arrivalTime,
            leavingTime: req.body.leavingTime,
          },
        });
      } catch (notifErr) {
        console.error("[Notification] Failed to create booking_success notification:", notifErr.message);
      }
    }

    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};


export const releaseParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    releaseSpotFields(spot);

    // Clear maintenance state if applicable
    spot.isUnderMaintenance = false;

    const updatedSpot = await spot.save();
    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};


export const deleteParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    await spot.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};


export const updateParkingSpot = async (req, res, next) => {
  try {
    let spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    if (req.body.leavingTime && req.body.arrivalTime && req.body.leavingTime <= req.body.arrivalTime) {
      return res.status(400).json({
        success: false,
        message: "Leaving time must be after arrival time",
      });
    }

    spot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};


export const getMyActiveBooking = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // The slot may still be occupied even after booking expires (no auto-release)
    const occupiedSpot = await ParkingSpot.findOne({
      reservedBy: studentId,
      isOccupied: true
    });

    if (!occupiedSpot) {
      return res.status(404).json({ success: false, message: "No active parking booking found." });
    }

    // Look up the ParkingBooking record — could be 'active' or 'expired'
    const bookingRecord = await ParkingBooking.findOne({
      studentId,
      status: { $in: ["active", "expired"] },
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: occupiedSpot,
      bookingStatus: bookingRecord?.status || "active",
      actualArrivalTime: bookingRecord?.actualArrivalTime || null,
    });
  } catch (error) {
    next(error);
  }
};


export const getActiveBookingByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const activeBooking = await ParkingSpot.findOne({
      reservedBy: studentId,
      isOccupied: true
    });

    if (!activeBooking) {
      return res.status(404).json({ success: false, message: "No active parking booking found." });
    }

    res.status(200).json({ success: true, data: activeBooking });
  } catch (error) {
    next(error);
  }
};


export const cancelParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    // Capture before clearing
    const reservedByStudent = spot.reservedBy;
    const slotNumber = spot.slotNumber;
    const zone = spot.zone;

    releaseSpotFields(spot);
    const updatedSpot = await spot.save();

    // ── Update ParkingBooking record to cancelled ─────────────────────────────
    if (reservedByStudent && reservedByStudent !== 'Anonymous') {
      try {
        await ParkingBooking.findOneAndUpdate(
          { studentId: reservedByStudent, spotId: spot._id, status: "active" },
          { $set: { status: "cancelled" } },
          { sort: { createdAt: -1 } }
        );
      } catch (bookingErr) {
        console.error("[ParkingBooking] Failed to update booking status:", bookingErr.message);
      }
    }

    // ── Create booking_cancelled notification ─────────────────────────────────
    if (reservedByStudent && reservedByStudent !== 'Anonymous') {
      try {
        await Notification.create({
          userId: reservedByStudent,
          title: "Parking Booking Cancelled",
          message: `Your booking for slot ${slotNumber} (${zone}) has been cancelled.`,
          type: "booking_cancelled",
          metadata: { slotNumber, zone },
        });
      } catch (notifErr) {
        console.error("[Notification] Failed to create booking_cancelled notification:", notifErr.message);
      }
    }

    res.status(200).json({ success: true, data: updatedSpot, status: 'cancelled' });
  } catch (error) {
    next(error);
  }
};


export const toggleMaintenance = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    if (spot.isOccupied) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot maintain an occupied spot. Release it first." });
    }

    const wasMaintenance = spot.isUnderMaintenance;
    spot.isUnderMaintenance = !wasMaintenance;

    const updatedSpot = await spot.save();

    // ── Create maintenance_notice when toggling maintenance ON ────────────────
    // Notify students with active bookings in the same zone as a heads-up
    if (!wasMaintenance && spot.isUnderMaintenance) {
      try {
        // Find students with active bookings in this zone
        const activeInZone = await ParkingBooking.find({
          zone: spot.zone,
          status: "active",
        }).lean();

        const notifiedStudents = new Set();

        for (const booking of activeInZone) {
          if (notifiedStudents.has(booking.studentId)) continue;
          notifiedStudents.add(booking.studentId);

          await Notification.create({
            userId: booking.studentId,
            title: "Parking Zone Maintenance Notice ⚠️",
            message: `A slot in your parking zone (${spot.zone}) is temporarily unavailable due to maintenance. Slot ${spot.slotNumber} is affected.`,
            type: "maintenance_notice",
            metadata: {
              affectedSlot: spot.slotNumber,
              zone: spot.zone,
            },
          });
        }
      } catch (notifErr) {
        console.error("[Notification] Failed to create maintenance_notice:", notifErr.message);
      }
    }

    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /api/parking/security/scan-qr
 *
 * Security staff scans a student's QR code (which contains the studentId).
 * This endpoint handles both ARRIVAL and DEPARTURE in sequence:
 *
 * 1st scan → records actualArrivalTime
 * 2nd scan → records actualDepartureTime, marks booking COMPLETED, releases slot,
 *            creates departure_confirmed notification
 *
 * Auth: Open endpoint mirroring existing security verifyQRCode pattern.
 *       The qrData must match a valid student ID in the system.
 */
export const securityScanQR = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        message: "studentId is required. Scan the student's QR code.",
      });
    }

    const normalizedId = studentId.trim().toUpperCase();

    // Verify student exists
    const student = await Student.findOne({ studentId: normalizedId }).select("name studentId");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with ID: ${normalizedId}`,
      });
    }

    // Find the student's booking — active OR expired (security can still
    // confirm departure after expiry; the slot is still physically occupied)
    const booking = await ParkingBooking.findOne({
      studentId: normalizedId,
      status: { $in: ["active", "expired"] },
    }).sort({ createdAt: -1 });

    if (!booking) {
      // Check if there is a recently completed booking (for feedback)
      const recent = await ParkingBooking.findOne({
        studentId: normalizedId,
        status: { $in: ["completed", "cancelled"] },
      }).sort({ updatedAt: -1 }).lean();

      if (recent && recent.status === "completed") {
        return res.status(200).json({
          success: true,
          scanType: "already_completed",
          message: `${student.name}'s parking booking for slot ${recent.slotNumber} is already completed.`,
          data: { studentName: student.name, studentId: normalizedId, slot: recent.slotNumber, zone: recent.zone },
        });
      }

      return res.status(404).json({
        success: false,
        message: `No open parking booking found for student ${student.name} (${normalizedId}).`,
      });
    }

    // ── ARRIVAL scan (first scan) ─────────────────────────────────────────────
    if (!booking.actualArrivalTime) {
      booking.actualArrivalTime = new Date();
      await booking.save();

      return res.status(200).json({
        success: true,
        scanType: "arrival",
        message: `Arrival recorded for ${student.name}. Slot: ${booking.slotNumber} (${booking.zone}).`,
        data: {
          studentName: student.name,
          studentId: normalizedId,
          slotNumber: booking.slotNumber,
          zone: booking.zone,
          arrivalTime: booking.arrivalTime,
          leavingTime: booking.leavingTime,
          actualArrivalTime: booking.actualArrivalTime,
        },
      });
    }

    // ── DEPARTURE scan (second scan) ──────────────────────────────────────────
    if (booking.actualArrivalTime && !booking.actualDepartureTime) {
      const now = new Date();

      // Update booking record
      booking.actualDepartureTime = now;
      booking.status = "completed";
      await booking.save();

      // Release the parking spot
      const spot = await ParkingSpot.findById(booking.spotId);
      if (spot && spot.isOccupied) {
        releaseSpotFields(spot);
        await spot.save();
      }

      // Create departure_confirmed notification
      try {
        await Notification.create({
          userId: normalizedId,
          title: "Departure Confirmed ✅",
          message: `Your departure from slot ${booking.slotNumber} (${booking.zone}) has been recorded successfully.`,
          type: "departure_confirmed",
          metadata: {
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            actualArrivalTime: booking.actualArrivalTime,
            actualDepartureTime: now,
          },
        });
      } catch (notifErr) {
        console.error("[Notification] Failed to create departure_confirmed notification:", notifErr.message);
      }

      return res.status(200).json({
        success: true,
        scanType: "departure",
        message: `Departure confirmed for ${student.name}. Slot ${booking.slotNumber} is now available.`,
        data: {
          studentName: student.name,
          studentId: normalizedId,
          slotNumber: booking.slotNumber,
          zone: booking.zone,
          actualArrivalTime: booking.actualArrivalTime,
          actualDepartureTime: now,
          bookingStatus: "completed",
        },
      });
    }

    // Edge case: both times already recorded
    return res.status(200).json({
      success: true,
      scanType: "already_completed",
      message: `Both arrival and departure have already been recorded for ${student.name}.`,
    });
  } catch (error) {
    next(error);
  }
};