import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

const cleanupStudentParking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const studentId = 'IT23820678';
        console.log(`Cleaning up bookings and slot occupancy for ${studentId}...`);

        // 1. Delete all bookings for this student
        await mongoose.connection.db.collection('parkingbookings').deleteMany({ studentId });

        // 2. Clear occupancy from slots reserved by this student
        await mongoose.connection.db.collection('parkingslots').updateMany(
            { reservedBy: studentId },
            { 
                $set: { 
                    isOccupied: false, 
                    reservedBy: null, 
                    bookingDate: null, 
                    arrivalTime: null, 
                    leavingTime: null, 
                    vehicleNumber: null 
                } 
            }
        );

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Cleanup error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

cleanupStudentParking();
