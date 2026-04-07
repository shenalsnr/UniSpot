import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const navItems = [
  {
    label: "Entry Scanner",
    to: "/staff-dashboard/scanner",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="1" width="18" height="22" rx="2" ry="2" />
        <line x1="3" y1="7" x2="21" y2="7" />
        <line x1="9" y1="11" x2="9" y2="15" />
        <line x1="15" y1="11" x2="15" y2="15" />
      </svg>
    ),
  },
];

const StaffSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("staffInfo");
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points={collapsed ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline>
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "16px 8px",
            overflow: "auto",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                title={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: collapsed ? "12px 8px" : "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                  fontWeight: isActive ? "700" : "600",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div
          style={{
            padding: "16px 8px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: collapsed ? "12px 8px" : "12px 16px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: "rgba(255,0,0,0.1)",
              color: "rgba(255,150,150,0.9)",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.1)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5m0 0l-5-5m5 5H9" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default StaffSidebar;
