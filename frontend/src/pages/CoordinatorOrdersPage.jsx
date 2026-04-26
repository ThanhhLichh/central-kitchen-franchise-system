import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getOrdersApi, getOrderByIdApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import { getStoresApi } from "../api/adminApi";
import { getProductionPlansApi } from "../api/productionApi";
import CoordinatorOrderDetailModal from "../components/CoordinatorOrderDetailModal";
import CreateProductionPlanModal from "../components/CreateProductionPlanModal";
import { FiEye, FiTool } from "react-icons/fi";
import "./CoordinatorOrdersPage.css";

function CoordinatorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("waiting_production");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const [createPlanOrder, setCreatePlanOrder] = useState(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const getPlanActionLabel = (status) => {
  switch (status) {
    case "pending":
      return "Đang chờ nhận lệnh";
    case "processing":
      return "Đang sản xuất";
    case "done":
      return "Đã hoàn tất sản xuất";
    default:
      return "Chưa tạo";
  }
};

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, productsData, storesData, plansData] =
        await Promise.all([
          getOrdersApi(),
          getProductsApi(),
          getStoresApi(),
          getProductionPlansApi(),
        ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const productsMap = useMemo(() => {
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

  const planMapByOrderId = useMemo(() => {
    return plans.reduce((acc, plan) => {
      acc[plan.orderId] = plan;
      return acc;
    }, {});
  }, [plans]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.trim().toLowerCase();
      const plan = planMapByOrderId[order.id];

      const matchesSearch =
        String(order.id).includes(keyword) ||
        `ORD-${order.id}`.toLowerCase().includes(keyword) ||
        (storeMap[order.store_id]?.name || "").toLowerCase().includes(keyword) ||
        (plan?.status || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter, storeMap, planMapByOrderId]);

  const handleViewDetail = async (orderId) => {
    try {
      setDetailLoadingId(orderId);
      const data = await getOrderByIdApi(orderId);
      setSelectedOrder(data);
      setSelectedStoreName(storeMap[data.store_id]?.name || data.store_id || "--");
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="coordinator-orders-page">
        <div className="coordinator-orders-top">
          <div>
            <h1 className="coordinator-orders-title">Đơn hàng chờ sản xuất</h1>
            <p className="coordinator-orders-subtitle">
              Theo dõi các đơn thiếu hàng và tạo lệnh sản xuất cho bếp trung tâm
            </p>
          </div>
        </div>

        <div className="coordinator-toolbar">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên cửa hàng..."
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
            <option value="waiting_production">Waiting Production</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="coordinator-orders-panel">
          {loading ? (
            <div className="coordinator-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="coordinator-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Cửa hàng</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái đơn</th>
                    {/* <th>Trạng thái plan</th> */}
                    <th>Số SP thiếu</th>
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
                    filteredOrders.map((order) => {
                      const plan = planMapByOrderId[order.id];

                      return (
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
                          {/* <td>
                            {plan ? (
                              <span className={`plan-badge ${plan.status}`}>
                                {plan.status === "pending" && "pending"}
                                {plan.status === "processing" && "processing"}
                                {plan.status === "done" && "done"}
                              </span>
                            ) : (
                              <span className="plan-badge none">Chưa tạo</span>
                            )}
                          </td> */}
                          <td>{order.missing_items?.length || 0}</td>
                          <td>
                            <div className="coordinator-actions">
                              <button
                                className="view-btn"
                                onClick={() => handleViewDetail(order.id)}
                                disabled={detailLoadingId === order.id}
                              >
                                <FiEye className="btn-icon" />
                                {detailLoadingId === order.id ? "Đang tải..." : "Xem"}
                              </button>

                              {order.status === "waiting_production" && !plan && (
                                <button
                                  className="plan-btn"
                                  onClick={() => {
                                    setCreatePlanOrder(order);
                                    setIsCreatePlanOpen(true);
                                  }}
                                >
                                  <FiTool className="btn-icon" />
                                  Tạo lệnh sản xuất
                                </button>
                              )}

                              {order.status === "waiting_production" && plan && (
                                <span className={`plan-created-pill ${plan.status}`}>
                                    {getPlanActionLabel(plan.status)}
                                </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <CoordinatorOrderDetailModal
          order={selectedOrder}
          open={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedOrder(null);
            setSelectedStoreName("");
          }}
          productsMap={productsMap}
          storeName={selectedStoreName}
        />

        <CreateProductionPlanModal
          open={isCreatePlanOpen}
          onClose={() => {
            setIsCreatePlanOpen(false);
            setCreatePlanOrder(null);
          }}
          order={createPlanOrder}
          productsMap={productsMap}
          onCreated={fetchData}
        />
      </div>
    </Layout>
  );
}

export default CoordinatorOrdersPage;