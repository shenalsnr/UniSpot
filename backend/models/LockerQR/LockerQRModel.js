import mongoose from "mongoose";

/**
 * LockerStation — represents a physical locker that can be assigned to students.
 * No QR codes are generated. Students are identified by their existing studentId.
 */
const lockerStationSchema = new mongoose.Schema({
  lockerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    default: "Main Building"
  },
  status: {
    type: String,
    enum: ["available", "assigned", "expired"],
    default: "available"
  },
  assignedTo: {
    type: String,       // studentId string (e.g. "IT21345678")
    default: null
  },
  assignedStudentName: {
    type: String,
    default: null
  },
  assignedStudentFaculty: {
    type: String,
    default: null
  },
  assignedStudentPhone: {
    type: String,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

lockerStationSchema.index({ status: 1 });
lockerStationSchema.index({ assignedTo: 1 });

export default mongoose.model("LockerStation", lockerStationSchema);
