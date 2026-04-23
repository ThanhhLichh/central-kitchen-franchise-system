import { useEffect, useState } from "react";
import {
  FiX,
  FiUserCheck,
  FiUser,
  FiMail,
  FiBriefcase,
  FiMapPin,
  FiShoppingBag,
} from "react-icons/fi";
import {
  getStoresApi,
  getUserByIdApi,
  updateUserApi,
} from "../api/adminApi";
import "./EditUserModal.css";

function EditUserModal({ userId, open, onClose, onUpdated }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    storeId: "",
    roleName: "",
    locationType: "",
  });

  useEffect(() => {
    if (!open) {
      setLoading(true);
      setError("");
      setSubmitting(false);
      setFormData({
        email: "",
        fullName: "",
        storeId: "",
        roleName: "",
        locationType: "",
      });
      return;
    }

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

  useEffect(() => {
    if (!open || !userId) return;

    setLoading(true);
    setError("");
    setFormData({
      email: "",
      fullName: "",
      storeId: "",
      roleName: "",
      locationType: "",
    });

    const fetchUser = async () => {
      try {
        const data = await getUserByIdApi(userId);

        setFormData({
          email: data.email || "",
          fullName: data.fullName || "",
          storeId: data.storeId || "",
          roleName: data.roles?.[0] || "",
          locationType: data.locationType || "",
        });
      } catch (err) {
        console.error(err);
        setError("Không tải được thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [open, userId]);

  if (!open) return null;

  const isStoreStaff = formData.roleName === "FranchiseStoreStaff";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        email: formData.email,
        fullName: formData.fullName,
        storeId: isStoreStaff ? formData.storeId || null : null,
      };

      await updateUserApi(userId, payload);

      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Cập nhật user thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="edit-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <div className="header-left">
            <div className="header-icon">
              <FiUserCheck />
            </div>
            <div>
              <h2>Chỉnh sửa người dùng</h2>
              <p>Cập nhật thông tin tài khoản trong hệ thống</p>
            </div>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading-box">Đang tải dữ liệu người dùng...</div>
        ) : (
          <form className="edit-user-form" onSubmit={handleSubmit}>
            <div className="form-grid">
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
                <FiBriefcase />
                <input value={formData.roleName} disabled placeholder="Role" />
              </div>

              <div className="input-group">
                <FiMapPin />
                <input
                  value={formData.locationType}
                  disabled
                  placeholder="Location Type"
                />
              </div>

              {isStoreStaff && (
                <div className="input-group full-width">
                  <FiShoppingBag />
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
                </div>
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
                {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditUserModal;