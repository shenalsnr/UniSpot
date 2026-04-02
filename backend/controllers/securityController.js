import SecurityStaff from '../models/SecurityStaff.js';
import ParkingSpot from '../models/ParkingSpot.js';

// AUTO-ID GENERATION LOGIC
const generateStaffID = async () => {
  try {
    const lastStaff = await SecurityStaff.findOne().sort({ _id: -1 });

    if (!lastStaff || !lastStaff.staffID) {
      return 'ST-1001';
    }

    // Extract number from ST-XXXX format and increment
    const lastNumber = parseInt(lastStaff.staffID.split('-')[1]) || 1000;
    const newNumber = lastNumber + 1;

    return `ST-${newNumber}`;
  } catch (error) {
    throw new Error('Error generating Staff ID: ' + error.message);
  }
};

// CREATE - Add new security staff
const createStaff = async (req, res) => {
  try {
    const { name, nic, designation, shift, gate, phone, status } = req.body;

    // Validation
    if (!name || !nic || !designation || !shift || !gate || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Generate Auto Staff ID
    const staffID = await generateStaffID();

    const newStaff = new SecurityStaff({
      staffID,
      name,
      nic,
      designation,
      shift,
      gate,
      phone,
      status: status || 'Active',
    });

    await newStaff.save();

    res.status(201).json({
      message: 'Security staff created successfully',
      data: newStaff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ - Get all security staff
const getAllStaff = async (req, res) => {
  try {
    const staff = await SecurityStaff.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Security staff retrieved successfully',
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ - Get single staff by ID
const getStaffByID = async (req, res) => {
  try {
    const { staffID } = req.params;

    const staff = await SecurityStaff.findOne({ staffID });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({
      message: 'Staff retrieved successfully',
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE - Update staff information
const updateStaff = async (req, res) => {
  try {
    const { staffID } = req.params;
    const updateData = req.body;

    const updatedStaff = await SecurityStaff.findOneAndUpdate(
      { staffID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({
      message: 'Staff updated successfully',
      data: updatedStaff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - Delete staff record
const deleteStaff = async (req, res) => {
  try {
    const { staffID } = req.params;

    const deletedStaff = await SecurityStaff.findOneAndDelete({ staffID });

    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({
      message: 'Staff deleted successfully',
      data: deletedStaff,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// QR VERIFICATION - Fetch student details when QR is scanned
const verifyQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }

    // Search for parking record with matching QR or student info
    const parkingRecord = await ParkingSpot.findOne({
      $or: [
        { qrCode: qrData },
        { studentID: qrData },
      ],
    });

    if (!parkingRecord) {
      return res.status(404).json({
        message: 'No parking record found for this QR code',
      });
    }

    res.status(200).json({
      message: 'QR verified successfully',
      data: {
        studentName: parkingRecord.studentName || 'N/A',
        studentID: parkingRecord.studentID || 'N/A',
        vehicleNo: parkingRecord.vehicleNo || 'N/A',
        assignedSlot: parkingRecord.slotNumber || 'N/A',
        status: parkingRecord.status || 'Unknown',
        parkingDate: parkingRecord.bookingDate || 'N/A',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createStaff,
  getAllStaff,
  getStaffByID,
  updateStaff,
  deleteStaff,
  verifyQRCode,
};
