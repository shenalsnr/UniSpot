import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ 
    path: path.join(__dirname, '../.env'),
    quiet: true 
});

async function getOtp() {
    const studentId = process.argv[2];
    if (!studentId) {
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await mongoose.connection.db
            .collection('students')
            .findOne({ studentId: studentId.toUpperCase() });
        
        if (student && student.otpCode) {
            process.stdout.write(student.otpCode);
        }
        await mongoose.disconnect();
    } catch (err) {
        process.exit(1);
    }
}

getOtp();
