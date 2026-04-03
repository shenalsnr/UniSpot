import mongoose from "mongoose";
import LockerMap from "../models/LockerM/LockerModel.js";
import LockerBooking from "../models/LockerM/BookingModel.js";

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

    // Check if locker is already booked
    const existingBooking = await LockerBooking.findOne({ mapId, lockerId });
    if (existingBooking) {
      console.log("❌ Backend Debug - Locker already booked:", existingBooking);
      return res.status(400).json({ message: "Locker is already booked." });
    }

    // Check if student already has a booking (one locker per student rule)
    console.log("🔍 Backend Debug - Checking existing booking for student:", studentId);
    const studentBooking = await LockerBooking.findOne({ studentId });
    console.log("🔍 Backend Debug - Found student booking:", studentBooking);
    
    if (studentBooking) {
      console.log("❌ Backend Debug - Student already has booking, blocking");
      return res.status(400).json({ 
        message: "You have already booked a locker. Only one locker is allowed per student." 
      });
    }

    console.log("✅ Backend Debug - Creating new booking...");
    const newBooking = new LockerBooking({ 
      studentId, 
      mapId, 
      lockerId, 
      date, 
      startTime, 
      endTime 
    });
    await newBooking.save();
    console.log("✅ Backend Debug - Booking created successfully:", newBooking);
    res.json(newBooking);
  } catch (error) {
    console.error("❌ Backend Debug - Server error:", error);
    next(error);
  }
};

// Get bookings for a map
export const getBookingsByMap = async (req, res, next) => {
  try {
    const bookings = await LockerBooking.find({ mapId: req.params.mapId });
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

    // Check if student has any booking
    const studentBooking = await LockerBooking.findOne({ studentId });
    
    console.log("🔍 Debug - Student booking found:", studentBooking);
    
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
    const allBookings = await LockerBooking.find({});
    console.log("🔍 Debug - Total bookings found:", allBookings.length);
    console.log("🔍 Debug - All bookings:", allBookings);
    res.json(allBookings);
  } catch (error) {
    console.error("❌ Debug - Error fetching all bookings:", error);
    next(error);
  }
};

// Delete a booking
export const deleteBooking = async (req, res, next) => {
  try {
    const { mapId, lockerId } = req.params;
    
    console.log("🔍 Debug - Deleting booking for map:", mapId, "locker:", lockerId);
    
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    if (!studentId) {
      console.log("❌ Debug - No student ID found for deletion");
      return res.status(401).json({ message: "Student authentication required" });
    }
    
    console.log("🔍 Debug - Student attempting to delete booking:", studentId);

    // Find the booking and verify it belongs to the student
    const booking = await LockerBooking.findOne({ mapId, lockerId, studentId });
    if (!booking) {
      console.log("❌ Debug - Booking not found or not owned by student");
      return res.status(404).json({ 
        message: "Booking not found or you don't have permission to cancel this booking." 
      });
    }

    console.log("✅ Debug - Found booking to delete:", booking);
    await LockerBooking.findByIdAndDelete(booking._id);
    console.log("✅ Debug - Booking deleted successfully");
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("❌ Debug - Error deleting booking:", error);
    next(error);
  }
};
