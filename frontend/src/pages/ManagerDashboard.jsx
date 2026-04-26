import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi } from "../api/orderApi";
import { getDeliveriesApi } from "../api/deliveryApi";
import { getProductionPlansApi } from "../api/productionApi";
import { getProductsApi } from "../api/inventoryApi";
import { getStoresApi } from "../api/adminApi";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import {
  FiClipboard,
  FiClock,
  FiTool,
  FiTruck,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const navigate = useNavigate();
  const fullName =
    localStorage.getItem("fullName") ||
    localStorage.getItem("username") ||
    "Manager";

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ordersData,
        deliveriesData,
        plansData,
        productsData,
        storesData,
        inventoryRes,
      ] = await Promise.all([
        getOrdersApi(),
        getDeliveriesApi(),
        getProductionPlansApi(),
        getProductsApi(),
        getStoresApi(),
        axiosClient.get(INVENTORY_API.GET_ALL),
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu tổng quan manager.");
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

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const waitingProductionOrders = orders.filter(
      (o) => o.status === "waiting_production"
    ).length;
    const processingOrders = orders.filter(
      (o) => o.status === "processing"
    ).length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    const pendingDeliveries = deliveries.filter(
      (d) => d.status === "pending"
    ).length;
    const shippingDeliveries = deliveries.filter(
      (d) => d.status === "shipping"
    ).length;
    const deliveredDeliveries = deliveries.filter(
      (d) => d.status === "delivered"
    ).length;

    const pendingPlans = plans.filter((p) => p.status === "pending").length;
    const processingPlans = plans.filter(
      (p) => p.status === "processing"
    ).length;
    const donePlans = plans.filter((p) => p.status === "done").length;

    return {
      totalOrders,
      pendingOrders,
      waitingProductionOrders,
      processingOrders,
      completedOrders,
      pendingDeliveries,
      shippingDeliveries,
      deliveredDeliveries,
      pendingPlans,
      processingPlans,
      donePlans,
      cancelledOrders,
    };
  }, [orders, deliveries, plans]);

  const orderChartData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingOrders },
      { name: "Waiting", value: stats.waitingProductionOrders },
      { name: "Processing", value: stats.processingOrders },
      { name: "Completed", value: stats.completedOrders },
      { name: "Cancelled", value: stats.cancelledOrders },
    ],
    [stats]
  );

  const deliveryChartData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingDeliveries },
      { name: "Shipping", value: stats.shippingDeliveries },
      { name: "Delivered", value: stats.deliveredDeliveries },
    ],
    [stats]
  );

  const productionChartData = useMemo(
    () => [
      { name: "Pending", value: stats.pendingPlans },
      { name: "Processing", value: stats.processingPlans },
      { name: "Done", value: stats.donePlans },
    ],
    [stats]
  );

  const latestOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const latestDeliveries = useMemo(() => {
    return [...deliveries].slice(0, 5);
  }, [deliveries]);

  const lowStockItems = useMemo(() => {
    return inventory
      .filter((item) => Number(item.quantity) <= 20)
      .slice(0, 5);
  }, [inventory]);

  const topStores = useMemo(() => {
    const counter = {};
    orders.forEach((order) => {
      const id = order.store_id || "unknown";
      counter[id] = (counter[id] || 0) + 1;
    });

    return Object.entries(counter)
      .map(([storeId, total]) => ({
        storeId,
        name: storeMap[storeId]?.name || storeId,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders, storeMap]);

  return (
    <Layout>
      <div className="manager-dashboard-page">
        <div className="manager-hero">
          <div className="manager-hero-left">
            <span className="manager-badge">Manager Overview</span>
            <h1>Tổng quan vận hành</h1>
            <p>
              Xin chào <strong>{fullName}</strong>. Theo dõi nhanh tình hình đơn
              hàng, sản xuất, giao vận và tồn kho toàn hệ thống.
            </p>
          </div>

          <button
            className="manager-primary-btn"
            onClick={() => navigate("/manager/reports")}
          >
            Xem báo cáo
            <FiArrowRight />
          </button>
        </div>

        {loading ? (
          <div className="manager-state-box">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="manager-state-box error">{error}</div>
        ) : (
          <>
            <div className="manager-stats-grid">
              <div className="manager-stat-card orders">
                <div className="stat-icon-wrap">
                  <FiClipboard />
                </div>
                <div>
                  <p>Tổng đơn hàng</p>
                  <h2>{stats.totalOrders}</h2>
                  <span>
                    Pending {stats.pendingOrders} • Waiting{" "}
                    {stats.waitingProductionOrders}
                  </span>
                </div>
              </div>

              <div className="manager-stat-card production">
                <div className="stat-icon-wrap">
                  <FiTool />
                </div>
                <div>
                  <p>Sản xuất</p>
                  <h2>
                    {stats.pendingPlans + stats.processingPlans + stats.donePlans}
                  </h2>
                  <span>
                    Chờ {stats.pendingPlans} • Đang làm {stats.processingPlans}
                  </span>
                </div>
              </div>

              <div className="manager-stat-card delivery">
                <div className="stat-icon-wrap">
                  <FiTruck />
                </div>
                <div>
                  <p>Giao hàng</p>
                  <h2>
                    {stats.pendingDeliveries +
                      stats.shippingDeliveries +
                      stats.deliveredDeliveries}
                  </h2>
                  <span>
                    Chờ {stats.pendingDeliveries} • Đang giao{" "}
                    {stats.shippingDeliveries}
                  </span>
                </div>
              </div>

              <div className="manager-stat-card completed">
                <div className="stat-icon-wrap">
                  <FiCheckCircle />
                </div>
                <div>
                  <p>Đơn hoàn thành</p>
                  <h2>{stats.completedOrders}</h2>
                  <span>Delivered {stats.deliveredDeliveries}</span>
                </div>
              </div>
            </div>

            <div className="manager-chart-grid">
              <div className="manager-panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h3>Đơn hàng theo trạng thái</h3>
                    <span>Biểu đồ cột tổng quan order</span>
                  </div>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={orderChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        <Cell fill="#6366f1" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="manager-panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h3>Giao hàng theo trạng thái</h3>
                    <span>Biểu đồ tròn delivery</span>
                  </div>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={deliveryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="manager-panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h3>Lệnh sản xuất theo trạng thái</h3>
                    <span>Biểu đồ cột production plan</span>
                  </div>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={productionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        <Cell fill="#f97316" />
                        <Cell fill="#0ea5e9" />
                        <Cell fill="#10b981" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="manager-panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h3>Top cửa hàng theo số đơn</h3>
                    <span>Xem nhanh mức độ hoạt động từng store</span>
                  </div>
                </div>
                <div className="store-mini-list">
                  {topStores.length === 0 ? (
                    <p className="empty-low-stock">Chưa có dữ liệu cửa hàng.</p>
                  ) : (
                    topStores.map((store) => (
                      <div className="store-mini-item" key={store.storeId}>
                        <span>{store.name}</span>
                        <strong>{store.total}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="manager-dashboard-grid">
              <div className="manager-panel">
                <div className="panel-head">
                  <div>
                    <h3>Đơn hàng mới nhất</h3>
                    <span>Theo dõi nhanh trạng thái vận hành gần đây</span>
                  </div>

                  <button
                    className="manager-secondary-btn"
                    onClick={() => navigate("/manager/reports")}
                  >
                    Xem thêm
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Cửa hàng</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            Chưa có đơn hàng nào.
                          </td>
                        </tr>
                      ) : (
                        latestOrders.map((order) => (
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
                            <td>
                              <span className={`status-badge ${order.status}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="manager-panel">
                <div className="panel-head">
                  <div>
                    <h3>Delivery mới nhất</h3>
                    <span>Tổng quan phân phối hàng hóa</span>
                  </div>

                  {/* <button
                    className="manager-secondary-btn"
                    onClick={() => navigate("/delivery")}
                  >
                    Xem delivery
                  </button> */}
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

            <div className="manager-bottom-grid">
              <div className="manager-panel">
                <div className="panel-head">
                  <div>
                    <h3>Tồn kho trung tâm sắp thấp</h3>
                    <span>Những sản phẩm cần theo dõi hoặc nhập thêm</span>
                  </div>

                  <button
                    className="manager-secondary-btn"
                    onClick={() => navigate("/manager/inventory")}
                  >
                    Xem tồn kho
                  </button>
                </div>

                <div className="low-stock-list">
                  {lowStockItems.length === 0 ? (
                    <p className="empty-low-stock">
                      Hiện chưa có sản phẩm nào ở mức thấp.
                    </p>
                  ) : (
                    lowStockItems.map((item, index) => (
                      <div className="low-stock-item" key={index}>
                        <div className="low-stock-info">
                          <h4>
                            {productMap[item.product_id]?.name ||
                              `Sản phẩm #${item.product_id}`}
                          </h4>
                          <p>
                            Đơn vị: {productMap[item.product_id]?.unit || "--"}
                          </p>
                        </div>
                        <span className="low-stock-qty">{item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="manager-panel summary-panel">
                <div className="summary-box">
                  <span>Đơn chờ sản xuất</span>
                  <strong>{stats.waitingProductionOrders}</strong>
                </div>
                <div className="summary-box">
                  <span>Đơn đang xử lý</span>
                  <strong>{stats.processingOrders}</strong>
                </div>
                <div className="summary-box">
                  <span>Plan đã hoàn tất</span>
                  <strong>{stats.donePlans}</strong>
                </div>
                <div className="summary-box">
                  <span>Delivery đã giao</span>
                  <strong>{stats.deliveredDeliveries}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ManagerDashboard;