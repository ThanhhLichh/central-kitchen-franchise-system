import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getOrdersApi, getOrderByIdApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import axiosClient from "../api/axios";
import { ORDER_API } from "../api/config";
import KitchenOrderDetailModal from "../components/KitchenOrderDetailModal";
import { FiEye, FiPlay, FiTruck } from "react-icons/fi";
import "./KitchenOrdersPage.css";
import { getStoresApi } from "../api/adminApi";
import { getDeliveriesApi } from "../api/deliveryApi";
import CreateDeliveryModal from "../components/CreateDeliveryModal";
import { getProductionPlansApi } from "../api/productionApi";

function KitchenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [plans, setPlans] = useState([]);

  const [createDeliveryOrder, setCreateDeliveryOrder] = useState(null);
  const [isCreateDeliveryOpen, setIsCreateDeliveryOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, productsData, storesData, deliveriesData, plansData] =
        await Promise.all([
          getOrdersApi(),
          getProductsApi(),
          getStoresApi(),
          getDeliveriesApi(),
          getProductionPlansApi(),
        ]);

      const normalizedPlans = Array.isArray(plansData) ? plansData : [];
      

      const normalizedOrders = Array.isArray(ordersData) ? ordersData : [];
      const normalizedProducts = Array.isArray(productsData) ? productsData : [];
      const normalizedStores = Array.isArray(storesData) ? storesData : [];
      const normalizedDeliveries = Array.isArray(deliveriesData)
        ? deliveriesData
        : [];

      const filteredOrders = normalizedOrders.filter(
        (order) =>
          order.status === "pending" ||
          order.status === "waiting_production" ||
          order.status === "processing"
      );
      setPlans(normalizedPlans);
      setOrders(filteredOrders);
      setProducts(normalizedProducts);
      setStores(normalizedStores);
      setDeliveries(normalizedDeliveries);
    } catch (err) {
      console.error(err);
      setError("Không tải được đơn hàng cần xử lý.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const planMapByOrderId = useMemo(() => {
  return plans.reduce((acc, plan) => {
    acc[plan.orderId] = plan;
    return acc;
  }, {});
}, [plans]);

  const deliveryMapByOrderId = useMemo(() => {
    return deliveries.reduce((acc, delivery) => {
      acc[delivery.order_id] = delivery;
      return acc;
    }, {});
  }, [deliveries]);

  const storeMap = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});
  }, [stores]);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

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

  const handleViewDetail = async (orderId) => {
    try {
      setDetailLoadingId(orderId);
      const data = await getOrderByIdApi(orderId);
      setSelectedOrder(data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleStartProcessing = async (orderId) => {
    try {
      setActionLoadingId(orderId);

      await axiosClient.put(ORDER_API.UPDATE_STATUS(orderId), {
        status: "processing",
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="kitchen-orders-page">
        <div className="kitchen-orders-top">
          <div>
            <h1 className="kitchen-orders-title">Đơn hàng cần xử lý</h1>
            <p className="kitchen-orders-subtitle">
              Theo dõi các đơn từ cửa hàng, bao gồm cả đơn chờ sản xuất
            </p>
          </div>
        </div>

        <div className="kitchen-orders-toolbar">
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
            <option value="waiting_production">Waiting Production</option>
            <option value="processing">Processing</option>
          </select>
        </div>

        <div className="kitchen-orders-panel">
          {loading ? (
            <div className="kitchen-orders-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="kitchen-orders-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Tên cửa hàng</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Số mặt hàng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        Không có đơn hàng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
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
                        <td>
                          <div className="kitchen-actions">
                            <button
                              className="view-btn"
                              onClick={() => handleViewDetail(order.id)}
                              disabled={detailLoadingId === order.id}
                            >
                              <FiEye className="btn-icon" />
                              {detailLoadingId === order.id ? "Đang tải..." : "Xem"}
                            </button>

                            {order.status === "pending" && (
                              <button
                                className="process-btn"
                                onClick={() => handleStartProcessing(order.id)}
                                disabled={actionLoadingId === order.id}
                              >
                                <FiPlay className="btn-icon" />
                                {actionLoadingId === order.id
                                  ? "Đang cập nhật..."
                                  : "Nhận xử lý"}
                              </button>
                            )}

                            {order.status === "waiting_production" && !planMapByOrderId[order.id] && (
                                <span className="waiting-production-pill">
                                  Chờ coordinator tạo sản xuất
                                </span>
                              )}

                              {order.status === "waiting_production" &&
                                planMapByOrderId[order.id]?.status === "pending" && (
                                  <span className="waiting-production-pill">
                                    Đang chờ nhận lệnh sản xuất
                                  </span>
                              )}

                              {order.status === "waiting_production" &&
                                planMapByOrderId[order.id]?.status === "processing" && (
                                  <span className="processing-pill">
                                    Đang sản xuất
                                  </span>
                              )}

                              {order.status === "waiting_production" &&
                                planMapByOrderId[order.id]?.status === "done" && (
                                  <span className="done-production-pill">
                                    Đã hoàn tất sản xuất
                                  </span>
                              )}

                            {order.status === "processing" && (
                              <span className="processing-pill">Đang xử lý</span>
                            )}

                            {order.status === "processing" &&
                              !deliveryMapByOrderId[order.id] && (
                                <button
                                  className="delivery-btn"
                                  onClick={() => {
                                    setCreateDeliveryOrder(order);
                                    setIsCreateDeliveryOpen(true);
                                  }}
                                >
                                  <FiTruck className="btn-icon" />
                                  Giao cho bên vận chuyển
                                </button>
                              )}

                            {order.status === "processing" &&
                              deliveryMapByOrderId[order.id] && (
                                <span className="delivery-created-pill">
                                  Đã tạo giao hàng
                                </span>
                              )}
                          </div>
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

      <KitchenOrderDetailModal
        order={selectedOrder}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        productsMap={productsMap}
        storeMap={storeMap}
      />

      <CreateDeliveryModal
        open={isCreateDeliveryOpen}
        order={createDeliveryOrder}
        onClose={() => {
          setIsCreateDeliveryOpen(false);
          setCreateDeliveryOrder(null);
        }}
        onCreated={fetchData}
      />
    </Layout>
  );
}

export default KitchenOrdersPage;