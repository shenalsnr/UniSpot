import mongoose from 'mongoose';
import Locker from '../models/LockerM/Locker.js';
import LockerBooking from '../models/LockerM/BookingModel.js';

// Set locker to maintenance mode (block)
export const setMaintenanceMode = async (req, res, next) => {
  try {
    const { lockerId } = req.params;
    const { reason, mapId } = req.body;

    if (!mapId) {
      return res.status(400).json({ success: false, message: 'mapId is required' });
    }

    const mapObjectId = new mongoose.Types.ObjectId(mapId);

    // First try to find existing locker
    let locker = await Locker.findOne({ id: lockerId, mapId: mapObjectId });

    if (!locker) {
      // Create new locker if it doesn't exist
      locker = new Locker({
        id: lockerId,
        mapId: mapObjectId,
        status: 'maintenance',
        maintenanceReason: reason || 'General maintenance',
        maintenanceStartTime: new Date()
      });
      await locker.save();
    } else {
      // Update existing locker
      locker.status = 'maintenance';
      locker.maintenanceReason = reason || 'General maintenance';
      locker.maintenanceStartTime = new Date();
      await locker.save();
    }

    res.json({
      success: true,
      message: `Locker ${lockerId} set to maintenance mode`,
      data: locker
    });
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    next(error);
  }
};

// Unblock locker (set back to available)
export const activateLocker = async (req, res, next) => {
  try {
    const { lockerId } = req.params;
    const { mapId } = req.body;

    if (!mapId) {
      return res.status(400).json({ success: false, message: 'mapId is required' });
    }

    console.log(`🔓 Unblocking locker ${lockerId} in map ${mapId}`);

    const mapObjectId = new mongoose.Types.ObjectId(mapId);

    const locker = await Locker.findOneAndUpdate(
      { id: lockerId, mapId: mapObjectId },
      {
        $set: {
          status: 'available',
          maintenanceReason: '',
          maintenanceStartTime: null,
          maintenanceEndTime: null
        },
        $setOnInsert: { id: lockerId, mapId: mapObjectId }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Locker ${lockerId} unblocked successfully`,
      data: locker
    });
  } catch (error) {
    console.error('Error unblocking locker:', error);
    next(error);
  }
};

// Get all lockers with status
export const getAllLockersWithStatus = async (req, res, next) => {
  try {
    const { mapId } = req.query;
    
    console.log(`📦 Getting lockers for map: ${mapId}`);
    
    let query = {};
    if (mapId) {
      query.mapId = mapId;
    }

    const lockers = await Locker.find(query).sort({ id: 1 });
    console.log(`📦 Found ${lockers.length} lockers in database`);

    // If no lockers found, generate mock data based on map
    if (lockers.length === 0 && mapId) {
      console.log('📦 No lockers found, generating mock data...');
      
      // Get map details to generate appropriate lockers
      const LockerMap = mongoose.model('LockerMap');
      const map = await LockerMap.findById(mapId);
      
      if (map) {
        const mockLockers = [];
        const rows = map.rows || 8;
        const cols = map.lockersPerRow || 8;
        
        for (let i = 0; i < rows; i++) {
          const rowLetter = String.fromCharCode(65 + i);
          for (let j = 1; j <= cols; j++) {
            mockLockers.push({
              id: `${rowLetter}${j}`,
              mapId: mapId,
              status: 'available',
              maintenanceReason: '',
              maintenanceStartTime: null,
              maintenanceEndTime: null
            });
          }
        }
        
        console.log(`📦 Generated ${mockLockers.length} mock lockers (${rows}x${cols})`);
        return res.json({
          success: true,
          data: mockLockers
        });
      }
    }

    // Fetch booking details for lockers
    const activeBookings = await LockerBooking.find({ 
      mapId, 
      status: 'active' 
    });

    // Merge booking details with lockers
    const lockersWithBookings = lockers.map(locker => {
      const booking = activeBookings.find(b => b.lockerId === locker.id);
      return {
        ...locker.toObject(),
        isBooked: !!booking,
        studentId: booking?.studentId || null,
        bookingDate: booking?.date || null,
        bookingStartTime: booking?.startTime || null,
        bookingEndTime: booking?.endTime || null
      };
    });

    console.log(`📦 Returning ${lockersWithBookings.length} lockers with booking details`);
    res.json({
      success: true,
      data: lockersWithBookings
    });
  } catch (error) {
    console.error('Error getting lockers:', error);
    next(error);
  }
};
