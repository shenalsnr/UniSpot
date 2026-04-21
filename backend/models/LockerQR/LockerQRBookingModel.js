import mongoose from "mongoose";

/**
 * LockerAssignmentLog — keeps a history of all locker assignments.
 * Used for audit trail / reporting. The active assignment lives on LockerStation itself.
 */
const lockerAssignmentLogSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    default: ""
  },
  lockerNumber: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ["assigned", "released", "expired"],
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

lockerAssignmentLogSchema.index({ studentId: 1 });
lockerAssignmentLogSchema.index({ lockerNumber: 1 });

export default mongoose.model("LockerAssignmentLog", lockerAssignmentLogSchema);
