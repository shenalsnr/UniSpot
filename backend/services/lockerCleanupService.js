import { expireOldBookings } from "../controllers/LockerController.js";

const cleanupIntervalMinutes = 1;

export const startLockerCleanupJob = () => {
  console.log("[Locker Service] Automated cleanup job initialized. Running every minute.");

  setInterval(async () => {
    try {
      await expireOldBookings();
    } catch (error) {
      console.error("[Locker Service] Error during cleanup:", error);
    }
  }, cleanupIntervalMinutes * 60 * 1000);
};
