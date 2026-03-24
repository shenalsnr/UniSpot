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
    const existing = await LockerBooking.findOne({ mapId, lockerId });
    if (existing) {
      return res.status(400).json({ message: "Locker is already booked." });
    }
    const newBooking = new LockerBooking({ mapId, lockerId, date, startTime, endTime });
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
    await LockerBooking.findOneAndDelete({ mapId, lockerId });
    res.json({ message: "Booking cancelled" });
  } catch (error) {
    next(error);
  }
};
