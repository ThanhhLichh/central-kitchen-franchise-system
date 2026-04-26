import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  getDeliveriesApi,
  getDeliveryByIdApi,
  updateDeliveryStatusApi,
} from "../api/deliveryApi";
import { getOrderByIdApi } from "../api/orderApi";
import { getStoresApi } from "../api/adminApi";
import DeliveryDetailModal from "../components/DeliveryDetailModal";
import ScheduleDeliveryModal from "../components/ScheduleDeliveryModal";
import { FiCalendar, FiEye, FiTruck, FiCheckCircle } from "react-icons/fi";
import "./DeliveryListPage.css";

function DeliveryListPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedStoreInfo, setSelectedStoreInfo] = useState({
    name: "",
    address: "",
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [scheduleDelivery, setScheduleDelivery] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const [deliveriesData, storesData] = await Promise.all([
        getDeliveriesApi(),
        getStoresApi(),
      ]);

      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách giao hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const storeMap = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {});
  }, [stores]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        String(delivery.id).includes(keyword) ||
        String(delivery.order_id).includes(keyword) ||
        `DLV-${delivery.id}`.toLowerCase().includes(keyword) ||
        `ORD-${delivery.order_id}`.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ? true : delivery.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoadingId(id);

      const deliveryData = await getDeliveryByIdApi(id);
      const orderData = await getOrderByIdApi(deliveryData.order_id);

      const store = storeMap[orderData.store_id];

      setSelectedDelivery(deliveryData);
      setSelectedStoreInfo({
        name: store?.name || "",
        address: store?.address || "",
      });

      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleUpdateStatus = async (delivery, nextStatus) => {
    const actionText =
      nextStatus === "shipping" ? "bắt đầu giao" : "xác nhận đã giao";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${actionText} cho delivery DLV-${delivery.id} không?`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(delivery.id);
      await updateDeliveryStatusApi(delivery.id, { status: nextStatus });
      await fetchDeliveries();
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái giao hàng.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="delivery-list-page">
        <div className="delivery-list-top">
          <div>
            <h1 className="delivery-list-title">Danh sách giao hàng</h1>
            <p className="delivery-list-subtitle">
              Theo dõi, lập lịch và cập nhật trạng thái vận chuyển
            </p>
          </div>
        </div>

        <div className="delivery-toolbar">
          <input
            type="text"
            placeholder="Tìm theo delivery ID hoặc order ID..."
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
            <option value="shipping">Shipping</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="delivery-panel">
          {loading ? (
            <div className="delivery-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="delivery-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Order ID</th>
                    <th>Ngày giao</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        Không có giao hàng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td className="highlight-cell">DLV-{delivery.id}</td>
                        <td>ORD-{delivery.order_id}</td>
                        <td>{delivery.delivery_date || "--"}</td>
                        <td>
                          {delivery.created_at
                            ? new Date(delivery.created_at).toLocaleDateString("vi-VN")
                            : "--/--/----"}
                        </td>
                        <td>
                          <span className={`status-badge ${delivery.status}`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td>
                          <div className="delivery-actions">
                            <button
                              className="view-btn"
                              onClick={() => handleViewDetail(delivery.id)}
                              disabled={detailLoadingId === delivery.id}
                            >
                              <FiEye className="btn-icon" />
                              {detailLoadingId === delivery.id ? "Đang tải..." : "Xem"}
                            </button>

                            {delivery.status === "pending" && (
                              <button
                                className="schedule-btn"
                                onClick={() => {
                                  setScheduleDelivery(delivery);
                                  setIsScheduleOpen(true);
                                }}
                              >
                                <FiCalendar className="btn-icon" />
                                Lập lịch giao
                              </button>
                            )}

                            {delivery.status === "pending" && (
                              <button
                                className="shipping-btn"
                                onClick={() => handleUpdateStatus(delivery, "shipping")}
                                disabled={actionLoadingId === delivery.id}
                              >
                                <FiTruck className="btn-icon" />
                                {actionLoadingId === delivery.id
                                  ? "Đang cập nhật..."
                                  : "Bắt đầu giao"}
                              </button>
                            )}

                            {delivery.status === "shipping" && (
                              <button
                                className="delivered-btn"
                                onClick={() => handleUpdateStatus(delivery, "delivered")}
                                disabled={actionLoadingId === delivery.id}
                              >
                                <FiCheckCircle className="btn-icon" />
                                {actionLoadingId === delivery.id
                                  ? "Đang cập nhật..."
                                  : "Đã giao"}
                              </button>
                            )}

                            {delivery.status === "delivered" && (
                              <span className="done-pill">Hoàn tất</span>
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

        <DeliveryDetailModal
          delivery={selectedDelivery}
          open={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedDelivery(null);
            setSelectedStoreInfo({
              name: "",
              address: "",
            });
          }}
          storeName={selectedStoreInfo.name}
          storeAddress={selectedStoreInfo.address}
        />

        <ScheduleDeliveryModal
          open={isScheduleOpen}
          delivery={scheduleDelivery}
          onClose={() => {
            setIsScheduleOpen(false);
            setScheduleDelivery(null);
          }}
          onScheduled={fetchDeliveries}
        />
      </div>
    </Layout>
  );
}

export default DeliveryListPage;