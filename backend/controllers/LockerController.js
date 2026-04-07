import mongoose from "mongoose";
import LockerMap from "../models/LockerM/LockerModel.js";
import LockerBooking from "../models/LockerM/BookingModel.js";
import Locker from "../models/LockerM/Locker.js";
import Student from "../models/Student.js";
import { createStudentNotification } from "../utils/notificationHelper.js";

// Helper to expire outdated bookings strictly
export const expireOldBookings = async () => {
  try {
    // Optimized: Fetch without populate first to save memory and time
    const activeBookings = await LockerBooking.find({ status: "active" });
    const now = new Date();
    const toExpireIds = [];

    for (const booking of activeBookings) {
      if (!booking.date || !booking.endTime) continue;
      const bookingEndTimeObj = new Date(`${booking.date}T${booking.endTime}:00`);
      
      // 1. Send 1-Hour Reminder
      const oneHourBefore = new Date(bookingEndTimeObj.getTime() - 60 * 60 * 1000);
      if (now >= oneHourBefore && now < bookingEndTimeObj && !booking.reminderSent) {
        try {
          // Lazy-load student info only when a notification is actually triggered
          const studentRef = await Student.findById(booking.studentId).select("studentId").lean();
          if (studentRef && studentRef.studentId) {
            await createStudentNotification(
              studentRef.studentId,
              "Locker Expiry Reminder",
              `Reminder: Your booking for Locker ${booking.lockerId} will expire in 1 hour (${booking.endTime}).`,
              "booking_reminder",
              { lockerId: booking.lockerId, endTime: booking.endTime }
            );
            booking.reminderSent = true;
            await booking.save();
          }
        } catch (err) {
          console.error("❌ Reminder notification error:", err);
        }
      }

      // 2. Handle Expiry
      if (now > bookingEndTimeObj) {
        toExpireIds.push(booking._id);
        
        // Send Expiry Notification if not already sent
        if (!booking.expiryNotified) {
          try {
            // Lazy-load student info only when a notification is actually triggered
            const studentRef = await Student.findById(booking.studentId).select("studentId").lean();
            if (studentRef && studentRef.studentId) {
              await createStudentNotification(
                studentRef.studentId,
                "Locker Booking Expired",
                `Your booking for Locker ${booking.lockerId} has expired.`,
                "booking_expired",
                { lockerId: booking.lockerId, expiredAt: booking.endTime }
              );
              booking.expiryNotified = true;
              await booking.save();
            }
          } catch (err) {
            console.error("❌ Expiry notification error:", err);
          }
        }
      }
    }

    if (toExpireIds.length > 0) {
      await LockerBooking.updateMany(
        { _id: { $in: toExpireIds } },
        { $set: { status: "expired" } }
      );
      console.log(`[Validation] Auto-expired ${toExpireIds.length} bookings on-the-fly.`);
    }
  } catch (error) {
    console.error("[Validation Error] Failed expiring old bookings:", error);
  }
};

// Create Map
export const createMap = async (req, res, next) => {
  try {
    const newMap = new LockerMap(req.body);
    await newMap.save();
    res.json(newMap);
  } catch (error) {
    next(error);
  }
};

// Get All Maps
export const getMaps = async (req, res, next) => {
  try {
    const maps = await LockerMap.find();
    res.json(maps);
  } catch (error) {
    next(error);
  }
};

