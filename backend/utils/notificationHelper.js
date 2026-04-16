import Notification from "../models/Notification.js";
import { getIO } from "./socket.js";

/**
 * Creates a notification in the database and emits it via Socket.io to the specified student's room.
 * 
 * @param {string} studentId - The ID of the student (userId in the model).
 * @param {string} title - Title of the notification.
 * @param {string} message - Detailed notification message.
 * @param {string} type - Notification type (e.g., booking_success, booking_reminder, booking_expired).
 * @param {object} [metadata=null] - Additional structured context for the notification.
 * @returns {Promise<object>} The created notification document.
 */
export const createStudentNotification = async (studentId, title, message, type, metadata = null) => {
  try {
    if (!studentId) {
      console.warn("[NotificationHelper] Missing studentId, cannot create/emit notification.");
      return null;
    }

    // Save to database
    const newNotification = new Notification({
      userId: studentId,
      title,
      message,
      type,
      metadata,
    });

    await newNotification.save();
    console.log(`[NotificationHelper] Saved ${type} for student ${studentId}.`);

    // Emit via Socket.io
    try {
      const io = getIO();
      io.to(`student_${studentId}`).emit("new_notification", newNotification);
      console.log(`[NotificationHelper] Emitted real-time notification to student_${studentId}.`);
    } catch (socketErr) {
      console.error("[NotificationHelper] Socket emission failed:", socketErr.message);
      // We don't fail the operation if socket emission fails (DB record exists)
    }

    return newNotification;
  } catch (err) {
    console.error("[NotificationHelper] Error creating notification:", err);
    throw err;
  }
};
