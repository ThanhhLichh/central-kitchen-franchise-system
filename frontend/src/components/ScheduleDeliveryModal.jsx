import { useEffect, useState } from "react";
import { updateDeliveryApi } from "../api/deliveryApi";
import "./ScheduleDeliveryModal.css";

function ScheduleDeliveryModal({ open, onClose, delivery, onScheduled }) {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && delivery) {
      setDeliveryDate(delivery.delivery_date || "");
      setError("");
      setSubmitting(false);
    }
  }, [open, delivery]);

  if (!open || !delivery) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!deliveryDate) {
      setError("Vui lòng chọn ngày giao hàng.");
      return;
    }

    try {
      setSubmitting(true);

      await updateDeliveryApi(delivery.id, {
        delivery_date: deliveryDate,
      });

      onScheduled?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Cập nhật ngày giao thất bại."
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
            <h2>Lập lịch giao hàng</h2>
            <p>Cập nhật ngày giao cho delivery DLV-{delivery.id}</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="delivery-modal-form" onSubmit={handleSubmit}>
          <div className="delivery-order-summary">
            <div className="summary-card">
              <span>Delivery ID</span>
              <strong>DLV-{delivery.id}</strong>
            </div>

            <div className="summary-card">
              <span>Order ID</span>
              <strong>ORD-{delivery.order_id}</strong>
            </div>
          </div>

          <label className="delivery-label">
            <span>Ngày giao hàng</span>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Hủy
            </button>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu lịch giao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleDeliveryModal;