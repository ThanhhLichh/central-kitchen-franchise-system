import { useEffect, useState } from "react";
import { createDeliveryApi } from "../api/deliveryApi";
import "./CreateDeliveryModal.css";

function CreateDeliveryModal({ open, onClose, order, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      await createDeliveryApi({
        order_id: order.id,
      });

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Tạo giao hàng thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-modal-header">
          <div>
            <h2>Giao cho bên vận chuyển</h2>
            <p>Tạo lệnh giao hàng cho đơn #{order.id}</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="delivery-modal-form" onSubmit={handleSubmit}>
          <div className="delivery-order-summary">
            <div className="summary-card">
              <span>Mã đơn</span>
              <strong>ORD-{order.id}</strong>
            </div>

            <div className="summary-card">
              <span>Trạng thái đơn</span>
              <strong>{order.status}</strong>
            </div>
          </div>

          <p className="delivery-helper-text">
            Sau khi tạo, bên điều phối sẽ tiếp nhận và lập lịch giao hàng.
          </p>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Xác nhận chuyển giao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDeliveryModal;