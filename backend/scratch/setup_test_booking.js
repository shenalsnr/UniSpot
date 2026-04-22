import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env from backend
dotenv.config({ path: '../backend/.env' });

const setupTestBooking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const studentId = 'IT12345678';
        const now = new Date();
        
        // Formats for backend: HH:mm
        const formatTime = (date) => {
            return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        };

        const arrivalTimeDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        const leavingTimeDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

        const arrivalTimeStr = formatTime(arrivalTimeDate);
        const leavingTimeStr = formatTime(leavingTimeDate);

        // Find or create an Available slot
        let slot = await mongoose.connection.db.collection('parkingslots').findOne({
            isOccupied: false,
            isUnderMaintenance: false
        });

        if (!slot) {
            console.log('No slots found, creating a test slot...');
            const newSlot = {
                slotNumber: 'Z01-S99',
                zone: 'Zone 01',
                latitude: 6.9271,
                longitude: 79.8612,
                vehicleType: 'Car',
                isOccupied: false,
                isUnderMaintenance: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const insertResult = await mongoose.connection.db.collection('parkingslots').insertOne(newSlot);
            slot = { ...newSlot, _id: insertResult.insertedId };
        }

        // Clean existing bookings for this student to avoid conflicts
        await mongoose.connection.db.collection('parkingbookings').deleteMany({ studentId });

        // Create the booking in 'active' state so scanQR picks it up
        const booking = {
            studentId,
            studentName: 'LashanR', // Matching student ID in screenshot
            slotNumber: slot.slotNumber,
            spotId: slot._id,
            zone: slot.zone,
            vehicleType: slot.vehicleType || 'Car',
            arrivalTime: arrivalTimeStr, // HH:mm
            leavingTime: leavingTimeStr, // HH:mm
            status: 'active', 
            bookingDate: now.toISOString().split('T')[0], // YYYY-MM-DD
            actualArrivalTime: null,
            actualDepartureTime: null,
            createdAt: now,
            updatedAt: now
        };

        await mongoose.connection.db.collection('parkingbookings').insertOne(booking);
        
        console.log(JSON.stringify({
            success: true,
            studentId,
            slotNumber: slot.slotNumber
        }));

    } catch (err) {
        console.error('Error in setup script:', err);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

setupTestBooking();
