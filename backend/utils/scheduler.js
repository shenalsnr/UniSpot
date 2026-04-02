import cron from 'node-cron';
import { autoExpireBookings } from './bookingCleanup.js';

// Schedule auto-expire task to run daily at 10:05 PM
export const startScheduler = () => {
  console.log("Starting booking scheduler...");
  
  // Run every day at 10:05 PM (5 minutes after 10 PM to ensure all bookings are processed)
  cron.schedule('5 22 * * *', async () => {
    console.log('Running auto-expire bookings job at 10:05 PM');
    await autoExpireBookings();
  });
  
  console.log("Scheduler started - auto-expire will run daily at 10:05 PM");
};
