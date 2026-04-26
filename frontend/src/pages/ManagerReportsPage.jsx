import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getOrdersApi } from "../api/orderApi";
import { getDeliveriesApi } from "../api/deliveryApi";
import { getProductionPlansApi } from "../api/productionApi";
import { getProductsApi } from "../api/inventoryApi";
import { getStoresApi } from "../api/adminApi";
import {
  FiBarChart2,
  FiClipboard,
  FiTruck,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";
import "./ManagerReportsPage.css";

function ManagerReportsPage() {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, deliveriesData, plansData, productsData, storesData] =
        await Promise.all([
          getOrdersApi(),
          getDeliveriesApi(),
          getProductionPlansApi(),
          getProductsApi(),
          getStoresApi(),
        ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const storeMap = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});
  }, [stores]);

  const orderStats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      waitingProduction: orders.filter(
        (o) => o.status === "waiting_production"
      ).length,
      processing: orders.filter((o) => o.status === "processing").length,
      completed: orders.filter((o) => o.status === "completed").length,
    };
  }, [orders]);

  const deliveryStats = useMemo(() => {
    return {
      pending: deliveries.filter((d) => d.status === "pending").length,
      shipping: deliveries.filter((d) => d.status === "shipping").length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
    };
  }, [deliveries]);

  const productionStats = useMemo(() => {
    return {
      pending: plans.filter((p) => p.status === "pending").length,
      processing: plans.filter((p) => p.status === "processing").length,
      done: plans.filter((p) => p.status === "done").length,
    };
  }, [plans]);

  const topProducts = useMemo(() => {
    const counter = {};

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!counter[item.product_id]) {
          counter[item.product_id] = 0;
        }
        counter[item.product_id] += Number(item.quantity || 0);
      });
    });

    return Object.entries(counter)
      .map(([productId, totalQuantity]) => ({
        productId: Number(productId),
        totalQuantity,
        name: productMap[productId]?.name || `Sản phẩm #${productId}`,
        unit: productMap[productId]?.unit || "--",
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
  }, [orders, productMap]);

  const ordersByStore = useMemo(() => {
    const counter = {};

    orders.forEach((order) => {
      const storeId = order.store_id || "unknown";
      if (!counter[storeId]) {
        counter[storeId] = 0;
      }
      counter[storeId] += 1;
    });

    return Object.entries(counter)
      .map(([storeId, totalOrders]) => ({
        storeId,
        totalOrders,
        storeName: storeMap[storeId]?.name || storeId || "Không xác định",
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 8);
  }, [orders, storeMap]);

  return (
    <Layout>
      <div className="manager-reports-page">
        <div className="manager-reports-top">
          <div>
            <h1 className="manager-reports-title">Báo cáo vận hành</h1>
            <p className="manager-reports-subtitle">
              Tổng hợp nhanh tình trạng đơn hàng, giao vận, sản xuất và hiệu quả
              hoạt động hệ thống
            </p>
          </div>
        </div>

        {loading ? (
          <div className="manager-reports-state">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="manager-reports-state error">{error}</div>
        ) : (
          <>
            <div className="reports-grid">
              <div className="report-card">
                <div className="report-card-head">
                  <FiClipboard />
                  <h3>Đơn hàng</h3>
                </div>
                <div className="report-list">
                  <div className="report-item">
                    <span>Pending</span>
                    <strong>{orderStats.pending}</strong>
                  </div>
                  <div className="report-item">
                    <span>Waiting Production</span>
                    <strong>{orderStats.waitingProduction}</strong>
                  </div>
                  <div className="report-item">
                    <span>Processing</span>
                    <strong>{orderStats.processing}</strong>
                  </div>
                  <div className="report-item">
                    <span>Completed</span>
                    <strong>{orderStats.completed}</strong>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-head">
                  <FiTruck />
                  <h3>Giao hàng</h3>
                </div>
                <div className="report-list">
                  <div className="report-item">
                    <span>Pending</span>
                    <strong>{deliveryStats.pending}</strong>
                  </div>
                  <div className="report-item">
                    <span>Shipping</span>
                    <strong>{deliveryStats.shipping}</strong>
                  </div>
                  <div className="report-item">
                    <span>Delivered</span>
                    <strong>{deliveryStats.delivered}</strong>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-head">
                  <FiTool />
                  <h3>Sản xuất</h3>
                </div>
                <div className="report-list">
                  <div className="report-item">
                    <span>Pending</span>
                    <strong>{productionStats.pending}</strong>
                  </div>
                  <div className="report-item">
                    <span>Processing</span>
                    <strong>{productionStats.processing}</strong>
                  </div>
                  <div className="report-item">
                    <span>Done</span>
                    <strong>{productionStats.done}</strong>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-head">
                  <FiBarChart2 />
                  <h3>Tổng quan</h3>
                </div>
                <div className="report-list">
                  <div className="report-item">
                    <span>Tổng Orders</span>
                    <strong>{orders.length}</strong>
                  </div>
                  <div className="report-item">
                    <span>Tổng Deliveries</span>
                    <strong>{deliveries.length}</strong>
                  </div>
                  <div className="report-item">
                    <span>Tổng Plans</span>
                    <strong>{plans.length}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="reports-bottom-grid">
              <div className="manager-report-panel">
                <div className="panel-head">
                  <div>
                    <h3>Top sản phẩm được order nhiều</h3>
                    <span>Thống kê theo tổng số lượng trong đơn hàng</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Đơn vị</th>
                        <th>Tổng SL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            Chưa có dữ liệu sản phẩm.
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((product) => (
                          <tr key={product.productId}>
                            <td className="highlight-cell">{product.productId}</td>
                            <td>{product.name}</td>
                            <td>{product.unit}</td>
                            <td>{product.totalQuantity}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="manager-report-panel">
                <div className="panel-head">
                  <div>
                    <h3>Số đơn theo cửa hàng</h3>
                    <span>So sánh nhanh hoạt động đặt hàng giữa các store</span>
                  </div>
                </div>

                <div className="store-report-list">
                  {ordersByStore.length === 0 ? (
                    <p className="empty-store-text">Chưa có dữ liệu cửa hàng.</p>
                  ) : (
                    ordersByStore.map((store) => (
                      <div className="store-report-item" key={store.storeId}>
                        <div>
                          <h4>{store.storeName}</h4>
                          <p>Store ID: {store.storeId}</p>
                        </div>
                        <strong>{store.totalOrders}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="manager-insight-panel">
              <div className="insight-card">
                <FiTrendingUp />
                <div>
                  <h4>Nhận định nhanh</h4>
                  <p>
                    Hiện có <strong>{orderStats.waitingProduction}</strong> đơn chờ
                    sản xuất và <strong>{productionStats.pending}</strong> plan đang
                    chờ nhận lệnh.
                  </p>
                </div>
              </div>

              <div className="insight-card">
                <FiTruck />
                <div>
                  <h4>Phân phối</h4>
                  <p>
                    Có <strong>{deliveryStats.shipping}</strong> delivery đang trên
                    đường và <strong>{deliveryStats.pending}</strong> delivery chờ
                    xử lý tiếp.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default ManagerReportsPage;