import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Validation helpers
const isValidStudentId = (studentId) => /^(IT|BM)\d{8}$/.test(studentId);
const isValidPhone = (phone) => /^0\d{9}$/.test(phone);
const isValidVehicleLetters = (letters) => /^[A-Z]{2,3}$/.test(letters);
const isValidVehicleNumbers = (numbers) => /^\d{4}$/.test(numbers);
const isValidName = (name) => /^[A-Za-z\s]{3,}$/.test(name.trim());

// Register student
const registerStudent = async (req, res) => {
  try {
    const { name, studentId, phone, address, faculty, email, password } = req.body;

    if (!name || !studentId || !phone || !address || !faculty || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Student photo is required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({
        message: "Name must contain at least 3 letters and only letters/spaces",
      });
    }

    const formattedStudentId = studentId.toUpperCase();

    if (!isValidStudentId(formattedStudentId)) {
      return res.status(400).json({
        message: "Student ID must start with IT or BM and contain 8 digits",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "Phone number must contain 10 digits and start with 0",
      });
    }

    if (address.trim().length < 5) {
      return res.status(400).json({ message: "Address is too short" });
    }

    const studentExists = await Student.findOne({ studentId: formattedStudentId });
    if (studentExists) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    if (email) {
      const emailExists = await Student.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photoPath = `/uploads/${req.file.filename}`;
    const qrCodeData = await QRCode.toDataURL(formattedStudentId);

    const student = await Student.create({
      name,
      studentId: formattedStudentId,
      phone,
      address,
      faculty,
      email: email ? email.toLowerCase() : "",
      password: hashedPassword,
      photo: photoPath,
      qrCode: qrCodeData,
      marks: 10,
      status: "active",
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      phone: student.phone,
      address: student.address,
      faculty: student.faculty,
      email: student.email,
      photo: student.photo,
      qrCode: student.qrCode,
      marks: student.marks,
      status: student.status,
      vehicleRegistered: student.vehicleRegistered,
      token: generateToken(student._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login student
const loginStudent = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: "Please enter student ID and password" });
    }

    const formattedStudentId = studentId.toUpperCase();
    const student = await Student.findOne({ studentId: formattedStudentId });

    if (!student) {
      return res.status(400).json({ message: "Invalid student ID or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid student ID or password" });
    }

    res.json({
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      phone: student.phone,
      address: student.address,
      faculty: student.faculty,
      email: student.email,
      photo: student.photo,
      qrCode: student.qrCode,
      marks: student.marks,
      status: student.status,
      blockReason: student.blockReason,
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
      token: generateToken(student._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { name, phone, address, faculty, email } = req.body;

    if (name) {
      if (!isValidName(name)) {
        return res.status(400).json({
          message: "Name must contain at least 3 letters and only letters/spaces",
        });
      }
      student.name = name;
    }

    if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          message: "Phone number must contain 10 digits and start with 0",
        });
      }
      student.phone = phone;
    }

    if (address) {
      if (address.trim().length < 5) {
        return res.status(400).json({ message: "Address is too short" });
      }
      student.address = address;
    }

    if (faculty) student.faculty = faculty;
    if (email) student.email = email.toLowerCase();
    if (req.file) student.photo = `/uploads/${req.file.filename}`;

    const updatedStudent = await student.save();

    res.json({
      message: "Profile updated successfully",
      student: {
        _id: updatedStudent._id,
        name: updatedStudent.name,
        studentId: updatedStudent.studentId,
        phone: updatedStudent.phone,
        address: updatedStudent.address,
        faculty: updatedStudent.faculty,
        email: updatedStudent.email,
        photo: updatedStudent.photo,
        qrCode: updatedStudent.qrCode,
        marks: updatedStudent.marks,
        status: updatedStudent.status,
        vehicleRegistered: updatedStudent.vehicleRegistered,
        vehicle: updatedStudent.vehicle,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update vehicle
const addOrUpdateVehicle = async (req, res) => {
  try {
    const { model, color, regLetters, regNumbers } = req.body;

    if (!model || !color || !regLetters || !regNumbers) {
      return res.status(400).json({ message: "Please fill all vehicle fields" });
    }

    const formattedLetters = regLetters.toUpperCase();

    if (!isValidVehicleLetters(formattedLetters)) {
      return res.status(400).json({
        message: "Vehicle letters must contain 2 or 3 English letters only",
      });
    }

    if (!isValidVehicleNumbers(regNumbers)) {
      return res.status(400).json({
        message: "Vehicle numbers must contain exactly 4 digits",
      });
    }

    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.vehicleRegistered = true;
    student.vehicle = {
      model,
      color,
      regLetters: formattedLetters,
      regNumbers,
    };

    await student.save();

    res.json({
      message: "Vehicle saved successfully",
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove vehicle
const removeVehicle = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.vehicleRegistered = false;
    student.vehicle = null;

    await student.save();

    res.json({ message: "Vehicle removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// QR scan details
const getStudentByQr = async (req, res) => {
  try {
    const { studentId } = req.params;
    const formattedStudentId = studentId.toUpperCase();

    const student = await Student.findOne({ studentId: formattedStudentId }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      name: student.name,
      studentId: student.studentId,
      faculty: student.faculty,
      photo: student.photo,
      marks: student.marks,
      status: student.status,
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
      qrCode: student.qrCode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
  addOrUpdateVehicle,
  removeVehicle,
  getStudentByQr,
};