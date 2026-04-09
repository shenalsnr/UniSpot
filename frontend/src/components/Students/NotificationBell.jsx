import React, { useState, useEffect, useRef, useCallback } from "react";
import studentApi from "./studentApi";
import { io } from "socket.io-client";

// ─── Notification type icon helper ──────────────────────────────────────────
const getTypeIcon = (type, title = "") => {
  // If it's a locker-specific type or the title suggests it's a locker booking
  if (
    type === "locker_booking_success" || 
    type === "locker_booking_reminder" || 
    type === "locker_booking_expired" ||
    (title && title.toLowerCase().includes("locker"))
  ) {
    return (
      <span className="notif-type-icon notif-type-locker" title="Locker Update">
        📦
      </span>import React, { useState, useEffect, useRef, useCallback } from "react";
import studentApi from "./studentApi";
import { io } from "socket.io-client";

// ─── Notification type icon helper ──────────────────────────────────────────
const getTypeIcon = (type, title = "") => {
  // If it's a locker-specific type or the title suggests it's a locker booking
  if (
    type === "locker_booking_success" || 
    type === "locker_booking_reminder" || 
    type === "locker_booking_expired" ||
    (title && title.toLowerCase().includes("locker"))
  ) {
    return (
      <span className="notif-type-icon notif-type-locker" title="Locker Update">
        📦
      </span>
    );
  }

  switch (type) {
    case "booking_success":
      return (
        <span className="notif-type-icon notif-type-success" title="Booking Confirmed">
          🚗
        </span>
      );
    case "booking_cancelled":
      return (
        <span className="notif-type-icon notif-type-cancelled" title="Booking Cancelled">
          ✕
        </span>
      );
    case "booking_reminder":
      return (
        <span className="notif-type-icon notif-type-reminder" title="Reminder">
          ⏰
        </span>
      );
    case "maintenance_notice":
      return (
        <span className="notif-type-icon notif-type-maintenance" title="Maintenance">
          🔧
        </span>
      );
    case "departure_confirmed":
      return (
        <span className="notif-type-icon notif-type-departure" title="Departure Confirmed">
          ✅
        </span>
      );
    case "booking_expired":
      return (
        <span className="notif-type-icon notif-type-expired" title="Booking Expired">
          ⏰
        </span>
      );
    case "penalty_applied":
      return (
        <span className="notif-type-icon notif-type-penalty" title="Penalty Applied">
          ⚠️
        </span>
      );
    case "student_blocked":
      return (
        <span className="notif-type-icon notif-type-blocked" title="Access Suspended">
          🚫
        </span>
      );
    default:
      return (
        <span className="notif-type-icon notif-type-default" title="Notification">
          📌
        </span>
      );
  }
};

// ─── Time formatter ──────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ─── Main component ──────────────────────────────────────────────────────────
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await studentApi.get("/notifications/");
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silently fail — notification errors should never disrupt navigation
    }
  }, []);

  // Initial fetch + polling (every 30s as fallback)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Real-time notifications via Socket.io ──────────────────────────────────
  useEffect(() => {
    // Get student info for the room name
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "{}");
    const studentId = studentInfo.studentId;

    if (!studentId) return;

    const upperStudentId = studentId.toUpperCase();

    // Connect to backend (using the same base URL as the API, minus /api)
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("[Socket] Connected to server");
      // Join the private student room
      socket.emit("join_student", upperStudentId);
    });

    socket.on("new_notification", (notif) => {
      console.log("[Socket] New notification received:", notif);
      
      // Add to state instantly
      setNotifications((prev) => {
        // Prevent duplicates (just in case)
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      
      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Play a subtle sound or trigger browser notification if desired
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, { body: notif.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // ── Mark one as read ───────────────────────────────────────────────────────
  const handleMarkOneRead = async (id) => {
    setMarkingId(id);
    try {
      await studentApi.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    } finally {
      setMarkingId(null);
    }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await studentApi.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Toggle panel ───────────────────────────────────────────────────────────
  const handleBellClick = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && notifications.length === 0) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inline styles — scoped, no Tailwind conflicts */}
      <style>{`
        .notif-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        /* Bell button */
        .notif-bell-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          backdrop-filter: blur(6px);
          outline: none;
          color: white;
        }
        .notif-bell-btn:hover {
          background: rgba(255,255,255,0.28);
          transform: scale(1.07);
          box-shadow: 0 0 14px rgba(255,255,255,0.35);
        }
        .notif-bell-btn:active {
          transform: scale(0.97);
        }

        /* Bell icon wobble on unread */
        @keyframes notif-wobble {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-10deg); }
          45%  { transform: rotate(8deg); }
          60%  { transform: rotate(-5deg); }
          75%  { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
        .notif-bell-ring {
          animation: notif-wobble 1.5s ease-in-out;
        }

        /* Badge */
        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid rgba(255,255,255,0.7);
          animation: notif-badge-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events: none;
        }
        @keyframes notif-badge-pop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        /* Dropdown Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 360px;
          max-width: calc(100vw - 24px);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          z-index: 9999;
          animation: notif-slide-in 0.22s cubic-bezier(0.34,1.2,0.64,1);
          transform-origin: top right;
        }
        @keyframes notif-slide-in {
          from { opacity: 0; transform: scale(0.9) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Panel header */
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px 12px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          color: white;
        }
        .notif-header-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .notif-mark-all-btn {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          padding: 4px 11px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          outline: none;
        }
        .notif-mark-all-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.32);
          color: white;
        }
        .notif-mark-all-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Scroll list */
        .notif-list {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px 0;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .notif-list::-webkit-scrollbar { width: 5px; }
        .notif-list::-webkit-scrollbar-track { background: transparent; }
        .notif-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }

        /* Item */
        .notif-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 18px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s;
          cursor: default;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #f8fafc; }

        /* Unread item highlight */
        .notif-item.notif-unread {
          background: #eff6ff;
          border-left: 3px solid #2563eb;
          padding-left: 15px;
        }
        .notif-item.notif-unread:hover { background: #dbeafe; }

        /* Item icon */
        .notif-type-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-top: 1px;
        }
        .notif-type-success     { background: #dcfce7; }
        .notif-type-cancelled   { background: #fee2e2; color: #dc2626; font-weight: 900; font-size: 14px; }
        .notif-type-reminder    { background: #fef3c7; }
        .notif-type-maintenance { background: #e0e7ff; }
        .notif-type-departure   { background: #d1fae5; }
        .notif-type-expired     { background: #ffedd5; }
        .notif-type-penalty     { background: #fee2e2; }
        .notif-type-blocked     { background: #1f2937; color: #f9fafb; }
        .notif-type-locker      { background: #eff6ff; border: 1px solid #bfdbfe; }
        .notif-type-default     { background: #f1f5f9; }

        /* Item body */
        .notif-body { flex: 1; min-width: 0; }
        .notif-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item.notif-read .notif-title { font-weight: 600; color: #64748b; }
        .notif-msg {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.45;
          margin-bottom: 5px;
        }
        .notif-item.notif-read .notif-msg { color: #94a3b8; }
        .notif-time {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Unread dot */
        .notif-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
          display: inline-block;
        }

        /* Mark single read button */
        .notif-read-btn {
          flex-shrink: 0;
          font-size: 10.5px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          padding: 3px 9px;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 3px;
          outline: none;
          white-space: nowrap;
        }
        .notif-read-btn:hover { background: #dbeafe; }
        .notif-read-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loading state */
        .notif-loading {
          padding: 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .notif-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Empty state */
        .notif-empty {
          padding: 36px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }
        .notif-empty-icon {
          font-size: 36px;
          opacity: 0.35;
        }
        .notif-empty-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #94a3b8;
        }
        .notif-empty-sub {
          font-size: 12px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Panel footer */
        .notif-footer {
          padding: 10px 18px 14px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }
        .notif-footer-text {
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 500;
        }
      `}</style>

      <div className="notif-wrapper">
        {/* ── Bell Button ── */}
        <button
          ref={bellRef}
          id="notification-bell-btn"
          className="notif-bell-btn"
          onClick={handleBellClick}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          title="Notifications"
        >
          <svg
            className={unreadCount > 0 ? "notif-bell-ring" : ""}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="notif-badge" aria-hidden="true">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ── */}
        {open && (
          <div
            ref={panelRef}
            className="notif-panel"
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header */}
            <div className="notif-header">
              <span className="notif-header-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: "999px",
                      padding: "1px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </span>

              {unreadCount > 0 && (
                <button
                  className="notif-mark-all-btn"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  title="Mark all as read"
                >
                  {markingAll ? "Marking..." : "Mark all read"}
                </button>
              )}
            </div>

            {/* Body */}
            {loading ? (
              <div className="notif-loading">
                <div className="notif-spinner" />
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">🔔</div>
                <div className="notif-empty-text">No notifications yet</div>
                <div className="notif-empty-sub">
                  You'll see parking updates here
                </div>
              </div>
            ) : (
              <div className="notif-list" role="list">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    role="listitem"
                    className={`notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}
                  >
                    {/* Type icon */}
                    {getTypeIcon(n.type, n.title)}

                    {/* Content */}
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">
                        {!n.isRead && (
                          <span className="notif-unread-dot" aria-hidden="true" />
                        )}
                        {formatTime(n.createdAt)}
                      </div>
                    </div>

                    {/* Mark single as read */}
                    {!n.isRead && (
                      <button
                        className="notif-read-btn"
                        onClick={() => handleMarkOneRead(n._id)}
                        disabled={markingId === n._id}
                        title="Mark as read"
                        aria-label={`Mark "${n.title}" as read`}
                      >
                        {markingId === n._id ? "..." : "Read"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="notif-footer">
              <span className="notif-footer-text">
                {notifications.length > 0
                  ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""} total`
                  : "Parking notifications appear here"}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;

    );
  }

  switch (type) {
    case "booking_success":
      return (
        <span className="notif-type-icon notif-type-success" title="Booking Confirmed">
          🚗
        </span>
      );
    case "booking_cancelled":
      return (
        <span className="notif-type-icon notif-type-cancelled" title="Booking Cancelled">
          ✕
        </span>
      );
    case "booking_reminder":
      return (
        <span className="notif-type-icon notif-type-reminder" title="Reminder">
          ⏰
        </span>
      );
    case "maintenance_notice":
      return (
        <span className="notif-type-icon notif-type-maintenance" title="Maintenance">
          🔧
        </span>
      );
    case "departure_confirmed":
      return (
        <span className="notif-type-icon notif-type-departure" title="Departure Confirmed">
          ✅
        </span>
      );
    case "booking_expired":
      return (
        <span className="notif-type-icon notif-type-expired" title="Booking Expired">
          ⏰
        </span>
      );
    case "penalty_applied":
      return (
        <span className="notif-type-icon notif-type-penalty" title="Penalty Applied">
          ⚠️
        </span>
      );
    case "student_blocked":
      return (
        <span className="notif-type-icon notif-type-blocked" title="Access Suspended">
          🚫
        </span>
      );
    default:
      return (
        <span className="notif-type-icon notif-type-default" title="Notification">
          📌
        </span>
      );
  }
};

// ─── Time formatter ──────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ─── Main component ──────────────────────────────────────────────────────────
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await studentApi.get("/notifications/");
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silently fail — notification errors should never disrupt navigation
    }
  }, []);

  // Initial fetch + polling (every 30s as fallback)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Real-time notifications via Socket.io ──────────────────────────────────
  useEffect(() => {
    // Get student info for the room name
    const studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "{}");
    const studentId = studentInfo.studentId;

    if (!studentId) return;

    // Connect to backend (using the same base URL as the API, minus /api)
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("[Socket] Connected to server");
      // Join the private student room
      socket.emit("join_student", studentId);
    });

    socket.on("new_notification", (notif) => {
      console.log("[Socket] New notification received:", notif);
      
      // Add to state instantly
      setNotifications((prev) => {
        // Prevent duplicates (just in case)
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      
      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Play a subtle sound or trigger browser notification if desired
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, { body: notif.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // ── Mark one as read ───────────────────────────────────────────────────────
  const handleMarkOneRead = async (id) => {
    setMarkingId(id);
    try {
      await studentApi.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    } finally {
      setMarkingId(null);
    }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await studentApi.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Toggle panel ───────────────────────────────────────────────────────────
  const handleBellClick = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && notifications.length === 0) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inline styles — scoped, no Tailwind conflicts */}
      <style>{`
        .notif-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        /* Bell button */
        .notif-bell-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          backdrop-filter: blur(6px);
          outline: none;
          color: white;
        }
        .notif-bell-btn:hover {
          background: rgba(255,255,255,0.28);
          transform: scale(1.07);
          box-shadow: 0 0 14px rgba(255,255,255,0.35);
        }
        .notif-bell-btn:active {
          transform: scale(0.97);
        }

        /* Bell icon wobble on unread */
        @keyframes notif-wobble {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-10deg); }
          45%  { transform: rotate(8deg); }
          60%  { transform: rotate(-5deg); }
          75%  { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
        .notif-bell-ring {
          animation: notif-wobble 1.5s ease-in-out;
        }

        /* Badge */
        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          color: white;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid rgba(255,255,255,0.7);
          animation: notif-badge-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
          pointer-events: none;
        }
        @keyframes notif-badge-pop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        /* Dropdown Panel */
        .notif-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 360px;
          max-width: calc(100vw - 24px);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          z-index: 9999;
          animation: notif-slide-in 0.22s cubic-bezier(0.34,1.2,0.64,1);
          transform-origin: top right;
        }
        @keyframes notif-slide-in {
          from { opacity: 0; transform: scale(0.9) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Panel header */
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px 12px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          color: white;
        }
        .notif-header-title {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .notif-mark-all-btn {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          padding: 4px 11px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          outline: none;
        }
        .notif-mark-all-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.32);
          color: white;
        }
        .notif-mark-all-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Scroll list */
        .notif-list {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px 0;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .notif-list::-webkit-scrollbar { width: 5px; }
        .notif-list::-webkit-scrollbar-track { background: transparent; }
        .notif-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }

        /* Item */
        .notif-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 18px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s;
          cursor: default;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #f8fafc; }

        /* Unread item highlight */
        .notif-item.notif-unread {
          background: #eff6ff;
          border-left: 3px solid #2563eb;
          padding-left: 15px;
        }
        .notif-item.notif-unread:hover { background: #dbeafe; }

        /* Item icon */
        .notif-type-icon {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-top: 1px;
        }
        .notif-type-success     { background: #dcfce7; }
        .notif-type-cancelled   { background: #fee2e2; color: #dc2626; font-weight: 900; font-size: 14px; }
        .notif-type-reminder    { background: #fef3c7; }
        .notif-type-maintenance { background: #e0e7ff; }
        .notif-type-departure   { background: #d1fae5; }
        .notif-type-expired     { background: #ffedd5; }
        .notif-type-penalty     { background: #fee2e2; }
        .notif-type-blocked     { background: #1f2937; color: #f9fafb; }
        .notif-type-locker      { background: #eff6ff; border: 1px solid #bfdbfe; }
        .notif-type-default     { background: #f1f5f9; }

        /* Item body */
        .notif-body { flex: 1; min-width: 0; }
        .notif-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-item.notif-read .notif-title { font-weight: 600; color: #64748b; }
        .notif-msg {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.45;
          margin-bottom: 5px;
        }
        .notif-item.notif-read .notif-msg { color: #94a3b8; }
        .notif-time {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* Unread dot */
        .notif-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
          display: inline-block;
        }

        /* Mark single read button */
        .notif-read-btn {
          flex-shrink: 0;
          font-size: 10.5px;
          font-weight: 700;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 999px;
          padding: 3px 9px;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 3px;
          outline: none;
          white-space: nowrap;
        }
        .notif-read-btn:hover { background: #dbeafe; }
        .notif-read-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Loading state */
        .notif-loading {
          padding: 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .notif-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Empty state */
        .notif-empty {
          padding: 36px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }
        .notif-empty-icon {
          font-size: 36px;
          opacity: 0.35;
        }
        .notif-empty-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #94a3b8;
        }
        .notif-empty-sub {
          font-size: 12px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Panel footer */
        .notif-footer {
          padding: 10px 18px 14px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }
        .notif-footer-text {
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 500;
        }
      `}</style>

      <div className="notif-wrapper">
        {/* ── Bell Button ── */}
        <button
          ref={bellRef}
          id="notification-bell-btn"
          className="notif-bell-btn"
          onClick={handleBellClick}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          title="Notifications"
        >
          <svg
            className={unreadCount > 0 ? "notif-bell-ring" : ""}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="notif-badge" aria-hidden="true">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ── */}
        {open && (
          <div
            ref={panelRef}
            className="notif-panel"
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header */}
            <div className="notif-header">
              <span className="notif-header-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: "999px",
                      padding: "1px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </span>

              {unreadCount > 0 && (
                <button
                  className="notif-mark-all-btn"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  title="Mark all as read"
                >
                  {markingAll ? "Marking..." : "Mark all read"}
                </button>
              )}
            </div>

            {/* Body */}
            {loading ? (
              <div className="notif-loading">
                <div className="notif-spinner" />
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">🔔</div>
                <div className="notif-empty-text">No notifications yet</div>
                <div className="notif-empty-sub">
                  You'll see parking updates here
                </div>
              </div>
            ) : (
              <div className="notif-list" role="list">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    role="listitem"
                    className={`notif-item ${n.isRead ? "notif-read" : "notif-unread"}`}
                  >
                    {/* Type icon */}
                    {getTypeIcon(n.type, n.title)}

                    {/* Content */}
                    <div className="notif-body">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">
                        {!n.isRead && (
                          <span className="notif-unread-dot" aria-hidden="true" />
                        )}
                        {formatTime(n.createdAt)}
                      </div>
                    </div>

                    {/* Mark single as read */}
                    {!n.isRead && (
                      <button
                        className="notif-read-btn"
                        onClick={() => handleMarkOneRead(n._id)}
                        disabled={markingId === n._id}
                        title="Mark as read"
                        aria-label={`Mark "${n.title}" as read`}
                      >
                        {markingId === n._id ? "..." : "Read"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="notif-footer">
              <span className="notif-footer-text">
                {notifications.length > 0
                  ? `${notifications.length} notification${notifications.length !== 1 ? "s" : ""} total`
                  : "Parking notifications appear here"}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
