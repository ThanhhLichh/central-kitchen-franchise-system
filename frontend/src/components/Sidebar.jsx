import { useNavigate, useLocation } from "react-router-dom";
import { menuByRole } from "../config/menuByRole";
import {
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiTruck,
  FiSettings,
  FiPlusCircle,
  FiArchive,
  FiShoppingBag,
  FiPackage,
  FiEdit3,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import logo from "../assets/logo.png";
import "./Sidebar.css";

const iconMap = {
  "Tổng quan": <FiHome />,
  "Đơn hàng": <FiShoppingCart />,
  "Đơn cần xử lý": <FiShoppingCart />,
  "Tạo đơn mới": <FiPlusCircle />,

  "Tồn kho bếp trung tâm": <FiArchive />,
  "Tồn kho cửa hàng": <FiArchive />,
  "Kho & Nguyên liệu": <FiArchive />,
  "Kho trung tâm": <FiArchive />,
  "Lệnh sản xuất": <FiPackage />,

  "Sản xuất": <FiPackage />,
  "Cập nhật trạng thái": <FiEdit3 />,
  "Đơn chờ sản xuất": <FiPackage />,
  "Danh sách giao hàng": <FiTruck />,

  "Người dùng": <FiUsers />,
  "Báo cáo": <FiBarChart2 />,
  "Tồn kho": <FiArchive />,
  "Sản phẩm": <FiPackage />,
  "Giao hàng": <FiTruck />,
  "Cấu hình hệ thống": <FiSettings />,
  "Cửa hàng": <FiShoppingBag />,
};

function Sidebar({ collapsed = false, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const menu = menuByRole[role] || [];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={onToggle}
        title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <div className="sidebar-brand">
        <div className="sidebar-brand-left">
          <img src={logo} alt="CenKit Logo" className="sidebar-logo" />

          {!collapsed && (
            <div className="sidebar-brand-text">
              <h2>CenKit</h2>
              <p>System</p>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu">
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={index}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
            >
              <span className="sidebar-item-icon">
                {iconMap[item.label] || <FiHome />}
              </span>

              {!collapsed && (
                <span className="sidebar-item-label">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar-support-card">
          <FiMail className="sidebar-support-icon" />

          <div className="sidebar-support-text">
            <p>Hỗ trợ</p>
            <span>Liên hệ</span>
          </div>

          <a
            href="mailto:buithanhlich931@gmail.com?subject=Hỗ trợ hệ thống CenKit"
            className="sidebar-support-btn"
          >
            Gửi
          </a>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;