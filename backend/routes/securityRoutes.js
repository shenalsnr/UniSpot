import express from 'express';
import securityController from '../controllers/securityController.js';

const router = express.Router();

// CRUD Endpoints
router.post('/staff', securityController.createStaff); // Create staff
router.get('/staff', securityController.getAllStaff); // Get all staff
router.get('/staff/:staffID', securityController.getStaffByID); // Get single staff
router.put('/staff/:staffID', securityController.updateStaff); // Update staff
router.delete('/staff/:staffID', securityController.deleteStaff); // Delete staff

// QR Verification Endpoint
router.post('/verify-qr', securityController.verifyQRCode);

export default router;
