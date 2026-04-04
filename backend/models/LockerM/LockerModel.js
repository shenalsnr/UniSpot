import mongoose from "mongoose";

const lockerMapSchema = new mongoose.Schema({
  locationName: String,
  rows: Number,
  lockersPerRow: Number
}, {
  timestamps: true
});

export default mongoose.model("LockerMap", lockerMapSchema);
