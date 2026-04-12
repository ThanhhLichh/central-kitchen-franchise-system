import "./Login.css";
import logo from "../assets/logo.png";
import { FiUser, FiLock } from "react-icons/fi";

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submit");
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
            <span className="input-icon"><FiUser /></span>
            <input type="text" placeholder="Username" />
          </div>

          <div className="input-wrap">
            <span className="input-icon"><FiLock /></span>
            <input type="password" placeholder="Password" />
          </div>

          <div className="login-options">
            <label className="remember-switch">
                <input type="checkbox" />
                <span className="switch"></span>
                <span className="label-text">Ghi nhớ</span>
            </label>

            <a href="#" className="forgot-link">
              Quên mật khẩu ?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Log in
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