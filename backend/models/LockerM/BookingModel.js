import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  mapId: { type: mongoose.Schema.Types.ObjectId, ref: "LockerMap", required: true },
  lockerId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ["active", "expired"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
