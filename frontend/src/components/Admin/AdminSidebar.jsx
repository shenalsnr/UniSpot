import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const navItems = [
  {
    label: "Dashboard",
    to: "/admin-dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Locker Map",
    to: "/AdminLockerMap",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
        <circle cx="6" cy="6" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Locker Maintenance",
    to: "/LockerMaintenance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: "Locker Bookings",
    to: "/BookLockersStatus",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    label: "Parking Records",
    to: "/parking/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M10 12h2a2 2 0 0 0 0-4h-2v4" />
      </svg>
    ),
  },
  {
    label: "Security Staff",
    to: "/parking/admin/staff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin-login");
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "72px" : "240px",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          background: "linear-gradient(180deg, oklch(48.8% 0.243 264.376) 0%, oklch(40% 0.22 264.376) 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 40,
          boxShadow: "4px 0 32px rgba(30,90,200,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Logo + Collapse toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: "8px",
            padding: collapsed ? "14px 10px" : "14px 12px 14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            minHeight: "72px",
            transition: "all 0.3s",
          }}
        >
          {/* Logo in white circle — visible in both states */}
          <div
            style={{
              width: collapsed ? "40px" : "44px",
              height: collapsed ? "40px" : "44px",
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              transition: "all 0.3s",
            }}
          >
            <img
              src={logo}
              alt="UniSpot"
              style={{
                width: collapsed ? "28px" : "32px",
                height: collapsed ? "28px" : "32px",
                objectFit: "contain",
                transition: "all 0.3s",
              }}
            />
          </div>

          {/* Collapse / expand button */}
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
              flexShrink: 0,
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.22)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                width: "16px",
                height: "16px",
                transition: "transform 0.3s",
                transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: collapsed ? "11px 16px" : "11px 14px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.18s ease",
                  background: isActive
                    ? "rgba(255,255,255,0.22)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.70)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  boxShadow: isActive ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : "none",
                  position: "relative",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.70)";
                  }
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      height: "60%",
                      width: "3px",
                      borderRadius: "0 3px 3px 0",
                      background: "white",
                    }}
                  />
                )}
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Logout + Collapse toggle */}
        <div style={{ padding: "12px 8px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: collapsed ? "11px 16px" : "11px 14px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              width: "100%",
              background: "transparent",
              color: "rgba(255,200,200,0.85)",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,200,200,0.85)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px", flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>


        </div>
      </aside>

      {/* Spacer to push main content */}
      <div
        style={{
          width: collapsed ? "72px" : "240px",
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </>
  );
};

export default AdminSidebar;
