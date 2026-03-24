import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  mapId: { type: mongoose.Schema.Types.ObjectId, ref: "LockerMap", required: true },
  lockerId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
