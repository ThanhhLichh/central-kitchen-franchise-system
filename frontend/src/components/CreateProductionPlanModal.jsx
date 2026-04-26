import { useEffect, useState } from "react";
import { createProductionPlanApi } from "../api/productionApi";
import "./CreateProductionPlanModal.css";

function CreateProductionPlanModal({
  open,
  onClose,
  order,
  productsMap,
  onCreated,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  if (!open || !order) return null;

  const handleCreatePlans = async () => {
    try {
      setSubmitting(true);
      setError("");

      const missingItems = Array.isArray(order.missing_items)
        ? order.missing_items
        : [];

      if (missingItems.length === 0) {
        setError("Đơn hàng này không có dữ liệu thiếu hàng.");
        return;
      }

      for (const item of missingItems) {
        await createProductionPlanApi({
          orderId: order.id,
          productId: item.product_id,
          quantity: item.missing_quantity,
        });
      }

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Tạo lệnh sản xuất thất bại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="production-modal" onClick={(e) => e.stopPropagation()}>
        <div className="production-modal-header">
          <div>
            <h2>Tạo lệnh sản xuất</h2>
            <p>Tạo production plan cho đơn ORD-{order.id}</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="production-summary-box">
          <p>
            <strong>Đơn hàng:</strong> ORD-{order.id}
          </p>
          <p>
            <strong>Số sản phẩm thiếu:</strong> {order.missing_items?.length || 0}
          </p>
        </div>

        <div className="production-missing-list">
          {order.missing_items?.map((item, index) => (
            <div className="missing-item-card" key={`${item.product_id}-${index}`}>
              <div>
                <span>{productsMap[item.product_id]?.name || `Product #${item.product_id}`}</span>
                <strong>Thiếu: {item.missing_quantity}</strong>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleCreatePlans}
            disabled={submitting}
          >
            {submitting ? "Đang tạo..." : "Xác nhận tạo plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateProductionPlanModal;