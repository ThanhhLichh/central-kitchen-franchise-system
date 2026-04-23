import { useEffect, useState } from "react";
import {
  FiX,
  FiUser,
  FiLock,
  FiMail,
  FiHome,
  FiBriefcase,
  FiMapPin,
  FiShoppingBag,
  FiUserPlus,
} from "react-icons/fi";

import { createUserApi, getStoresApi } from "../api/adminApi";
import "./CreateUserModal.css";

function CreateUserModal({ open, onClose, onCreated }) {
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    locationType: "HQ",
    storeId: "",
    roleName: "Manager",
  });

  useEffect(() => {
    if (!open) return;

    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const data = await getStoresApi();
        setStores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, [open]);

  if (!open) return null;

  const isStoreStaff = formData.roleName === "FranchiseStoreStaff";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "roleName" && value !== "FranchiseStoreStaff"
        ? { storeId: "", locationType: "HQ" }
        : {}),
      ...(name === "roleName" && value === "FranchiseStoreStaff"
        ? { locationType: "FranchiseStore" }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isStoreStaff && !formData.storeId) {
      setError("Nhân viên cửa hàng bắt buộc phải chọn cửa hàng.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        storeId: isStoreStaff ? formData.storeId : null,
      };

      await createUserApi(payload);

      onCreated?.();
      onClose?.();
    } catch (err) {
      setError("Tạo tài khoản thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-user-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="user-modal-header">
        <div className="header-left">
          <div className="header-icon">
            <FiUserPlus />
          </div>
          <div>
            <h2>Tạo người dùng</h2>
            <p>Thêm tài khoản mới</p>
          </div>
        </div>

        <button className="close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>

        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-grid">

            <div className="input-group">
              <FiUser />
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FiLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FiMail />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FiUser />
              <input
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FiBriefcase />
              <select name="roleName" value={formData.roleName} onChange={handleChange}>
                <option value="Manager">Manager</option>
                <option value="SupplyCoordinator">SupplyCoordinator</option>
                <option value="CentralKitchenStaff">CentralKitchenStaff</option>
                <option value="FranchiseStoreStaff">FranchiseStoreStaff</option>
              </select>
            </div>

            <div className="input-group">
              <FiMapPin />
              <input
                name="locationType"
                value={formData.locationType}
                disabled
              />
            </div>

            {isStoreStaff && (
              <div className="input-group full-width">
                <FiShoppingBag />
                <select
                  name="storeId"
                  value={formData.storeId}
                  onChange={handleChange}
                >
                  <option value="">Chọn cửa hàng</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loadingStores && <p className="helper-text">Đang tải cửa hàng...</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-btn">
              {submitting ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;