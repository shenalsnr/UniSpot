import express from 'express';
const router = express.Router();
import { setMaintenanceMode, activateLocker, getAllLockersWithStatus } from '../controllers/LockerMaintenanceController.js';

// GET /api/lockers?mapId=... - Get all lockers with status for a map
router.get('/', getAllLockersWithStatus);

// PATCH /api/lockers/:lockerId/block  → set status = "maintenance"
router.patch('/:lockerId/block', setMaintenanceMode);

// PATCH /api/lockers/:id/maintenance  (legacy alias)
router.patch('/:id/maintenance', setMaintenanceMode);

// PATCH /api/lockers/:lockerId/unblock → set status = "available"
router.patch('/:lockerId/unblock', activateLocker);

export default router;