// Update Map
export const updateMap = async (req, res, next) => {
  try {
    const updated = await LockerMap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete Map
export const deleteMap = async (req, res, next) => {
  try {
    await LockerMap.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

// Create a booking
export const createBooking = async (req, res, next) => {
  try {
    const { mapId, lockerId, date, startTime, endTime } = req.body;
    
    console.log("🔍 Backend Debug - Request body:", req.body);
    
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    console.log("🔍 Backend Debug - Student ID from auth:", studentId);
    
    if (!studentId) {
      console.log("❌ Backend Debug - No student ID found");
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Validate booking time - must end before 10 PM
    const bookingEndTime = new Date(`${date}T${endTime}`);
    const maxEndTime = new Date(`${date}T22:00`);
    
    if (bookingEndTime > maxEndTime) {
      console.log("❌ Backend Debug - Time validation failed");
      return res.status(400).json({ 
        message: "Booking time must end before 10:00 PM" 
      });
    }

    // Check if locker is already booked (active only)
    const existingBooking = await LockerBooking.findOne({ mapId, lockerId, status: "active" });
    if (existingBooking) {
      console.log("❌ Backend Debug - Locker already booked:", existingBooking);
      return res.status(400).json({ message: "Locker is already booked and active." });
    }

    // Check if locker is under maintenance
    const locker = await Locker.findOne({ id: lockerId, mapId });
    if (locker && locker.status === 'maintenance') {
      console.log("❌ Backend Debug - Locker under maintenance:", locker);
      return res.status(400).json({ message: "Locker is under maintenance and cannot be booked." });
    }

    // Check if student already has a booking
    console.log("🔍 Backend Debug - Checking existing booking for student:", studentId);
    const studentBooking = await LockerBooking.findOne({ studentId, status: "active" });
    console.log("🔍 Backend Debug - Found student booking:", studentBooking);
    
    if (studentBooking) {
      console.log("❌ Backend Debug - Student already has active booking, blocking");
      return res.status(400).json({ 
        message: "You already have an active booking." 
      });
    }

    console.log("✅ Backend Debug - Creating new booking...");
    const newBooking = new LockerBooking({ 
      studentId, 
      mapId, 
      lockerId, 
      date, 
      startTime, 
      endTime,
      status: "active"
    });
    await newBooking.save();
    console.log("✅ Backend Debug - Booking created successfully:", newBooking);

    // Send Real-Time Notification
    try {
      const student = await Student.findById(studentId);
      if (student) {
        await createStudentNotification(
          student.studentId, // We use the student's string ID for notifications
          "Locker Booking Confirmed",
          `Success! Locker ${lockerId} is booked for ${date} (${startTime} - ${endTime}).`,
          "booking_success",
          { lockerId, date, startTime, endTime, bookingId: newBooking._id }
        );
      }
    } catch (notifErr) {
      console.error("❌ Error sending booking notification:", notifErr);
    }

    res.json(newBooking);
  } catch (error) {
    console.error("❌ Backend Debug - Server error:", error);
    next(error);
  }
};

const hydrateStudentInfo = async (booking) => {
  const bookingObj = booking.toObject ? booking.toObject() : { ...booking };
  let student = null;

  if (bookingObj.studentId) {
    if (typeof bookingObj.studentId === "object") {
      if (bookingObj.studentId.name) {
        student = bookingObj.studentId;
      } else if (bookingObj.studentId._id && mongoose.Types.ObjectId.isValid(bookingObj.studentId._id)) {
        student = await Student.findById(bookingObj.studentId._id).select("name studentId email faculty").lean();
      }
    } else {
      const studentIdValue = String(bookingObj.studentId);
      if (mongoose.Types.ObjectId.isValid(studentIdValue)) {
        student = await Student.findById(studentIdValue).select("name studentId email faculty").lean();
      }
    }
  }

  bookingObj.student = student || null;
  return bookingObj;
};

export const getBookingsByMap = async (req, res, next) => {
  try {
    const rawBookings = await LockerBooking.find({ mapId: req.params.mapId, status: "active" })
      .populate({
        path: "studentId",
        select: "name studentId email faculty",
        model: "Student"
      });
    const bookings = await Promise.all(rawBookings.map(hydrateStudentInfo));
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Check if student has current booking
export const getStudentCurrentBooking = async (req, res, next) => {
  try {
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    console.log("🔍 Debug - Student current booking check for student:", studentId);
    
    if (!studentId) {
      console.log("❌ Debug - No student ID in current booking check");
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Check if student has any active booking
    const studentBooking = await LockerBooking.findOne({ studentId, status: "active" });
    
    console.log("🔍 Debug - Student active booking found:", studentBooking);
    
    res.json({ 
      hasBooking: !!studentBooking,
      booking: studentBooking 
    });
  } catch (error) {
    console.error("❌ Debug - Error in student current booking check:", error);
    next(error);
  }
};

// Debug endpoint to check all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    console.log("🔍 Debug - Fetching all bookings from database");
    const rawBookings = await LockerBooking.find({})
      .populate({
        path: "studentId",
        select: "name studentId email faculty",
        model: "Student"
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    const allBookings = await Promise.all(rawBookings.map(hydrateStudentInfo));
    console.log("🔍 Debug - Total bookings found:", allBookings.length);
    console.log("🔍 Debug - Sample booking with student data:", JSON.stringify(allBookings[0], null, 2));
    console.log("🔍 Debug - Student model registered:", !!mongoose.models.Student);
    res.json(allBookings);
  } catch (error) {
    console.error("Debug - Error fetching all bookings:", error);
    next(error);
  }
};

// Get all bookings for the authenticated student
export const getStudentBookings = async (req, res, next) => {
  try {
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    console.log("Fetching bookings for student:", studentId);
    
    if (!studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Find all bookings for this student (both active and expired)
    const rawBookings = await LockerBooking.find({ studentId })
      .populate({
        path: "studentId",
        select: "name studentId email faculty",
        model: "Student"
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Get location names for each booking
    const bookingsWithLocation = await Promise.all(
      rawBookings.map(async (booking) => {
        const bookingObj = await hydrateStudentInfo(booking);
        
        // Get location name from map
        if (bookingObj.mapId) {
          try {
            const map = await LockerMap.findById(bookingObj.mapId).select('locationName').lean();
            bookingObj.locationName = map?.locationName || 'Unknown Location';
          } catch (err) {
            bookingObj.locationName = 'Unknown Location';
          }
        } else {
          bookingObj.locationName = 'Unknown Location';
        }
        
        return bookingObj;
      })
    );
    
    console.log(`Found ${bookingsWithLocation.length} bookings for student ${studentId}`);
    res.json(bookingsWithLocation);
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    next(error);
  }
};

// Delete a booking by ID (for cancellation from MyBookLocker page)
export const deleteBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    if (!studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    console.log(`Student ${studentId} attempting to cancel booking ${bookingId}`);

    // Find the booking and verify it belongs to the student
    const booking = await LockerBooking.findOne({ _id: bookingId, studentId });
    if (!booking) {
      return res.status(404).json({ 
        message: "Booking not found or you don't have permission to cancel this booking." 
      });
    }

    await LockerBooking.findByIdAndDelete(bookingId);
    console.log(`Booking ${bookingId} cancelled successfully by student ${studentId}`);
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    next(error);
  }
};

// Delete a booking
export const deleteBooking = async (req, res, next) => {
  try {
    const { mapId, lockerId } = req.params;
    
    console.log("Deleting booking for map:", mapId, "locker:", lockerId);
    
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    if (!studentId) {
      console.log("No student ID found for deletion");
      return res.status(401).json({ message: "Student authentication required" });
    }
    
    console.log("Student attempting to delete booking:", studentId);

    // Find the active booking and verify it belongs to the student
    const booking = await LockerBooking.findOne({ mapId, lockerId, studentId, status: "active" });
    if (!booking) {
      console.log("Booking not found or not owned by student");
      return res.status(404).json({ 
        message: "Booking not found or you don't have permission to cancel this booking." 
      });
    }

    console.log("Found booking to delete:", booking);
    await LockerBooking.findByIdAndDelete(booking._id);
    console.log("Booking deleted successfully");
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    next(error);
  }
};
