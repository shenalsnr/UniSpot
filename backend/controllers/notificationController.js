import Notification from "../models/Notification.js";

/**
 * GET /api/notifications/
 * Returns all notifications for the currently authenticated student,
 * newest first. Secured by `protect` middleware — req.student is set.
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;

    if (!studentId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const notifications = await Notification.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Marks a single notification as read.
 * Guards against accessing another student's notification.
 */
export const markOneRead = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    // Ensure the notification belongs to this student
    if (notification.userId !== studentId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update this notification" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/mark-all-read
 * Marks all of the authenticated student's notifications as read.
 */
export const markAllRead = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;

    await Notification.updateMany(
      { userId: studentId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/clear-all
 * Deletes all notifications for the authenticated student.
 */
export const clearMyNotifications = async (req, res, next) => {
  try {
    const studentId = req.student.studentId;

    await Notification.deleteMany({ userId: studentId });

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    next(error);
  }
};
