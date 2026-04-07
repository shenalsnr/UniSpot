import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

/**
 * AdminLayout – wraps any admin page with the collapsible sidebar.
 * Usage: <AdminLayout><YourPage /></AdminLayout>
 */
const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "32px 28px",
          transition: "padding 0.3s",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
