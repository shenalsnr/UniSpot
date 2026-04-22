import mongoose from 'mongoose';
import Student from '../models/Student.js';
import dotenv from 'dotenv';
dotenv.config();

async function findAdmins() {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await Student.find({ role: 'admin' });
    console.log('Admins found:', admins.map(a => ({ email: a.email, name: a.name })));
    mongoose.disconnect();
}

findAdmins();
