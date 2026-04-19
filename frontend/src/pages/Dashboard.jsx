import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi } from "../api/orderApi";
import "./Dashboard.css";
import { FaShoppingCart, FaClock, FaSpinner, FaCheckCircle } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName") || localStorage.getItem("username");
  const storeId = localStorage.getItem("storeId");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrdersApi();

        const normalized = Array.isArray(data) ? data : [];

        // Nếu order có store_id thì lọc theo cửa hàng đăng nhập.
        // Nếu backend chưa trả store_id đúng format thì fallback lấy hết.
        const filtered = normalized.filter((order) => {
          if (!storeId) return true;
          if (order.store_id === undefined || order.store_id === null) return true;
          return String(order.store_id) === String(storeId);
        });

        setOrders(filtered);
      } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [storeId]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const completed = orders.filter((o) => o.status === "completed").length;

    return { total, pending, processing, completed };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-top">
          <div>
            <h1 className="dashboard-title">Tổng quan cửa hàng</h1>
            <p className="dashboard-subtitle">
              Xin chào <strong>{fullName}</strong>
              {role === "FranchiseStoreStaff" && storeId ? (
                <> • Mã cửa hàng: {storeId.slice(0, 8)}</>
              ) : null}
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/orders/create")}
          >
            + Tạo đơn mới
          </button>
        </div>

        {loading ? (
          <div className="dashboard-state">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="dashboard-state error">{error}</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-content">
                  <div>
                    <p>Tổng đơn hàng</p>
                    <h2>{stats.total}</h2>
                  </div>
                  <FaShoppingCart className="stat-icon" />
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-content">
                  <div>
                    <p>Đang chờ</p>
                    <h2>{stats.pending}</h2>
                  </div>
                  <FaClock className="stat-icon" />
                </div>
              </div>

              <div className="stat-card processing">
                <div className="stat-content">
                  <div>
                    <p>Đang xử lý</p>
                    <h2>{stats.processing}</h2>
                  </div>
                  <FaSpinner className="stat-icon spin" />
                </div>
              </div>

              <div className="stat-card completed">
                <div className="stat-content">
                  <div>
                    <p>Hoàn thành</p>
                    <h2>{stats.completed}</h2>
                  </div>
                  <FaCheckCircle className="stat-icon" />
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h3>Đơn hàng gần đây</h3>
                  <span>Theo dõi nhanh các đơn mới nhất của cửa hàng</span>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() => navigate("/orders")}
                >
                  Xem tất cả
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái</th>
                      <th>Số mặt hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-row">
                          Chưa có đơn hàng nào.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;