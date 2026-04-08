import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "booking_success",
        "booking_cancelled",
        "booking_reminder",
        "booking_expired",
        "maintenance_notice",
        "departure_confirmed",
        "penalty_applied",
        "student_blocked",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional structured context (slot number, zone, times, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast per-student queries
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
