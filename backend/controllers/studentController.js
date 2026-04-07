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
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

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

    if (email) {
      const formattedEmail = email.toLowerCase().trim();

      if (!isValidEmail(formattedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address",
        });
      }

      const emailExists = await Student.findOne({ email: formattedEmail });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const studentExists = await Student.findOne({ studentId: formattedStudentId });
    if (studentExists) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const photoPath = `/uploads/${req.file.filename}`;
    const qrCodeData = await QRCode.toDataURL(formattedStudentId);

    const student = await Student.create({
      name: name.trim(),
      studentId: formattedStudentId,
      phone: phone.trim(),
      address: address.trim(),
      faculty: faculty.trim(),
      email: email ? email.toLowerCase().trim() : "",
      password: hashedPassword,
      photo: photoPath,
      qrCode: qrCodeData,
      role: "student",
      marks: 10,
      status: "active",
      profileUpdatedAt: new Date(),
      passwordChangedAt: new Date(),
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
      role: student.role,
      marks: student.marks,
      status: student.status,
      vehicleRegistered: student.vehicleRegistered,
      createdAt: student.createdAt,
      profileUpdatedAt: student.profileUpdatedAt,
      vehicleUpdatedAt: student.vehicleUpdatedAt,
      passwordChangedAt: student.passwordChangedAt,
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
      role: student.role,
      marks: student.marks,
      status: student.status,
      blockReason: student.blockReason,
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
      createdAt: student.createdAt,
      profileUpdatedAt: student.profileUpdatedAt,
      vehicleUpdatedAt: student.vehicleUpdatedAt,
      passwordChangedAt: student.passwordChangedAt,
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
      student.name = name.trim();
    }

    if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          message: "Phone number must contain 10 digits and start with 0",
        });
      }
      student.phone = phone.trim();
    }

    if (address) {
      if (address.trim().length < 5) {
        return res.status(400).json({ message: "Address is too short" });
      }
      student.address = address.trim();
    }

    if (faculty) student.faculty = faculty.trim();

    if (typeof email === "string") {
      const formattedEmail = email.toLowerCase().trim();

      if (!formattedEmail) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!isValidEmail(formattedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address",
        });
      }

      const emailExists = await Student.findOne({
        email: formattedEmail,
        _id: { $ne: student._id },
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      student.email = formattedEmail;
    }

    if (req.file) {
      student.photo = `/uploads/${req.file.filename}`;
    }

    student.profileUpdatedAt = new Date();

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
        role: updatedStudent.role,
        marks: updatedStudent.marks,
        status: updatedStudent.status,
        vehicleRegistered: updatedStudent.vehicleRegistered,
        vehicle: updatedStudent.vehicle,
        createdAt: updatedStudent.createdAt,
        profileUpdatedAt: updatedStudent.profileUpdatedAt,
        vehicleUpdatedAt: updatedStudent.vehicleUpdatedAt,
        passwordChangedAt: updatedStudent.passwordChangedAt,
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

    const formattedLetters = regLetters.toUpperCase().trim();
    const formattedNumbers = regNumbers.trim();

    if (!isValidVehicleLetters(formattedLetters)) {
      return res.status(400).json({
        message: "Vehicle letters must contain 2 or 3 English letters only",
      });
    }

    if (!isValidVehicleNumbers(formattedNumbers)) {
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
      model: model.trim(),
      color: color.trim(),
      regLetters: formattedLetters,
      regNumbers: formattedNumbers,
    };
    student.vehicleUpdatedAt = new Date();

    await student.save();

    res.json({
      message: "Vehicle saved successfully",
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
      vehicleUpdatedAt: student.vehicleUpdatedAt,
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
    student.vehicleUpdatedAt = new Date();

    await student.save();

    res.json({ message: "Vehicle removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request password OTP
const requestPasswordOtp = async (req, res) => {
  try {
    const { studentId, phone } = req.body;

    if (!studentId || !phone) {
      return res.status(400).json({ message: "Student ID and phone number are required" });
    }

    const formattedStudentId = studentId.toUpperCase();

    const student = await Student.findOne({
      studentId: formattedStudentId,
      phone: phone.trim(),
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found with matching phone number",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    student.otpCode = otp;
    student.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await student.save();

    console.log(`OTP for ${student.studentId}: ${otp}`);

    res.json({
      message: "OTP generated successfully. Check backend terminal for demo OTP.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password with OTP
const resetPasswordWithOtp = async (req, res) => {
  try {
    const { studentId, phone, otp, newPassword } = req.body;

    if (!studentId || !phone || !otp || !newPassword) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const formattedStudentId = studentId.toUpperCase();

    const student = await Student.findOne({
      studentId: formattedStudentId,
      phone: phone.trim(),
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.otpCode || student.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!student.otpExpires || student.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    student.otpCode = "";
    student.otpExpires = null;
    student.passwordChangedAt = new Date();

    await student.save();

    res.json({
      message: "Password reset successfully",
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      phone: student.phone,
      address: student.address,
      faculty: student.faculty,
      email: student.email,
      photo: student.photo,
      qrCode: student.qrCode,
      role: student.role,
      marks: student.marks,
      status: student.status,
      blockReason: student.blockReason,
      vehicleRegistered: student.vehicleRegistered,
      vehicle: student.vehicle,
      createdAt: student.createdAt,
      profileUpdatedAt: student.profileUpdatedAt,
      vehicleUpdatedAt: student.vehicleUpdatedAt,
      passwordChangedAt: student.passwordChangedAt,
      token: generateToken(student._id),
    });
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
      role: student.role,
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

// Delete student profile
const deleteStudentProfile = async (req, res) => {
  try {
    const studentId = req.student._id;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    res.json({
      message: "Account deleted successfully. We're sorry to see you go!",
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
  requestPasswordOtp,
  resetPasswordWithOtp,
  getStudentByQr,
  deleteStudentProfile,
};