import LockerBooking from "../models/LockerM/BookingModel.js";

// Auto-expire all bookings at 10 PM daily
export const autoExpireBookings = async () => {
  try {
    console.log("Running auto-expire bookings task...");
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Find all active bookings for today
    const bookings = await LockerBooking.find({ date: today });
    
    let expiredCount = 0;
    
    for (const booking of bookings) {
      const bookingEndTime = new Date(`${booking.date}T${booking.endTime}`);
      
      // Check if booking end time is before or at 10 PM
      const maxEndTime = new Date(`${booking.date}T22:00`);
      
      if (bookingEndTime <= maxEndTime) {
        // This booking should be expired
        await LockerBooking.findByIdAndDelete(booking._id);
        expiredCount++;
        console.log(`Auto-expired booking: ${booking.lockerId} for student ${booking.studentId}`);
      }
    }
    
    if (expiredCount > 0) {
      console.log(`Auto-expired ${expiredCount} bookings at 10 PM cutoff`);
    }
    
    console.log("Auto-expire task completed");
  } catch (error) {
    console.error("Error in auto-expire bookings:", error);
  }
};
