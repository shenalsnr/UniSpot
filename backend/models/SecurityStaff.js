import mongoose from 'mongoose';

const SecurityStaffSchema = new mongoose.Schema(
  {
    staffID: {
      type: String,
      unique: true,
      required: true,
      // Format: ST-1001, ST-1002, etc.
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    nic: {
      type: String,
      required: [true, 'NIC is required'],
      validate: {
        validator: function (v) {
          return /^[0-9]{10,12}$/.test(v);
        },
        message: 'NIC must be 10 or 12 digits',
      },
    },
    designation: {
      type: String,
      enum: ['Security Guard', 'Supervisor'],
      required: [true, 'Designation is required'],
    },
    shift: {
      type: String,
      enum: ['Day', 'Night'],
      required: [true, 'Shift is required'],
    },
    gate: {
      type: String,
      enum: ['Gate A', 'Gate B'],
      required: [true, 'Gate is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Phone must be 10 digits',
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SecurityStaff', SecurityStaffSchema);
