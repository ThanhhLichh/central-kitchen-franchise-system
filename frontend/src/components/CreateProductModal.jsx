import { useEffect, useState } from "react";
import { createProductApi } from "../api/inventoryApi";
import "./CreateProductModal.css";

function CreateProductModal({ open, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData({ name: "", unit: "" });
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.unit.trim()) {
      setError("Vui lòng nhập đầy đủ tên sản phẩm và đơn vị.");
      return;
    }

    try {
      setSubmitting(true);

      await createProductApi({
        name: formData.name.trim(),
        unit: formData.unit.trim(),
      });

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Tạo sản phẩm thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <div>
            <h2>Thêm sản phẩm mới</h2>
            <p>Tạo mới sản phẩm trong danh mục hệ thống</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit}>
          <label className="product-label">
            <span>Tên sản phẩm</span>
            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Bột mì"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label className="product-label">
            <span>Đơn vị</span>
            <input
              type="text"
              name="unit"
              placeholder="Ví dụ: kg, gói, chai..."
              value={formData.unit}
              onChange={handleChange}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductModal;