import mongoose from "mongoose";

const parkingSpotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^Z\d{2,4}-S\d{2}$/, 'Invalid slot format']
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  reservedBy: {
    type: String, // Hold raw student string ID
    default: null
  },
  bookingDate: {
    type: String,
    default: null
  },
  arrivalTime: {
    type: String,
    default: null
  },
  leavingTime: {
    type: String,
    default: null
  },
  locationCoords: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  zone: {
    type: String,
    enum: ['Zone 01', 'Zone 02', 'Zone 03', 'Zone 03.02', 'Zone 08', 'Zone 08.02'],
    default: 'Zone 01'
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Motorcycle', 'Bicycle'],
    default: 'Car'
  }
}, {
  timestamps: true
});

export default mongoose.model("ParkingSpot", parkingSpotSchema);
