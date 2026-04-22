import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

const cleanupTestBooking = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const studentId = 'IT12345678';
        await mongoose.connection.db.collection('parkingbookings').deleteMany({ studentId });
        console.log(`Cleaned up bookings for ${studentId}`);
    } catch (err) {
        console.error('Cleanup error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

cleanupTestBooking();
