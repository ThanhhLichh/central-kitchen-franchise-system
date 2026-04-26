import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getOrdersApi, getOrderByIdApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import { getDeliveriesApi } from "../api/deliveryApi";
import axiosClient from "../api/axios";
import { ORDER_API, INVENTORY_API } from "../api/config";
import OrderDetailModal from "../components/OrderDetailModal";
import Pagination from "../components/Pagination";
import "./OrdersPage.css";
import { FiEye, FiCheckCircle, FiXCircle } from "react-icons/fi";

function OrdersPage() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem("storeId");
  const storeName = localStorage.getItem("storeName");
  const username =
    localStorage.getItem("fullName") || localStorage.getItem("username");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [receivingOrderId, setReceivingOrderId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersData, productsData, deliveriesData] = await Promise.all([
        getOrdersApi(),
        getProductsApi(),
        getDeliveriesApi(),
      ]);

      const normalizedOrders = Array.isArray(ordersData) ? ordersData : [];
      const normalizedProducts = Array.isArray(productsData) ? productsData : [];
      const normalizedDeliveries = Array.isArray(deliveriesData)
        ? deliveriesData
        : [];

      const filteredByStore = normalizedOrders.filter((order) => {
        if (!storeId) return true;
        if (order.store_id === undefined || order.store_id === null) return true;
        return String(order.store_id) === String(storeId);
      });

      setOrders(filteredByStore);
      setProducts(normalizedProducts);
      setDeliveries(normalizedDeliveries);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {});
  }, [products]);

  const deliveryMapByOrderId = useMemo(() => {
    return deliveries.reduce((acc, delivery) => {
      acc[delivery.order_id] = delivery;
      return acc;
    }, {});
  }, [deliveries]);

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

  const handleReceiveOrder = async (order) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xác nhận đã nhận đơn ORD-${order.id} không?`
    );

    if (!confirmed) return;

    try {
      setReceivingOrderId(order.id);

      if (!order.items || order.items.length === 0) {
        throw new Error("Đơn hàng không có sản phẩm để nhập kho.");
      }

      for (const item of order.items) {
        await axiosClient.post(INVENTORY_API.STORE_IMPORT, {
          store_id: storeId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }

      try {
        await axiosClient.put(ORDER_API.UPDATE_STATUS(order.id), {
          status: "completed",
        });
      } catch (statusErr) {
        console.error(statusErr);
        alert("Đã cộng kho cửa hàng, nhưng chưa cập nhật được trạng thái đơn hàng.");
        await fetchData();
        return;
      }

      await fetchData();
      alert("Xác nhận nhận hàng thành công.");
    } catch (err) {
      console.error(err);
      alert("Xác nhận nhận hàng thất bại.");
    } finally {
      setReceivingOrderId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn hủy đơn ORD-${order.id} không?`
    );

    if (!confirmed) return;

    try {
      setReceivingOrderId(order.id);

      await axiosClient.put(ORDER_API.UPDATE_STATUS(order.id), {
        status: "cancelled",
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Hủy đơn hàng thất bại.");
    } finally {
      setReceivingOrderId(null);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

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
            <option value="waiting_production">Waiting Production</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="orders-panel">
          {loading ? (
            <div className="orders-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="orders-state error">{error}</div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái đơn</th>
                      <th>Trạng thái giao hàng</th>
                      <th>Số mặt hàng</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row">
                          Không có đơn hàng phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => {
                        const delivery = deliveryMapByOrderId[order.id];

                        return (
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
                            <td>
                              {delivery ? (
                                <span className={`delivery-badge ${delivery.status}`}>
                                  {delivery.status}
                                </span>
                              ) : (
                                <span className="delivery-badge none">
                                  Chưa tạo giao hàng
                                </span>
                              )}
                            </td>
                            <td>{order.items?.length || 0}</td>
                            <td>
                              <div className="order-actions">
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

                                {(order.status === "pending" ||
                                  order.status === "waiting_production") && (
                                  <button
                                    className="cancel-btn"
                                    onClick={() => handleCancelOrder(order)}
                                    disabled={receivingOrderId === order.id}
                                  >
                                    <FiXCircle className="btn-icon" />
                                    {receivingOrderId === order.id
                                      ? "Đang hủy..."
                                      : "Hủy đơn"}
                                  </button>
                                )}

                                {delivery?.status === "delivered" &&
                                  order.status !== "completed" && (
                                    <button
                                      className="receive-btn"
                                      onClick={() => handleReceiveOrder(order)}
                                      disabled={receivingOrderId === order.id}
                                    >
                                      <FiCheckCircle className="btn-icon" />
                                      {receivingOrderId === order.id
                                        ? "Đang nhận..."
                                        : "Nhận hàng"}
                                    </button>
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages || 1}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
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
        storeName={storeName}
        username={username}
        productsMap={productsMap}
      />
    </Layout>
  );
}

export default OrdersPage;s