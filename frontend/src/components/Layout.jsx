import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="layout-main">
        <Navbar />

        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;