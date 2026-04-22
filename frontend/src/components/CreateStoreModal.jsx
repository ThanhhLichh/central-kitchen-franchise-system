import { useState } from "react";
import { createStoreApi } from "../api/adminApi";
import "./CreateStoreModal.css";
import { FiX, FiHome, FiMapPin, FiPlusSquare } from "react-icons/fi";

function CreateStoreModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await createStoreApi({ name, address });

      onCreated?.();
      onClose?.();

      setName("");
      setAddress("");
    } catch (err) {
      console.error(err);
      setError("Tạo cửa hàng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="store-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-icon">
              <FiPlusSquare />
            </div>
            <div>
              <h2>Thêm cửa hàng</h2>
              <p>Tạo cửa hàng mới trong hệ thống</p>
            </div>
          </div>

          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* Tên cửa hàng */}
          <div className="input-group">
            <FiHome />
            <input
              placeholder="Tên cửa hàng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Địa chỉ */}
          <div className="input-group">
            <FiMapPin />
            <input
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo cửa hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStoreModal;