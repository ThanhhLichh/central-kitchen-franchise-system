import { FiCalendar, FiSettings, FiUser } from "react-icons/fi";
import "./Navbar.css";
import { logoutApi } from "../api/authApi";

function Navbar() {
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");
  const storeId = localStorage.getItem("storeId");
  const storeName = localStorage.getItem("storeName");
  const roleDisplayMap = {
      Admin: "Quản trị",
      Manager: "Quản lý",
      FranchiseStoreStaff: "Nhân viên cửa hàng",
      CentralKitchenStaff: "Nhân viên bếp",
      SupplyCoordinator: "Điều phối",
    };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="avatar">
          <FiUser />
        </div>

        <div className="navbar-user">
          <h3>
            Xin chào, {fullName || "User"}
          </h3>

          <div className="user-meta">
            <span className="role">{roleDisplayMap[role] || role}</span>

            {role === "FranchiseStoreStaff" && (
              <span className="store">
                • Store: {storeName || "N/A"}
              </span>
            )}
          </div>

          <p className="status-text">Hệ thống đang trực tuyến</p>
        </div>
      </div>

      <div className="navbar-right">
        <FiCalendar className="nav-icon" />
        <FiSettings className="nav-icon" />

        <button
          className="logout-btn"
          onClick={async () => {
            try {
              await logoutApi();
            } catch (err) {
              console.error("Logout API error:", err);
            } finally {
              localStorage.clear();
              window.location.href = "/";
            }
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Navbar;