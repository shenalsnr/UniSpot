import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    regLetters: {
      type: String,
      uppercase: true,
      trim: true,
    },
    regNumbers: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      default: 10,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    blockReason: {
      type: String,
      default: "",
    },
    qrCode: {
      type: String,
      default: "",
    },
    vehicleRegistered: {
      type: Boolean,
      default: false,
    },
    vehicle: {
      type: vehicleSchema,
      default: null,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;