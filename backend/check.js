import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
  const db = mongoose.connection;
  const spots = await db.collection('parkingspots').find({ isOccupied: true }).toArray();
  console.log(JSON.stringify(spots, null, 2));
  process.exit(0);
}

run();
