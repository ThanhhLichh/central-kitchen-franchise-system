import { useEffect, useState } from "react";
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
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName,
        locationType: formData.locationType,
        storeId: isStoreStaff ? formData.storeId : null,
        roleName: formData.roleName,
      };

      await createUserApi(payload);

      onCreated?.();
      onClose?.();

      setFormData({
        username: "",
        password: "",
        email: "",
        fullName: "",
        locationType: "HQ",
        storeId: "",
        roleName: "Manager",
      });
    } catch (err) {
      console.error(err);
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Tạo tài khoản thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <div>
            <h2>Tạo người dùng mới</h2>
            <p>Thêm tài khoản mới vào hệ thống</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="create-user-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              name="fullName"
              placeholder="Họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <select name="roleName" value={formData.roleName} onChange={handleChange}>
              <option value="Manager">Manager</option>
              <option value="SupplyCoordinator">SupplyCoordinator</option>
              <option value="CentralKitchenStaff">CentralKitchenStaff</option>
              <option value="FranchiseStoreStaff">FranchiseStoreStaff</option>
            </select>

            <input
              name="locationType"
              placeholder="Location Type"
              value={formData.locationType}
              onChange={handleChange}
              disabled={isStoreStaff}
              required
            />

            {isStoreStaff && (
              <select
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn cửa hàng</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingStores && isStoreStaff && (
            <p className="helper-text">Đang tải danh sách cửa hàng...</p>
          )}

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;