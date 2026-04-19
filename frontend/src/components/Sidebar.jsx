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
} from "react-icons/fi";
import logo from "../assets/logo.png";
import "./Sidebar.css";

const iconMap = {
  "Tổng quan": <FiHome />,
  "Đơn hàng": <FiShoppingCart />,
  "Tạo đơn mới": <FiPlusCircle />,
  "Tồn kho bếp trung tâm": <FiArchive />,
  "Kho & Nguyên liệu": <FiArchive />,
  "Người dùng": <FiUsers />,
  "Báo cáo": <FiBarChart2 />,
  "Giao hàng": <FiTruck />,
  "Cấu hình hệ thống": <FiSettings />,
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const menu = menuByRole[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-left">
          <img src={logo} alt="CenKit Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <h2>CenKit</h2>
            <p>System</p>
          </div>
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
            >
              <span className="sidebar-item-icon">
                {iconMap[item.label] || <FiHome />}
              </span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;