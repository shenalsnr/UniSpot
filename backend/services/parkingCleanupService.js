import ParkingSpot from "../models/ParkingSpot.js";
import ParkingBooking from "../models/ParkingBooking.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";

/**
 * Parking Cleanup Service
 *
 * Runs every 60 seconds and handles the booking lifecycle:
 *
 * 1. PRE-EXPIRY REMINDER (30 min before scheduled end):
 *    Creates a booking_reminder notification (subtype: expiring_soon)
 *
 * 2. EXPIRY (booking end time passed with no departure scan):
 *    ── IMPORTANT: does NOT auto-release the slot. The slot stays occupied
 *       until Security scans QR for departure OR admin manually releases it.
 *    - Sets ParkingBooking status → 'expired'
 *    - Creates a booking_expired notification
 *    - Deducts 2 parking points from the student (once only, via penaltyApplied flag)
 *    - Creates a penalty_applied notification
 *    - If student points reach 0: sets status → 'blocked', creates student_blocked notification
 */

const PENALTY_POINTS = 2;

// ─── Helper: build booking end datetime from stored date + HH:MM leavingTime ─
const getBookingEndDateTime = (bookingDate, leavingTime) => {
  try {
    const date = new Date(bookingDate);
    const [hours, minutes] = leavingTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch {
    return null;
  }
};

export const startParkingCleanupJob = () => {
  console.log("[Parking Service] Booking lifecycle job initialized. Running every 60 seconds.");

  const runCleanup = async () => {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      // Fetch all active bookings
      const activeBookings = await ParkingBooking.find({ status: "active" }).lean();

      for (const booking of activeBookings) {
        if (!booking.bookingDate || !booking.leavingTime) continue;

        const endTime = getBookingEndDateTime(booking.bookingDate, booking.leavingTime);
        if (!endTime) continue;

        // ──────────────────────────────────────────────────────────────────────
        // 1. EXPIRY: scheduled leaving time has passed, no departure scan exists
        // ──────────────────────────────────────────────────────────────────────
        if (endTime <= now) {
          try {
            // Mark booking as expired (idempotent — only runs once per booking
            // because the query above filters status === 'active')
            await ParkingBooking.findByIdAndUpdate(booking._id, {
              $set: { status: "expired", expiryNotifSent: true },
            });

            // ── CRITICAL: do NOT release the slot ────────────────────────────
            // The vehicle may still be physically parked.
            // Slot release only happens via:
            //   a) Security QR departure scan  (securityScanQR controller)
            //   b) Admin manually releases     (releaseParkingSpot controller)
            // ─────────────────────────────────────────────────────────────────

            // Notify student: booking expired
            await Notification.create({
              userId: booking.studentId,
              title: "Parking Booking Expired ⏰",
              message: `Your parking booking for slot ${booking.slotNumber} (${booking.zone}) has expired without confirmed departure. The slot will remain reserved until Security confirms your departure.`,
              type: "booking_expired",
              metadata: {
                slotNumber: booking.slotNumber,
                zone: booking.zone,
                scheduledEnd: endTime,
              },
            });

            // ── PENALTY: deduct points (only once per booking) ────────────────
            if (!booking.penaltyApplied) {
              await ParkingBooking.findByIdAndUpdate(booking._id, {
                $set: { penaltyApplied: true },
              });

              // Fetch student for current points
              const student = await Student.findOne({ studentId: booking.studentId });
              if (student) {
                const newPoints = Math.max(0, (student.marks ?? 10) - PENALTY_POINTS);
                const willBeBlocked = newPoints <= 0;

                const updateData = { marks: newPoints };
                if (willBeBlocked) {
                  updateData.status = "blocked";
                  updateData.blockReason = "Parking privileges suspended: parking points reached 0 due to expired bookings without departure confirmation.";
                }

                await Student.findOneAndUpdate(
                  { studentId: booking.studentId },
                  { $set: updateData }
                );

                // Notify: penalty applied
                await Notification.create({
                  userId: booking.studentId,
                  title: "Parking Penalty Applied ⚠️",
                  message: `${PENALTY_POINTS} parking points have been deducted due to expired parking without departure confirmation. Remaining points: ${newPoints}/10.`,
                  type: "penalty_applied",
                  metadata: {
                    slotNumber: booking.slotNumber,
                    zone: booking.zone,
                    pointsDeducted: PENALTY_POINTS,
                    remainingPoints: newPoints,
                  },
                });

                // Notify: student blocked (if points hit 0)
                if (willBeBlocked) {
                  await Notification.create({
                    userId: booking.studentId,
                    title: "Parking Access Suspended 🚫",
                    message: "Your parking privileges have been suspended because your parking points have reached 0. Please contact administration to restore access.",
                    type: "student_blocked",
                    metadata: {
                      remainingPoints: 0,
                    },
                  });
                }

                console.log(
                  `[Parking Service] Penalty applied: ${booking.studentId} | ${booking.slotNumber} | Points: ${student.marks} → ${newPoints}${willBeBlocked ? " | BLOCKED" : ""}`
                );
              }
            }

            console.log(`[Parking Service] Booking expired (slot NOT released): ${booking.slotNumber} | Student: ${booking.studentId}`);
          } catch (err) {
            console.error(`[Parking Service] Error processing expiry for booking ${booking._id}:`, err.message);
          }
          continue; // Skip reminder check for this booking
        }

        // ──────────────────────────────────────────────────────────────────────
        // 2. PRE-EXPIRY REMINDER: within 30 minutes of scheduled end time
        // ──────────────────────────────────────────────────────────────────────
        if (
          endTime > now &&
          endTime <= thirtyMinutesFromNow &&
          !booking.reminderSent
        ) {
          try {
            await ParkingBooking.findByIdAndUpdate(booking._id, {
              $set: { reminderSent: true },
            });

            await Notification.create({
              userId: booking.studentId,
              title: "Parking Reminder ⏳",
              message: `Reminder: Your parking booking for slot ${booking.slotNumber} (${booking.zone}) will end soon. Please show your QR to security when departing.`,
              type: "booking_reminder",
              metadata: {
                subtype: "expiring_soon",
                slotNumber: booking.slotNumber,
                zone: booking.zone,
                scheduledEnd: endTime,
              },
            });

            console.log(`[Parking Service] Reminder sent: ${booking.slotNumber} | Student: ${booking.studentId}`);
          } catch (err) {
            console.error(`[Parking Service] Error sending reminder for booking ${booking._id}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error("[Parking Service] Cleanup job error:", err.message);
    }
  };

  // Run immediately on server start, then every 60 seconds
  runCleanup();
  setInterval(runCleanup, 60 * 1000);
};
