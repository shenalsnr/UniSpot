import mongoose from "mongoose";

const lockerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
    // unique removed — compound index below handles uniqueness per map
  },
  mapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LockerMap',
    required: true
  },
  status: {
    type: String,
    enum: ["available", "booked", "maintenance"],
    default: "available"
  },
  maintenanceReason: {
    type: String,
    default: ""
  },
  maintenanceStartTime: {
    type: Date,
    default: null
  },
  maintenanceEndTime: {
    type: Date,
    default: null
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  }
}, {
  timestamps: true
});

// Compound unique: same lockerId can exist in different maps
lockerSchema.index({ id: 1, mapId: 1 }, { unique: true });

// Drop any existing single id index that might cause conflicts
lockerSchema.pre('save', async function() {
  try {
    const collection = this.constructor.collection;
    const indexes = await collection.indexes();
    const singleIdIndex = indexes.find(idx => idx.name === 'id_1' && !idx.key.mapId);
    if (singleIdIndex) {
      console.log('Dropping conflicting single id index');
      await collection.dropIndex('id_1');
    }
  } catch (error) {
    console.error('Error checking/dropping indexes:', error);
  }
});

export default mongoose.model("Locker", lockerSchema);
