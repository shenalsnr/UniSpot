import { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";

/**
 * StaffLayout – wraps any staff page with the collapsible sidebar and professional header.
 * Uses Outlet for nested routes
 */
const StaffLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <StaffSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main Content Wrapper - accounts for fixed sidebar */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        display: "flex", 
        flexDirection: "column",
        marginLeft: `${sidebarWidth}px`,
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)"
      }}>
        {/* Professional Blue Header Banner */}
        <div 
          style={{
            background: "linear-gradient(135deg, #0052a3 0%, #003d7a 100%)",
            color: "white",
            padding: "24px 32px",
            boxShadow: "0 4px 12px rgba(0,82,163,0.15)",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0", letterSpacing: "0.5px" }}>
              VEHICLE ENTRY SCANNER
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: "4px 0 0 0" }}>
              Parking Entry & Departure Management
            </p>
          </div>
        </div>

        {/* Main content area - renders nested routes via Outlet */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "32px 28px",
            transition: "padding 0.3s",
            overflowX: "hidden",
            overflowY: "auto"
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
