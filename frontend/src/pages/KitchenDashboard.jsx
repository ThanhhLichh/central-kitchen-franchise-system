import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import {
  FiClipboard,
  FiClock,
  FiRefreshCw,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import "./KitchenDashboard.css";
import { getStoresApi } from "../api/adminApi";

function KitchenDashboard() {
  const navigate = useNavigate();
  const fullName =
    localStorage.getItem("fullName") || localStorage.getItem("username") || "Nhân viên bếp";

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stores, setStores] = useState([]);
  

  const fetchDashboardData = async () => {
    try {
        setLoading(true);
        setError("");

        const [ordersData, inventoryData, productsData, storesData] = await Promise.all([
        getOrdersApi(),
        axiosClient.get(INVENTORY_API.GET_ALL),
        getProductsApi(),
        getStoresApi(),
        ]);

        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setInventory(Array.isArray(inventoryData.data) ? inventoryData.data : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
        console.error(err);
        setError("Không tải được dữ liệu tổng quan bếp trung tâm.");
    } finally {
        setLoading(false);
    }
    };
  const storeMap = useMemo(() => {
    return stores.reduce((acc, store) => {
        acc[store.id] = store;
        return acc;
    }, {});
    }, [stores]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const processingOrders = orders.filter((o) => o.status === "processing").length;
    const totalInventoryItems = inventory.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      totalInventoryItems,
    };
  }, [orders, inventory]);

  const latestOrders = useMemo(() => {
    return [...orders].slice(0, 5);
  }, [orders]);

  const lowStockItems = useMemo(() => {
    return inventory
      .filter((item) => Number(item.quantity) <= 20)
      .slice(0, 5);
  }, [inventory]);

  return (
    <Layout>
      <div className="kitchen-dashboard-page">
        <div className="kitchen-hero">
          <div className="kitchen-hero-left">
            <span className="kitchen-badge">Central Kitchen</span>
            <h1>Tổng quan bếp trung tâm</h1>
            <p>
              Xin chào <strong>{fullName}</strong>. Theo dõi nhanh tình trạng đơn hàng,
              tiến độ xử lý và tồn kho hiện tại của bếp trung tâm.
            </p>
          </div>

          <button className="kitchen-primary-btn" onClick={() => navigate("/kitchen/orders")}>
            Xem đơn cần xử lý
            <FiArrowRight />
          </button>
        </div>

        {loading ? (
          <div className="kitchen-state-box">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="kitchen-state-box error">{error}</div>
        ) : (
          <>
            <div className="kitchen-stats-grid">
              <div className="kitchen-stat-card total">
                <div className="stat-icon-wrap">
                  <FiClipboard />
                </div>
                <div>
                  <p>Tổng đơn hàng</p>
                  <h2>{stats.totalOrders}</h2>
                </div>
              </div>

              <div className="kitchen-stat-card pending">
                <div className="stat-icon-wrap">
                  <FiClock />
                </div>
                <div>
                  <p>Đơn mới</p>
                  <h2>{stats.pendingOrders}</h2>
                </div>
              </div>

              <div className="kitchen-stat-card processing">
                <div className="stat-icon-wrap">
                  <FiRefreshCw />
                </div>
                <div>
                  <p>Đang xử lý</p>
                  <h2>{stats.processingOrders}</h2>
                </div>
              </div>

              <div className="kitchen-stat-card inventory">
                <div className="stat-icon-wrap">
                  <FiPackage />
                </div>
                <div>
                  <p>Tổng tồn kho</p>
                  <h2>{stats.totalInventoryItems}</h2>
                </div>
              </div>
            </div>

            <div className="kitchen-dashboard-grid">
              <div className="kitchen-panel">
                <div className="panel-head">
                  <div>
                    <h3>Đơn hàng mới nhất</h3>
                    <span>Theo dõi nhanh các đơn vừa được gửi từ cửa hàng</span>
                  </div>

                  <button
                    className="kitchen-secondary-btn"
                    onClick={() => navigate("/kitchen/orders")}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Tên cửa hàng</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Số mặt hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-row">
                            Chưa có đơn hàng nào.
                          </td>
                        </tr>
                      ) : (
                        latestOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="highlight-cell">ORD-{order.id}</td>
                            <td>{storeMap[order.store_id]?.name || order.store_id || "--"}</td>
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

              <div className="kitchen-panel">
                <div className="panel-head">
                  <div>
                    <h3>Tồn kho sắp thấp</h3>
                    <span>Những nguyên liệu cần ưu tiên kiểm tra hoặc nhập thêm</span>
                  </div>

                  <button
                    className="kitchen-secondary-btn"
                    onClick={() => navigate("/kitchen/inventory")}
                  >
                    Xem kho
                  </button>
                </div>

                <div className="low-stock-list">
                  {lowStockItems.length === 0 ? (
                    <p className="empty-low-stock">Hiện chưa có nguyên liệu nào ở mức thấp.</p>
                  ) : (
                    lowStockItems.map((item, index) => (
                      <div className="low-stock-item" key={index}>
                        <div>
                          <h4>{productMap[item.product_id]?.name || `Sản phẩm #${item.product_id}`}</h4>
                          <p>Đơn vị: {productMap[item.product_id]?.unit || "--"}</p>
                        </div>
                        <span className="low-stock-qty">{item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default KitchenDashboard;