import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

const prepStudentForAdminTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const studentId = 'IT23820678';
        console.log(`Setting student ${studentId} to Active for test...`);

        // Ensure student exists and is active
        const result = await mongoose.connection.db.collection('students').updateOne(
            { studentId },
            { 
                $set: { 
                    status: 'active', 
                    blockReason: '' 
                } 
            }
        );

        if (result.matchedCount === 0) {
            console.error(`ERROR: Student ${studentId} not found in database.`);
            process.exit(1);
        }

        console.log('Setup complete.');
    } catch (err) {
        console.error('Setup error:', err);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

prepStudentForAdminTest();
