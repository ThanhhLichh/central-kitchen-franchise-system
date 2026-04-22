import "./KitchenOrderDetailModal.css";

function KitchenOrderDetailModal({ order, open, onClose, productsMap, storeMap }) {
  if (!open || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="kitchen-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kitchen-order-modal-header">
          <div>
            <h2>Chi tiết đơn hàng #{order.id}</h2>
            <p>Thông tin đơn hàng từ cửa hàng gửi đến bếp trung tâm</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="kitchen-order-modal-info">
            <div className="info-card">
                <span>Mã đơn</span>
                <strong>ORD-{order.id}</strong>
            </div>

            <div className="info-card">
                <span>Tên cửa hàng</span>
                <strong>{storeMap?.[order.store_id]?.name || order.store_name || order.store_id || "--"}</strong>
            </div>

            {/* <div className="info-card">
                <span>Tạo bởi</span>
                <strong>{order.created_by || order.created_by_name || "Chưa có dữ liệu"}</strong>
            </div> */}

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

        <div className="kitchen-order-table-wrap">
          <h3>Danh sách sản phẩm</h3>

          <table className="kitchen-order-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Tên sản phẩm</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_id}</td>
                    <td>{productsMap?.[item.product_id]?.name || "Chưa có tên"}</td>
                    <td>{productsMap?.[item.product_id]?.unit || "--"}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">
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

export default KitchenOrderDetailModal;