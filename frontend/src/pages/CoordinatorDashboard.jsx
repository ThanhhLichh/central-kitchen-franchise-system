import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi } from "../api/orderApi";
import { getProductionPlansApi } from "../api/productionApi";
import { getDeliveriesApi } from "../api/deliveryApi";
import { getStoresApi } from "../api/adminApi";
import {
  FiClipboard,
  FiTool,
  FiTruck,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import "./CoordinatorDashboard.css";

function CoordinatorDashboard() {
  const navigate = useNavigate();
  const fullName =
    localStorage.getItem("fullName") ||
    localStorage.getItem("username") ||
    "Điều phối viên";

  const [orders, setOrders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, plansData, deliveriesData, storesData] =
        await Promise.all([
          getOrdersApi(),
          getProductionPlansApi(),
          getDeliveriesApi(),
          getStoresApi(),
        ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu tổng quan điều phối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const storeMap = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});
  }, [stores]);

  const stats = useMemo(() => {
    const waitingProductionOrders = orders.filter(
      (o) => o.status === "waiting_production"
    ).length;

    const totalPlans = plans.length;
    const pendingPlans = plans.filter((p) => p.status === "pending").length;

    const pendingDeliveries = deliveries.filter(
      (d) => d.status === "pending"
    ).length;

    const shippingDeliveries = deliveries.filter(
      (d) => d.status === "shipping"
    ).length;

    return {
      waitingProductionOrders,
      totalPlans,
      pendingPlans,
      pendingDeliveries,
      shippingDeliveries,
    };
  }, [orders, plans, deliveries]);

  const waitingOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === "waiting_production")
      .slice(0, 5);
  }, [orders]);

  const latestDeliveries = useMemo(() => {
    return [...deliveries].slice(0, 5);
  }, [deliveries]);

  return (
    <Layout>
      <div className="coordinator-dashboard-page">
        <div className="coordinator-hero">
          <div className="coordinator-hero-left">
            <span className="coordinator-badge">Supply Coordinator</span>
            <h1>Tổng quan điều phối</h1>
            <p>
              Xin chào <strong>{fullName}</strong>. Theo dõi nhanh đơn hàng chờ
              sản xuất, lệnh sản xuất và tình trạng giao hàng trong hệ thống.
            </p>
          </div>

          <button
            className="coordinator-primary-btn"
            onClick={() => navigate("/coordinator/orders")}
          >
            Xem đơn chờ sản xuất
            <FiArrowRight />
          </button>
        </div>

        {loading ? (
          <div className="coordinator-state-box">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="coordinator-state-box error">{error}</div>
        ) : (
          <>
            <div className="coordinator-stats-grid">
              <div className="coordinator-stat-card waiting">
                <div className="stat-icon-wrap">
                  <FiClipboard />
                </div>
                <div>
                  <p>Đơn chờ sản xuất</p>
                  <h2>{stats.waitingProductionOrders}</h2>
                </div>
              </div>

              <div className="coordinator-stat-card production">
                <div className="stat-icon-wrap">
                  <FiTool />
                </div>
                <div>
                  <p>Lệnh sản xuất</p>
                  <h2>{stats.totalPlans}</h2>
                </div>
              </div>

              <div className="coordinator-stat-card delivery-pending">
                <div className="stat-icon-wrap">
                  <FiTruck />
                </div>
                <div>
                  <p>Delivery chờ giao</p>
                  <h2>{stats.pendingDeliveries}</h2>
                </div>
              </div>

              <div className="coordinator-stat-card delivery-shipping">
                <div className="stat-icon-wrap">
                  <FiCheckCircle />
                </div>
                <div>
                  <p>Đang vận chuyển</p>
                  <h2>{stats.shippingDeliveries}</h2>
                </div>
              </div>
            </div>

            <div className="coordinator-dashboard-grid">
              <div className="coordinator-panel">
                <div className="panel-head">
                  <div>
                    <h3>Đơn hàng chờ sản xuất</h3>
                    <span>Các đơn cần tạo plan để bếp tiếp tục xử lý</span>
                  </div>

                  <button
                    className="coordinator-secondary-btn"
                    onClick={() => navigate("/coordinator/orders")}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Cửa hàng</th>
                        <th>Ngày tạo</th>
                        <th>Số SP thiếu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitingOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            Không có đơn hàng chờ sản xuất.
                          </td>
                        </tr>
                      ) : (
                        waitingOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="highlight-cell">ORD-{order.id}</td>
                            <td>
                              {storeMap[order.store_id]?.name ||
                                order.store_id ||
                                "--"}
                            </td>
                            <td>
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "--/--/----"}
                            </td>
                            <td>{order.missing_items?.length || 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="coordinator-panel">
                <div className="panel-head">
                  <div>
                    <h3>Delivery mới nhất</h3>
                    <span>Theo dõi nhanh các lệnh giao hàng gần đây</span>
                  </div>

                  <button
                    className="coordinator-secondary-btn"
                    onClick={() => navigate("/delivery")}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Delivery</th>
                        <th>Order</th>
                        <th>Ngày giao</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestDeliveries.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            Chưa có delivery nào.
                          </td>
                        </tr>
                      ) : (
                        latestDeliveries.map((delivery) => (
                          <tr key={delivery.id}>
                            <td className="highlight-cell">DLV-{delivery.id}</td>
                            <td>ORD-{delivery.order_id}</td>
                            <td>{delivery.delivery_date || "--"}</td>
                            <td>
                              <span className={`status-badge ${delivery.status}`}>
                                {delivery.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="coordinator-summary-panel">
              <div className="summary-box">
                <span>Plan đang chờ nhận</span>
                <strong>{stats.pendingPlans}</strong>
              </div>
              <div className="summary-box">
                <span>Đơn cần phối hợp ngay</span>
                <strong>{stats.waitingProductionOrders}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default CoordinatorDashboard;