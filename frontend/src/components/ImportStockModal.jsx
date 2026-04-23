import { useState } from "react";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import "./ImportStockModal.css";

function ImportStockModal({ open, onClose, products, onImported }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      await axiosClient.post(INVENTORY_API.IMPORT, {
        product_id: Number(productId),
        quantity: Number(quantity),
      });

      onImported?.();
      onClose?.();
      setProductId("");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Nhập kho thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2>Nhập kho trung tâm</h2>
            <p>Thêm nguyên liệu hoặc bán thành phẩm vào kho bếp trung tâm</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="inventory-modal-form" onSubmit={handleSubmit}>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.unit})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang nhập..." : "Xác nhận nhập kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImportStockModal;