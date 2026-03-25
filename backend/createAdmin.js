import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Student from "./models/Student.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Student.findOne({ email: "admin@unispot.com", role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Student.create({
      name: "System Admin",
      studentId: "AD00000001",
      phone: "0700000000",
      address: "Admin Office",
      faculty: "Administration",
      photo: "/uploads/default-admin.png",
      email: "admin@unispot.com",
      password: hashedPassword,
      role: "admin",
      marks: 10,
      status: "active",
      blockReason: "",
      qrCode: "",
      vehicleRegistered: false,
      vehicle: null,
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

createAdmin();