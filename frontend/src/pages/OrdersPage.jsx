import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi, getOrderByIdApi } from "../api/orderApi";
import OrderDetailModal from "../components/OrderDetailModal";
import "./OrdersPage.css";
import { FiEye } from "react-icons/fi";

function OrdersPage() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem("storeId");

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrdersApi();
        const normalized = Array.isArray(data) ? data : [];

        const filteredByStore = normalized.filter((order) => {
          if (!storeId) return true;
          if (order.store_id === undefined || order.store_id === null) return true;
          return String(order.store_id) === String(storeId);
        });

        setOrders(filteredByStore);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [storeId]);

  const handleViewDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      setLoadingOrderId(orderId);

      const data = await getOrderByIdApi(orderId);
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
      setLoadingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        String(order.id).includes(search.trim()) ||
        `ORD-${order.id}`.toLowerCase().includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <Layout>
      <div className="orders-page">
        <div className="orders-top">
          <div>
            <h1 className="orders-title">Đơn hàng</h1>
            <p className="orders-subtitle">
              Theo dõi toàn bộ đơn hàng mà cửa hàng đã gửi tới bếp trung tâm
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/orders/create")}
          >
            + Tạo đơn mới
          </button>
        </div>

        <div className="orders-toolbar">
          <input
            type="text"
            placeholder="Tìm theo mã đơn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="orders-panel">
          {loading ? (
            <div className="orders-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="orders-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Số mặt hàng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        Không có đơn hàng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-code">ORD-{order.id}</td>
                        <td>
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("vi-VN")
                            : "--/--/----"}
                        </td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.items?.length || 0}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => handleViewDetail(order.id)}
                            disabled={detailLoading && loadingOrderId === order.id}
                            >
                            {detailLoading && loadingOrderId === order.id ? (
                                "Đang tải..."
                            ) : (
                                <>
                                <FiEye className="btn-icon" />
                                Xem chi tiết
                                </>
                            )}
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </Layout>
  );
}

export default OrdersPage;