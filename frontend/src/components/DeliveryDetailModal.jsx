import "./DeliveryDetailModal.css";

function DeliveryDetailModal({
  delivery,
  open,
  onClose,
  storeName,
  storeAddress,
}) {
  if (!open || !delivery) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delivery-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-detail-header">
          <div>
            <h2>Chi tiết giao hàng</h2>
            <p>Thông tin chi tiết của lệnh giao hàng</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="delivery-detail-grid">
          <div className="detail-card">
            <span>Delivery ID</span>
            <strong>DLV-{delivery.id}</strong>
          </div>

          <div className="detail-card">
            <span>Order ID</span>
            <strong>ORD-{delivery.order_id}</strong>
          </div>

          <div className="detail-card">
            <span>Tên cửa hàng</span>
            <strong>{storeName || "Chưa có dữ liệu"}</strong>
          </div>

          <div className="detail-card">
            <span>Địa chỉ cửa hàng</span>
            <strong>{storeAddress || "Chưa có dữ liệu"}</strong>
          </div>

          <div className="detail-card">
            <span>Trạng thái</span>
            <strong className={`delivery-status-text ${delivery.status}`}>
              {delivery.status}
            </strong>
          </div>

          <div className="detail-card">
            <span>Ngày giao</span>
            <strong>{delivery.delivery_date || "--"}</strong>
          </div>

          <div className="detail-card">
            <span>Ngày tạo</span>
            <strong>
              {delivery.created_at
                ? new Date(delivery.created_at).toLocaleString("vi-VN")
                : "--"}
            </strong>
          </div>

          <div className="detail-card">
            <span>Cập nhật lần cuối</span>
            <strong>
              {delivery.updated_at
                ? new Date(delivery.updated_at).toLocaleString("vi-VN")
                : "--"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetailModal;