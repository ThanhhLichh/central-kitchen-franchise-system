import "./Login.css";
import logo from "../assets/logo.png";
import { FiUser, FiLock } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";
import { getDefaultRouteByRole } from "../utils/getDefaultRouteByRole";
import { initNotification } from "../utils/notification";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  //  handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //  submit login
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const data = await loginApi(formData);

    const token = data.token;
    const decoded = jwtDecode(token);

    console.log("Decoded:", decoded);

    const role =
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      "";

    const username =
      decoded.unique_name ||
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      "";

    const userId = decoded.UserId || "";
    const storeId = decoded.StoreId || "";
    const locationType = decoded.LocationType || "";
    const fullName = decoded.FullName || "";
    const storeName = decoded.StoreName || "";

    localStorage.setItem("token", token);
    localStorage.setItem("expiration", data.expiration || "");
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);
    localStorage.setItem("storeId", storeId);
    localStorage.setItem("locationType", locationType);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("storeName", storeName);

    // đăng ký notification sau login
    if (userId) {
      await initNotification(userId);
    }

    navigate(getDefaultRouteByRole(role));
  } catch (err) {
    console.error(err);

    if (err.response?.status === 401) {
      setError(
        typeof err.response.data === "string"
          ? err.response.data
          : "Sai tài khoản hoặc mật khẩu."
      );
    } else {
      setError("Không thể kết nối tới server.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-block">
          <img src={logo} alt="CenKit Logo" className="brand-logo" />
          <div className="brand-text">
            <h1>CenKit</h1>
            <p>System</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Đăng nhập</h2>
          <span>Nhập email và mật khẩu của bạn</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-wrap">
            <span className="input-icon">
              <FiUser />
            </span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-wrap">
            <span className="input-icon">
              <FiLock />
            </span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
{/* 
          <div className="login-options">
            <label className="remember-switch">
              <input type="checkbox" />
              <span className="switch"></span>
              <span className="label-text">Ghi nhớ</span>
            </label>

            <a href="#" className="forgot-link">
              Quên mật khẩu ?
            </a>
          </div> */}

          {/*  Hiển thị lỗi */}
          {error && (
            <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Log in"}
          </button>
        </form>

        <div className="slider-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}

export default Login;