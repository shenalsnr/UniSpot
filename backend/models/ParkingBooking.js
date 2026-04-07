import mongoose from "mongoose";

const parkingBookingSchema = new mongoose.Schema(
  {
    // Student identifier
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Snapshot of the parking spot at booking time
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
    },
    slotNumber: {
      type: String,
      required: true,
      trim: true,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      default: null,
    },
    vehicleNumber: {
      type: String,
      default: null,
    },

    // Scheduled booking window
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

    // Lifecycle status
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },

    // Actual scan times recorded by Security QR scan
    actualArrivalTime: {
      type: Date,
      default: null,
    },
    actualDepartureTime: {
      type: Date,
      default: null,
    },

    // Reminder / expiry notification flags (prevents duplicate sends)
    reminderSent: {
      type: Boolean,
      default: false,
    },
    expiryNotifSent: {
      type: Boolean,
      default: false,
    },
    // Penalty flag: ensures points are only deducted once per expired booking
    penaltyApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for cleanup job queries
parkingBookingSchema.index({ studentId: 1, status: 1 });
parkingBookingSchema.index({ status: 1, bookingDate: 1 });

const ParkingBooking = mongoose.model("ParkingBooking", parkingBookingSchema);

export default ParkingBooking;
