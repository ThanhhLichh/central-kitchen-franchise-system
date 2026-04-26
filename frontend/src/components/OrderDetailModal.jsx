import "./OrderDetailModal.css";

function OrderDetailModal({ order, open, onClose, storeName, username, productsMap }) {
  if (!open || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <div>
            <h2>Chi tiết đơn hàng #{order.id}</h2>
            <p>Xem thông tin chi tiết đơn hàng từ cửa hàng</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="order-modal-info">
          <div className="info-card">
            <span>Mã đơn</span>
            <strong>ORD-{order.id}</strong>
          </div>

          {/* <div className="info-card">
            <span>Tạo bởi</span>
            <strong>{order.created_by || username || "N/A"}</strong>
          </div> */}

          <div className="info-card">
            <span>Tên cửa hàng</span>
            <strong>{order.store_name || storeName || "N/A"}</strong>
          </div>

          <div className="info-card">
            <span>Ngày tạo</span>
            <strong>
              {order.created_at
                ? new Date(order.created_at).toLocaleString("vi-VN")
                : "--"}
            </strong>
          </div>

          <div className="info-card">
            <span>Trạng thái</span>
            <strong className={`status-text ${order.status}`}>
              {order.status}
            </strong>
          </div>
        </div>

        <div className="order-modal-table-wrap">
          <h3>Danh sách sản phẩm</h3>

          <table className="order-modal-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_id}</td>
                    <td>{productsMap?.[item.product_id] || "Chưa có tên"}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-row">
                    Không có sản phẩm trong đơn hàng
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

export default OrderDetailModal;