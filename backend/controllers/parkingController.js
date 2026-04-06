import ParkingSpot from "../models/ParkingSpot.js";
import mongoose from "mongoose";


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

    // Single active booking check
    const userId = req.body.userId || 'Anonymous';
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

    // Clear occupied fields
    spot.isOccupied = false;
    spot.reservedBy = null;
    spot.bookingDate = null;
    spot.arrivalTime = null;
    spot.leavingTime = null;
    spot.vehicleNumber = null;

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

    const activeBooking = await ParkingSpot.findOne({
      reservedBy: studentId,
      isOccupied: true
    });

    if (!activeBooking) {
      // Return 404 to gracefully match the frontend's expected empty state parsing
      return res.status(404).json({ success: false, message: "No active parking booking found." });
    }

    res.status(200).json({ success: true, data: activeBooking });
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

    // Find the single active booking for this student
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

    spot.isOccupied = false;
    spot.reservedBy = null;
    spot.bookingDate = null;
    spot.arrivalTime = null;
    spot.leavingTime = null;
    spot.vehicleNumber = null;

    const updatedSpot = await spot.save();
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

    spot.isUnderMaintenance = !spot.isUnderMaintenance;

    const updatedSpot = await spot.save();
    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};