import ParkingSpot from "../models/ParkingSpot.js";
import ParkingBooking from "../models/ParkingBooking.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";
import { createStudentNotification } from "../utils/notificationHelper.js";


// ─── Helper: convert "HH:MM" string to total minutes ────────────────────────
const timeToMinutes = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// ─── Helper: check if two [start, end) intervals overlap ────────────────────
// Overlap condition: newStart < existingEnd AND newEnd > existingStart
const intervalsOverlap = (newStart, newEnd, exStart, exEnd) =>
  newStart < exEnd && newEnd > exStart;


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


/**
 * PUT /api/parking/:id/reserve
 *
 * Time-based booking: a slot can be booked multiple times per day by different
 * students as long as their time intervals do not overlap.
 *
 * Overlap condition:  newStart < existingEnd  AND  newEnd > existingStart
 */
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

    // ── Blocked student check ─────────────────────────────────────────────────
    const userId = req.body.userId || "Anonymous";
    if (userId !== "Anonymous") {
      const studentRecord = await Student.findOne({ studentId: userId }).select("status marks");
      if (studentRecord && studentRecord.status === "blocked") {
        return res.status(403).json({
          success: false,
          message: "Your parking privileges have been suspended due to zero remaining points. Please contact administration.",
          blocked: true,
        });
      }
    }

    // ── Required fields validation ────────────────────────────────────────────
    const { bookingDate, arrivalTime, leavingTime } = req.body;

    if (!bookingDate || !arrivalTime || !leavingTime) {
      return res
        .status(400)
        .json({ success: false, message: "Booking date, arrival time, and leaving time are required" });
    }

    if (leavingTime <= arrivalTime) {
      return res
        .status(400)
        .json({ success: false, message: "Leaving time must be after arrival time" });
    }

    // ── Time-overlap conflict check ───────────────────────────────────────────
    // Normalise the booking date to midnight UTC for consistent comparison
    const bookingDateNorm = new Date(bookingDate);
    bookingDateNorm.setUTCHours(0, 0, 0, 0);

    const newStartMins = timeToMinutes(arrivalTime);
    const newEndMins   = timeToMinutes(leavingTime);

    // Fetch all active/expired bookings for this slot on this date
    const existingBookings = await ParkingBooking.find({
      spotId: spot._id,
      status: { $in: ["active", "expired"] },
      bookingDate: {
        $gte: bookingDateNorm,
        $lt: new Date(bookingDateNorm.getTime() + 24 * 60 * 60 * 1000),
      },
    }).lean();

    for (const booking of existingBookings) {
      const exStart = timeToMinutes(booking.arrivalTime);
      const exEnd   = timeToMinutes(booking.leavingTime);

      if (exStart === null || exEnd === null) continue;

      if (intervalsOverlap(newStartMins, newEndMins, exStart, exEnd)) {
        return res.status(409).json({
          success: false,
          message: `This slot is already booked from ${booking.arrivalTime} to ${booking.leavingTime} on that date. Please choose a different time slot.`,
          conflict: {
            existingArrival: booking.arrivalTime,
            existingLeaving: booking.leavingTime,
          },
        });
      }
    }

    // ── Check if the student already has any active booking (one booking at a time) ────
    if (userId !== "Anonymous") {
      const existingActiveBooking = await ParkingBooking.findOne({
        studentId: userId,
        status: "active",
      }).lean();

      if (existingActiveBooking) {
        return res.status(409).json({
          success: false,
          message: `You already have an active booking for slot ${existingActiveBooking.slotNumber} on ${new Date(existingActiveBooking.bookingDate).toLocaleDateString()}. Only one parking booking is allowed at a time. Please cancel your existing booking first.`,
        });
      }
    }


    // ── Create ParkingBooking record ──────────────────────────────────────────
    let createdBooking = null;
    if (userId !== "Anonymous") {
      try {
        createdBooking = await ParkingBooking.create({
          studentId: userId,
          spotId: spot._id,
          slotNumber: spot.slotNumber,
          zone: spot.zone,
          vehicleType: spot.vehicleType,
          vehicleNumber: req.body.vehicleNumber || null,
          bookingDate: bookingDateNorm,
          arrivalTime,
          leavingTime,
          status: "active",
        });
      } catch (bookingErr) {
        console.error("[ParkingBooking] Failed to create booking record:", bookingErr.message);
        return res.status(500).json({ success: false, message: "Failed to save booking record." });
      }
    }

    // ── Create booking_success notification (real-time + DB) ────────────────────
    if (userId !== "Anonymous") {
      try {
        await createStudentNotification(
          userId,
          "Parking Slot Booked Successfully 🚗",
          `Your parking slot ${spot.slotNumber} (${spot.zone}) has been booked for ${arrivalTime}–${leavingTime}.`,
          "booking_success",
          {
            slotNumber: spot.slotNumber,
            zone: spot.zone,
            vehicleType: spot.vehicleType,
            vehicleNumber: req.body.vehicleNumber || null,
            bookingDate,
            arrivalTime,
            leavingTime,
          }
        );
      } catch (notifErr) {
        console.error("[Notification] Failed to create booking_success notification:", notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: createdBooking?._id,
        slotNumber: spot.slotNumber,
        zone: spot.zone,
        vehicleType: spot.vehicleType,
        vehicleNumber: req.body.vehicleNumber || null,
        bookingDate,
        arrivalTime,
        leavingTime,
        status: "active",
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/parking/:id/bookings?date=YYYY-MM-DD
 *
 * Returns all active bookings for a given slot on a specific date.
 * Used by the frontend to display occupied time blocks on the slot map.
 */
export const getSlotBookings = async (req, res, next) => {
  try {
    const { date } = req.query;
    const spotId = req.params.id;

    if (!date) {
      return res.status(400).json({ success: false, message: "date query param is required (YYYY-MM-DD)" });
    }

    const dateNorm = new Date(date);
    dateNorm.setUTCHours(0, 0, 0, 0);

    const bookings = await ParkingBooking.find({
      spotId,
      status: { $in: ["active", "expired"] },
      bookingDate: {
        $gte: dateNorm,
        $lt: new Date(dateNorm.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .select("arrivalTime leavingTime studentId")
      .lean();

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};


// ─── Admin: force-release a spot (clears isOccupied for physical state) ──────
export const releaseParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Parking spot not found" });
    }

    // Clear physical occupancy flags
    spot.isOccupied = false;
    spot.reservedBy = null;
    spot.bookingDate = null;
    spot.arrivalTime = null;
    spot.leavingTime = null;
    spot.vehicleNumber = null;
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


/**
 * GET /api/parking/my-active  (protected)
 *
 * Returns the student's most recent active or expired ParkingBooking.
 * No longer reads from ParkingSpot — booking data lives in ParkingBooking.
 */
export const getMyActiveBooking = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Exclude bookings where departure has already been recorded.
    // This handles the overstay case: status stays 'expired' but car has physically left.
    const bookingRecord = await ParkingBooking.findOne({
      studentId,
      status: { $in: ["active", "expired", "waiting_for_slot"] },
      actualDepartureTime: null,
    }).sort({ createdAt: -1 }).lean();

    if (!bookingRecord) {
      return res.status(404).json({ success: false, message: "No active parking booking found." });
    }

    res.status(200).json({
      success: true,
      data: bookingRecord,
      bookingStatus: bookingRecord.status,
      actualArrivalTime: bookingRecord.actualArrivalTime || null,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/parking/my-booking/:studentId
 *
 * Returns the most recent active/expired booking for a student (used by security portal).
 */
export const getActiveBookingByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const bookingRecord = await ParkingBooking.findOne({
      studentId: studentId.toUpperCase(),
      status: { $in: ["active", "expired"] },
    }).sort({ createdAt: -1 }).lean();

    if (!bookingRecord) {
      return res.status(404).json({ success: false, message: "No active parking booking found." });
    }

    res.status(200).json({ success: true, data: bookingRecord });
  } catch (error) {
    next(error);
  }
};


/**
 * PUT /api/parking/:id/cancel
 *
 * Student cancels their own active booking.
 * Marks the ParkingBooking record as cancelled.
 * Does NOT modify ParkingSpot — availability is derived from bookings, not spot state.
 */
export const cancelParkingSpot = async (req, res, next) => {
  try {
    const spotId = req.params.id;

    // Attempt to find and cancel the active booking for this spot
    // The spotId in the URL is actually the ParkingBooking _id when the student cancels
    // Try by booking _id first, then by spotId
    let bookingRecord = null;

    if (mongoose.Types.ObjectId.isValid(spotId)) {
      // Try as ParkingBooking _id (new flow: frontend passes booking._id)
      bookingRecord = await ParkingBooking.findOne({
        _id: spotId,
        status: "active",
      });

      // Fallback: treat as spotId (old flow)
      if (!bookingRecord) {
        bookingRecord = await ParkingBooking.findOne({
          spotId,
          status: "active",
        }).sort({ createdAt: -1 });
      }
    }

    if (!bookingRecord) {
      return res.status(404).json({ success: false, message: "No active booking found to cancel." });
    }

    const { studentId, slotNumber, zone } = bookingRecord;

    bookingRecord.status = "cancelled";
    await bookingRecord.save();

    // ── Create booking_cancelled notification ─────────────────────────────────
    if (studentId && studentId !== "Anonymous") {
      try {
        await createStudentNotification(
          studentId,
          "Parking Booking Cancelled",
          `Your booking for slot ${slotNumber} (${zone}) has been cancelled.`,
          "booking_cancelled",
          { slotNumber, zone }
        );
      } catch (notifErr) {
        console.error("[Notification] Failed to create booking_cancelled notification:", notifErr.message);
      }
    }

    res.status(200).json({ success: true, data: bookingRecord, status: "cancelled" });
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

    // ── Notify students with active bookings in this zone ─────────────────────
    if (!wasMaintenance && spot.isUnderMaintenance) {
      try {
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
 * Production-ready QR scan endpoint.
 * Uses time-based + state-based validation. Single endpoint handles:
 *   - Arrival recording (with early/expired rejection)
 *   - Departure recording (normal + overstay)
 *   - Overstay conflict detection → waiting_for_slot
 *   - Double-scan prevention (idempotent)
 *   - Concurrency safety (atomic updates)
 *   - Scan audit logging (scannedBy)
 *
 * Body: { studentId, staffId? }
 */
export const securityScanQR = async (req, res, next) => {
  try {
    const { studentId, staffId } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        scanType: "rejected",
        message: "studentId is required. Scan the student's QR code.",
      });
    }

    const normalizedId = studentId.trim().toUpperCase();
    const now = new Date();

    // ── Verify student exists ─────────────────────────────────────────────────
    const student = await Student.findOne({ studentId: normalizedId }).select("name studentId");
    if (!student) {
      return res.status(404).json({
        success: false,
        scanType: "rejected",
        message: `No student found with ID: ${normalizedId}`,
      });
    }

    // ── 1. FIND OPEN BOOKING ──────────────────────────────────────────────────
    // Look for booking with no departure yet (active, expired, or waiting)
    const booking = await ParkingBooking.findOne({
      studentId: normalizedId,
      status: { $in: ["active", "expired", "waiting_for_slot"] },
      actualDepartureTime: null,
    }).sort({ createdAt: -1 });

    if (!booking) {
      // ── IDEMPOTENCY: check if last booking is already completed ────────────
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
        scanType: "rejected",
        message: `No open parking booking found for student ${student.name} (${normalizedId}).`,
      });
    }

    // ── Build booking end datetime for time-based validation ─────────────────
    const getEndDateTime = () => {
      if (!booking.bookingDate || !booking.leavingTime) return null;
      const d = new Date(booking.bookingDate);
      const [h, m] = booking.leavingTime.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const getStartDateTime = () => {
      if (!booking.bookingDate || !booking.arrivalTime) return null;
      const d = new Date(booking.bookingDate);
      const [h, m] = booking.arrivalTime.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const bookingStart = getStartDateTime();
    const bookingEnd = getEndDateTime();

    // ── 4. DOUBLE SCAN PROTECTION ─────────────────────────────────────────────
    // If both arrival and departure already recorded → idempotent response
    if (booking.actualArrivalTime && booking.actualDepartureTime) {
      return res.status(200).json({
        success: true,
        scanType: "already_completed",
        message: `Both arrival and departure have already been recorded for ${student.name}.`,
        data: {
          studentName: student.name,
          studentId: normalizedId,
          slotNumber: booking.slotNumber,
          zone: booking.zone,
        },
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. ARRIVAL LOGIC
    // ══════════════════════════════════════════════════════════════════════════
    if (!booking.actualArrivalTime && booking.status !== "waiting_for_slot") {

      // ── A. EARLY ARRIVAL ─────────────────────────────────────────────────
      if (bookingStart && now < bookingStart) {
        return res.status(400).json({
          success: false,
          scanType: "rejected",
          message: `Booking has not started yet. ${student.name}'s booking for slot ${booking.slotNumber} starts at ${booking.arrivalTime}.`,
          data: {
            studentName: student.name,
            studentId: normalizedId,
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            arrivalTime: booking.arrivalTime,
            leavingTime: booking.leavingTime,
          },
        });
      }

      // ── C. EXPIRED WITHOUT ARRIVAL — force-complete to release the slot ──
      // Student never arrived (no arrival scan), booking has now expired.
      // Security scanning confirms the slot is empty → mark as completed & release.
      if (bookingEnd && now > bookingEnd) {
        const forceComplete = await ParkingBooking.findOneAndUpdate(
          { _id: booking._id, actualDepartureTime: null },
          {
            $set: {
              status: "completed",
              actualDepartureTime: now,
              departureScannedBy: staffId || null,
            },
          },
          { new: true }
        );

        // Release physical spot occupancy if it was set
        try {
          const spot = await ParkingSpot.findById(booking.spotId);
          if (spot && spot.isOccupied && spot.reservedBy === normalizedId) {
            spot.isOccupied = false;
            spot.reservedBy = null;
            spot.bookingDate = null;
            spot.arrivalTime = null;
            spot.leavingTime = null;
            spot.vehicleNumber = null;
            await spot.save();
          }
        } catch (spotErr) {
          console.error("[SecurityScan] Failed to release spot on expired no-arrival:", spotErr.message);
        }

        try {
          await createStudentNotification(
            normalizedId,
            "Parking Slot Released (No Arrival) ℹ️",
            `Your parking slot ${booking.slotNumber} (${booking.zone}) has been released by security. No arrival was recorded within your booking window (${booking.arrivalTime}–${booking.leavingTime}).`,
            "departure_confirmed",
            {
              slotNumber: booking.slotNumber,
              zone: booking.zone,
              arrivalTime: booking.arrivalTime,
              leavingTime: booking.leavingTime,
              isOverstay: false,
            }
          );
        } catch (notifErr) {
          console.error("[Notification] Failed to send no-arrival release notification:", notifErr.message);
        }

        return res.status(200).json({
          success: true,
          scanType: "departure",
          message: `Slot ${booking.slotNumber} released. ${student.name} never arrived — booking is now closed.`,
          data: {
            studentName: student.name,
            studentId: normalizedId,
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            arrivalTime: booking.arrivalTime,
            leavingTime: booking.leavingTime,
            actualArrivalTime: null,
            actualDepartureTime: now,
          },
        });
      }

      // ── OVERSTAY CONFLICT CHECK ──────────────────────────────────────────
      const spot = await ParkingSpot.findById(booking.spotId);

      if (spot && spot.isOccupied && spot.reservedBy !== normalizedId) {
        // Slot physically taken by another student (overstayor)
        booking.status = "waiting_for_slot";
        await booking.save();

        try {
          await createStudentNotification(
            normalizedId,
            "Slot Occupied — Please Contact Security 🚧",
            `Your reserved parking slot ${booking.slotNumber} (${booking.zone}) is currently occupied due to overstay. Please approach security — they will reassign you to an available slot immediately.`,
            "slot_conflict",
            {
              slotNumber: booking.slotNumber,
              zone: booking.zone,
              arrivalTime: booking.arrivalTime,
              leavingTime: booking.leavingTime,
            }
          );
        } catch (notifErr) {
          console.error("[Notification] Failed to create slot_conflict notification:", notifErr.message);
        }

        return res.status(200).json({
          success: true,
          scanType: "waiting_for_slot",
          message: `Slot ${booking.slotNumber} is occupied due to overstay. ${student.name}'s booking has been placed in the waiting queue. Please reassign via the Waiting Queue panel.`,
          data: {
            studentName: student.name,
            studentId: normalizedId,
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            arrivalTime: booking.arrivalTime,
            leavingTime: booking.leavingTime,
            bookingId: booking._id,
          },
        });
      }

      // ── B. VALID ARRIVAL — record atomically ─────────────────────────────
      const arrivalUpdate = await ParkingBooking.findOneAndUpdate(
        {
          _id: booking._id,
          actualArrivalTime: null, // concurrency guard
        },
        {
          $set: {
            actualArrivalTime: now,
            status: "active",
            arrivalScannedBy: staffId || null,
          },
        },
        { new: true }
      );

      // If atomic update returned null, arrival was already recorded (race / double tap)
      if (!arrivalUpdate) {
        return res.status(200).json({
          success: true,
          scanType: "arrival",
          message: `Arrival already recorded for ${student.name}. Slot: ${booking.slotNumber} (${booking.zone}).`,
          data: {
            studentName: student.name,
            studentId: normalizedId,
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            arrivalTime: booking.arrivalTime,
            leavingTime: booking.leavingTime,
          },
        });
      }

      // Mark ParkingSpot as physically occupied
      try {
        if (spot) {
          spot.isOccupied = true;
          spot.reservedBy = normalizedId;
          spot.bookingDate = booking.bookingDate;
          spot.arrivalTime = booking.arrivalTime;
          spot.leavingTime = booking.leavingTime;
          spot.vehicleNumber = booking.vehicleNumber || null;
          await spot.save();
        }
      } catch (spotErr) {
        console.error("[SecurityScan] Failed to update spot occupancy on arrival:", spotErr.message);
      }

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
          actualArrivalTime: now,
        },
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Already in waiting_for_slot — remind security
    // ══════════════════════════════════════════════════════════════════════════
    if (booking.status === "waiting_for_slot") {
      return res.status(200).json({
        success: true,
        scanType: "waiting_for_slot",
        message: `${student.name} is already in the waiting queue for slot ${booking.slotNumber}. Please reassign via the Waiting Queue panel.`,
        data: {
          studentName: student.name,
          studentId: normalizedId,
          slotNumber: booking.slotNumber,
          zone: booking.zone,
          arrivalTime: booking.arrivalTime,
          leavingTime: booking.leavingTime,
          bookingId: booking._id,
        },
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. DEPARTURE LOGIC
    // ══════════════════════════════════════════════════════════════════════════
    if (booking.actualArrivalTime && !booking.actualDepartureTime) {

      // Determine if this is a normal or overstay departure
      const isOverstay = bookingEnd && now > bookingEnd;
      const departureStatus = isOverstay ? "expired" : "completed";

      // ── Atomic departure update (concurrency guard) ──────────────────────
      const departureUpdate = await ParkingBooking.findOneAndUpdate(
        {
          _id: booking._id,
          actualDepartureTime: null,  // prevents double-update race
        },
        {
          $set: {
            actualDepartureTime: now,
            status: departureStatus,
            departureScannedBy: staffId || null,
          },
        },
        { new: true }
      );

      // If null, departure was already recorded (race condition / double tap)
      if (!departureUpdate) {
        return res.status(200).json({
          success: true,
          scanType: "already_completed",
          message: `Departure already recorded for ${student.name}.`,
          data: {
            studentName: student.name,
            studentId: normalizedId,
            slotNumber: booking.slotNumber,
            zone: booking.zone,
          },
        });
      }

      // ── Release physical spot occupancy ──────────────────────────────────
      try {
        const spot = await ParkingSpot.findById(booking.spotId);
        if (spot && spot.isOccupied) {
          spot.isOccupied = false;
          spot.reservedBy = null;
          spot.bookingDate = null;
          spot.arrivalTime = null;
          spot.leavingTime = null;
          spot.vehicleNumber = null;
          await spot.save();
        }
      } catch (spotErr) {
        console.error("[SecurityScan] Failed to release spot on departure:", spotErr.message);
      }

      // ── Departure notification ───────────────────────────────────────────
      const notifTitle = isOverstay
        ? "Departure Confirmed (Overstay) ⚠️"
        : "Departure Confirmed ✅";
      const notifMessage = isOverstay
        ? `Your departure from slot ${booking.slotNumber} (${booking.zone}) has been recorded. Note: You departed after your scheduled leaving time (${booking.leavingTime}).`
        : `Your departure from slot ${booking.slotNumber} (${booking.zone}) has been recorded successfully.`;

      try {
        await createStudentNotification(
          normalizedId,
          notifTitle,
          notifMessage,
          "departure_confirmed",
          {
            slotNumber: booking.slotNumber,
            zone: booking.zone,
            actualArrivalTime: booking.actualArrivalTime,
            actualDepartureTime: now,
            isOverstay,
          }
        );
      } catch (notifErr) {
        console.error("[Notification] Failed to create departure notification:", notifErr.message);
      }

      const scanType = isOverstay ? "departure_overstay" : "departure";

      return res.status(200).json({
        success: true,
        scanType,
        message: isOverstay
          ? `Late departure recorded for ${student.name}. Slot ${booking.slotNumber} is now available. (Departed after ${booking.leavingTime})`
          : `Departure confirmed for ${student.name}. Slot ${booking.slotNumber} is now available.`,
        data: {
          studentName: student.name,
          studentId: normalizedId,
          slotNumber: booking.slotNumber,
          zone: booking.zone,
          arrivalTime: booking.arrivalTime,
          leavingTime: booking.leavingTime,
          actualArrivalTime: booking.actualArrivalTime,
          actualDepartureTime: now,
          bookingStatus: departureStatus,
          isOverstay,
        },
      });
    }

    // ── 5. INVALID FLOW — departure without arrival ───────────────────────────
    if (!booking.actualArrivalTime && booking.actualDepartureTime) {
      return res.status(400).json({
        success: false,
        scanType: "rejected",
        message: "Invalid state: arrival was not recorded for this booking.",
      });
    }

    // ── Fallback: both times already recorded ─────────────────────────────────
    return res.status(200).json({
      success: true,
      scanType: "already_completed",
      message: `Both arrival and departure have already been recorded for ${student.name}.`,
      data: {
        studentName: student.name,
        studentId: normalizedId,
        slotNumber: booking.slotNumber,
        zone: booking.zone,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/parking/waiting
 *
 * Returns all ParkingBooking records with status = "waiting_for_slot".
 * Used by the Security Portal Waiting Queue panel.
 */
export const getWaitingBookings = async (req, res, next) => {
  try {
    const waitingBookings = await ParkingBooking.find({
      status: "waiting_for_slot",
    })
      .sort({ createdAt: 1 }) // oldest first — FIFO queue
      .lean();

    res.status(200).json({
      success: true,
      count: waitingBookings.length,
      data: waitingBookings,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * PUT /api/parking/:id/reassign
 *
 * Security manually reassigns a waiting_for_slot booking to a new available slot.
 *
 * Body: { newSpotId, staffId }
 *
 * Guards:
 *  - Booking must be in waiting_for_slot status
 *  - Only one reassignment per booking (isReassigned must be false)
 *  - New spot must not be occupied or under maintenance
 *  - New spot must have no time-overlap with existing active bookings
 */
export const reassignWaitingBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { newSpotId, staffId } = req.body;

    if (!newSpotId || !staffId) {
      return res.status(400).json({
        success: false,
        message: "newSpotId and staffId are required.",
      });
    }

    // Load the waiting booking
    const booking = await ParkingBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.status !== "waiting_for_slot") {
      return res.status(400).json({
        success: false,
        message: `Cannot reassign a booking with status '${booking.status}'. Only waiting_for_slot bookings can be reassigned.`,
      });
    }

    if (booking.isReassigned) {
      return res.status(400).json({
        success: false,
        message: "This booking has already been reassigned. Only one reassignment is allowed per booking.",
      });
    }

    // Load the new spot
    const newSpot = await ParkingSpot.findById(newSpotId);
    if (!newSpot) {
      return res.status(404).json({ success: false, message: "New parking spot not found." });
    }

    if (newSpot.isOccupied) {
      return res.status(409).json({
        success: false,
        message: `Slot ${newSpot.slotNumber} is currently physically occupied. Choose a different slot.`,
      });
    }

    if (newSpot.isUnderMaintenance) {
      return res.status(409).json({
        success: false,
        message: `Slot ${newSpot.slotNumber} is under maintenance. Choose a different slot.`,
      });
    }

    // Time-overlap check on new spot
    const bookingDateNorm = new Date(booking.bookingDate);
    bookingDateNorm.setUTCHours(0, 0, 0, 0);

    const newStartMins = timeToMinutes(booking.arrivalTime);
    const newEndMins   = timeToMinutes(booking.leavingTime);

    const conflictingBookings = await ParkingBooking.find({
      spotId: newSpotId,
      status: { $in: ["active", "expired"] },
      bookingDate: {
        $gte: bookingDateNorm,
        $lt: new Date(bookingDateNorm.getTime() + 24 * 60 * 60 * 1000),
      },
    }).lean();

    for (const cb of conflictingBookings) {
      const exStart = timeToMinutes(cb.arrivalTime);
      const exEnd   = timeToMinutes(cb.leavingTime);
      if (exStart !== null && exEnd !== null && intervalsOverlap(newStartMins, newEndMins, exStart, exEnd)) {
        return res.status(409).json({
          success: false,
          message: `Slot ${newSpot.slotNumber} has a conflicting booking from ${cb.arrivalTime} to ${cb.leavingTime}. Choose another slot or time window.`,
        });
      }
    }

    // ── Perform the reassignment ──────────────────────────────────────────────
    const now = new Date();

    booking.originalSpotId     = booking.spotId;
    booking.originalSlotNumber = booking.slotNumber;
    booking.spotId             = newSpot._id;
    booking.slotNumber         = newSpot.slotNumber;
    booking.zone               = newSpot.zone;
    booking.newSlotId          = newSpot._id;
    booking.newSlotNumber      = newSpot.slotNumber;
    booking.status             = "active";
    booking.isReassigned       = true;
    booking.reassignedBy       = staffId;
    booking.reassignedAt       = now;

    await booking.save();

    // ── Notify User B of the reassignment (real-time + DB) ─────────────────────────
    try {
      await createStudentNotification(
        booking.studentId,
        "Parking Slot Reassigned 🔄",
        `Your parking slot has been reassigned to Slot ${newSpot.slotNumber} (${newSpot.zone}) by security due to overstay at your original slot (${booking.originalSlotNumber}). Please proceed to your new slot.`,
        "slot_reassigned",
        {
          originalSlotNumber: booking.originalSlotNumber,
          newSlotNumber: newSpot.slotNumber,
          newZone: newSpot.zone,
          reassignedBy: staffId,
          reassignedAt: now,
        }
      );
    } catch (notifErr) {
      console.error("[Notification] Failed to create slot_reassigned notification:", notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Booking successfully reassigned from ${booking.originalSlotNumber} to ${newSpot.slotNumber}.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};