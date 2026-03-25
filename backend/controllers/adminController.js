import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Student.findOne({ email: email.toLowerCase(), role: "admin" });

    if (!admin) {
      return res.status(400).json({ message: "Invalid admin email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin email or password" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students only
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one student by id
const getStudentDetailsById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block student
const blockStudent = async (req, res) => {
  try {
    const { blockReason } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = "blocked";
    student.blockReason = blockReason || "Blocked by admin";

    await student.save();

    res.json({ message: "Student blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock student
const unblockStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.status = "active";
    student.blockReason = "";

    await student.save();

    res.json({ message: "Student unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset marks
const resetStudentMarks = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.marks = 10;
    await student.save();

    res.json({ message: "Student marks reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  adminLogin,
  getAllStudents,
  getStudentDetailsById,
  blockStudent,
  unblockStudent,
  resetStudentMarks,
};