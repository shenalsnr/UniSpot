import ParkingSpot from "../models/ParkingSpot.js";
import mongoose from "mongoose";

// @desc    Get all parking spots or filter by zone
// @route   GET /api/parking
// @access  Public
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

// @desc    Get a single parking spot by ID
// @route   GET /api/parking/:id
// @access  Public
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

// @desc    Create a new parking spot
// @route   POST /api/parking
// @access  Private/Admin
export const createParkingSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpot.create(req.body);
    res.status(201).json({ success: true, data: spot });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve a parking spot
// @route   PUT /api/parking/:id/reserve
// @access  Private
export const reserveParkingSpot = async (req, res, next) => {
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
        .json({ success: false, message: "Spot is already occupied" });
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

    const updatedSpot = await spot.save();
    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};

// @desc    Release a parking spot
// @route   PUT /api/parking/:id/release
// @access  Private
export const releaseParkingSpot = async (req, res, next) => {
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

    const updatedSpot = await spot.save();
    res.status(200).json({ success: true, data: updatedSpot });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a parking spot
// @route   DELETE /api/parking/:id
// @access  Private/Admin
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