import mongoose from "mongoose";

const parkingSpotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isOccupied: {
      type: Boolean,
      default: false,
    },

    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },

    reservedBy: {
      type: String,
      default: null,
    },

    vehicleNumber: {
      type: String,
      default: null,
    },

    bookingDate: {
      type: Date,
      default: null,
    },

    arrivalTime: {
      type: String,
      default: null,
    },

    leavingTime: {
      type: String,
      default: null,
    },

    locationCoords: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    zone: {
      type: String,
      required: true,
      trim: true,
      enum: ["Zone 01", "Zone 02", "Zone 03", "Zone 03.02", "Zone 08", "Zone 08.02"],
    },

    vehicleType: {
      type: String,
      enum: ["Car", "Motorcycle", "Bicycle"],
      default: "Car",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ParkingSpot", parkingSpotSchema);