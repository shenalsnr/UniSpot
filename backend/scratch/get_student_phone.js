import mongoose from 'mongoose';
import Student from '../models/Student.js';
import dotenv from 'dotenv';
dotenv.config();

async function getStudentPhone() {
    await mongoose.connect(process.env.MONGO_URI);
    const student = await Student.findOne({ studentId: 'IT12345678' });
    if (student) {
        console.log(`Phone for ${student.studentId}: ${student.phone}`);
    } else {
        console.log('Student not found');
    }
    mongoose.disconnect();
}

getStudentPhone();
