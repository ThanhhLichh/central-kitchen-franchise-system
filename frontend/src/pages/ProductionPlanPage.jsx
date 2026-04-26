import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  getProductionPlansApi,
  updateProductionStatusApi,
} from "../api/productionApi";
import { getOrdersApi, getOrderByIdApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import axiosClient from "../api/axios";
import { INVENTORY_API, ORDER_API } from "../api/config";
import { FiPlay, FiCheckCircle } from "react-icons/fi";
import "./ProductionPlanPage.css";

function ProductionPlanPage() {
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [plansData, ordersData, productsData] = await Promise.all([
        getProductionPlansApi(),
        getOrdersApi(),
        getProductsApi(),
      ]);

      setPlans(Array.isArray(plansData) ? plansData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách lệnh sản xuất.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ordersMap = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.id] = order;
      return acc;
    }, {});
  }, [orders]);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        String(plan.id).includes(keyword) ||
        String(plan.orderId).includes(keyword) ||
        String(plan.productId).includes(keyword) ||
        `PLAN-${plan.id}`.toLowerCase().includes(keyword) ||
        `ORD-${plan.orderId}`.toLowerCase().includes(keyword) ||
        (productsMap[plan.productId]?.name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ? true : plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter, productsMap]);

  const handleStartProduction = async (plan) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn bắt đầu sản xuất cho PLAN-${plan.id} không?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(plan.id);

      await updateProductionStatusApi({
        id: plan.id,
        status: "processing",
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái sang processing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFinishProduction = async (plan) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn hoàn tất sản xuất cho PLAN-${plan.id} không?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(plan.id);

      const updatedPlan = await updateProductionStatusApi({
        id: plan.id,
        status: "done",
      });

      await axiosClient.post(INVENTORY_API.IMPORT, {
        product_id: updatedPlan.productId,
        quantity: updatedPlan.quantity,
      });

      await axiosClient.put(ORDER_API.UPDATE_STATUS(updatedPlan.orderId), {
        status: "processing",
      });

      const order = await getOrderByIdApi(updatedPlan.orderId);

        if (!order || !Array.isArray(order.items) || order.items.length === 0) {
        throw new Error("Không tìm thấy danh sách sản phẩm của đơn hàng.");
        }

        await axiosClient.post(INVENTORY_API.EXPORT, {
        items: order.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
        })),
        });

      await fetchData();
      alert("Hoàn tất sản xuất thành công. Đơn hàng đã chuyển sang processing.");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi hoàn tất sản xuất.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="production-page">
        <div className="production-top">
          <div>
            <h1 className="production-title">Lệnh sản xuất</h1>
            <p className="production-subtitle">
              Theo dõi và xử lý các production plan do điều phối tạo
            </p>
          </div>
        </div>

        <div className="production-toolbar">
          <input
            type="text"
            placeholder="Tìm theo mã plan, order, sản phẩm..."
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
            <option value="done">Done</option>
          </select>
        </div>

        <div className="production-panel">
          {loading ? (
            <div className="production-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="production-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã plan</th>
                    <th>Mã đơn</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        Không có lệnh sản xuất phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="highlight-cell">PLAN-{plan.id}</td>
                        <td>ORD-{plan.orderId}</td>
                        <td>
                          {productsMap[plan.productId]?.name ||
                            `Product #${plan.productId}`}
                        </td>
                        <td>{plan.quantity}</td>
                        <td>
                          <span className={`status-badge ${plan.status}`}>
                            {plan.status}
                          </span>
                        </td>
                        <td>
                          <div className="production-actions">
                            {plan.status === "pending" && (
                              <button
                                className="start-btn"
                                onClick={() => handleStartProduction(plan)}
                                disabled={actionLoadingId === plan.id}
                              >
                                <FiPlay className="btn-icon" />
                                {actionLoadingId === plan.id
                                  ? "Đang cập nhật..."
                                  : "Bắt đầu sản xuất"}
                              </button>
                            )}

                            {plan.status === "processing" && (
                              <button
                                className="done-btn"
                                onClick={() => handleFinishProduction(plan)}
                                disabled={actionLoadingId === plan.id}
                              >
                                <FiCheckCircle className="btn-icon" />
                                {actionLoadingId === plan.id
                                  ? "Đang xử lý..."
                                  : "Hoàn tất sản xuất"}
                              </button>
                            )}

                            {plan.status === "done" && (
                              <span className="done-pill">Đã hoàn tất</span>
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
    </Layout>
  );
}

export default ProductionPlanPage;