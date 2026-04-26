import "./CoordinatorOrderDetailModal.css";

function CoordinatorOrderDetailModal({
  order,
  open,
  onClose,
  productsMap,
  storeName,
}) {
  if (!open || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="coordinator-order-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coordinator-order-modal-header">
          <div>
            <h2>Chi tiết đơn hàng #{order.id}</h2>
            <p>Thông tin đơn hàng đang chờ sản xuất</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="coordinator-order-info-grid">
          <div className="info-card">
            <span>Mã đơn</span>
            <strong>ORD-{order.id}</strong>
          </div>

          <div className="info-card">
            <span>Tên cửa hàng</span>
            <strong>{storeName || order.store_id || "--"}</strong>
          </div>

          <div className="info-card">
            <span>Trạng thái</span>
            <strong className={`status-text ${order.status}`}>{order.status}</strong>
          </div>

          <div className="info-card">
            <span>Ngày tạo</span>
            <strong>
              {order.created_at
                ? new Date(order.created_at).toLocaleString("vi-VN")
                : "--"}
            </strong>
          </div>
        </div>

        <div className="detail-section">
          <h3>Danh sách sản phẩm trong đơn</h3>
          <table className="detail-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng yêu cầu</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? (
                order.items.map((item) => (
                  <tr key={item.id || `${item.product_id}-${item.quantity}`}>
                    <td>{item.product_id}</td>
                    <td>{productsMap[item.product_id]?.name || "Chưa có tên"}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-row">
                    Không có sản phẩm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="detail-section">
          <h3>Sản phẩm đang thiếu</h3>
          <table className="detail-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng thiếu</th>
              </tr>
            </thead>
            <tbody>
              {order.missing_items?.length > 0 ? (
                order.missing_items.map((item, index) => (
                  <tr key={`${item.product_id}-${index}`}>
                    <td>{item.product_id}</td>
                    <td>{productsMap[item.product_id]?.name || "Chưa có tên"}</td>
                    <td>{item.missing_quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-row">
                    Không có dữ liệu thiếu hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorOrderDetailModal;