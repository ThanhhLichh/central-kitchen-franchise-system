import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

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