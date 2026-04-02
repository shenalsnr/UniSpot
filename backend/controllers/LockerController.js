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
    
    // Get student ID from authenticated user (assuming auth middleware is used)
    const studentId = req.student?._id || req.user?._id;
    
    if (!studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Validate booking time - must end before 10 PM
    const bookingEndTime = new Date(`${date}T${endTime}`);
    const maxEndTime = new Date(`${date}T22:00`);
    
    if (bookingEndTime > maxEndTime) {
      return res.status(400).json({ 
        message: "Booking time must end before 10:00 PM" 
      });
    }

    // Check if locker is already booked
    const existingBooking = await LockerBooking.findOne({ mapId, lockerId });
    if (existingBooking) {
      return res.status(400).json({ message: "Locker is already booked." });
    }

    // Check if student already has a booking (one locker per student rule)
    const studentBooking = await LockerBooking.findOne({ studentId });
    if (studentBooking) {
      return res.status(400).json({ 
        message: "You can only book one locker at a time. Please cancel your existing booking first." 
      });
    }

    const newBooking = new LockerBooking({ 
      studentId, 
      mapId, 
      lockerId, 
      date, 
      startTime, 
      endTime 
    });
    await newBooking.save();
    res.json(newBooking);
  } catch (error) {
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

// Delete a booking
export const deleteBooking = async (req, res, next) => {
  try {
    const { mapId, lockerId } = req.params;
    
    // Get student ID from authenticated user
    const studentId = req.student?._id || req.user?._id;
    
    if (!studentId) {
      return res.status(401).json({ message: "Student authentication required" });
    }

    // Find the booking and verify it belongs to the student
    const booking = await LockerBooking.findOne({ mapId, lockerId, studentId });
    if (!booking) {
      return res.status(404).json({ 
        message: "Booking not found or you don't have permission to cancel this booking." 
      });
    }

    await LockerBooking.findByIdAndDelete(booking._id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    next(error);
  }
};
