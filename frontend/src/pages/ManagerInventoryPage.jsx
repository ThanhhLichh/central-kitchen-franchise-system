import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getProductsApi, getStoreInventoryApi } from "../api/inventoryApi";
import { getStoresApi } from "../api/adminApi";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import { FiBox, FiHome } from "react-icons/fi";
import "./ManagerInventoryPage.css";

function ManagerInventoryPage() {
  const [activeTab, setActiveTab] = useState("central");
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [centralInventory, setCentralInventory] = useState([]);
  const [storeInventory, setStoreInventory] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsData, storesData, centralInventoryRes] = await Promise.all([
        getProductsApi(),
        getStoresApi(),
        axiosClient.get(INVENTORY_API.GET_ALL),
      ]);

      const normalizedProducts = Array.isArray(productsData) ? productsData : [];
      const normalizedStores = Array.isArray(storesData) ? storesData : [];
      const normalizedCentralInventory = Array.isArray(centralInventoryRes.data)
        ? centralInventoryRes.data
        : [];

      setProducts(normalizedProducts);
      setStores(normalizedStores);
      setCentralInventory(normalizedCentralInventory);

      const firstStore = normalizedStores.find((store) => store.id);
      if (firstStore) {
        setSelectedStoreId(firstStore.id);
      }
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStoreInventory = async () => {
      if (!selectedStoreId) {
        setStoreInventory([]);
        return;
      }

      try {
        setStoreLoading(true);
        const data = await getStoreInventoryApi(selectedStoreId);
        setStoreInventory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setStoreLoading(false);
      }
    };

    fetchStoreInventory();
  }, [selectedStoreId]);

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const selectedStore = useMemo(() => {
    return stores.find((store) => String(store.id) === String(selectedStoreId));
  }, [stores, selectedStoreId]);

  const centralSummary = useMemo(() => {
    return centralInventory.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [centralInventory]);

  const storeSummary = useMemo(() => {
    return storeInventory.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [storeInventory]);

  return (
    <Layout>
      <div className="manager-inventory-page">
        <div className="manager-inventory-top">
          <div>
            <h1 className="manager-inventory-title">Quản lý tồn kho</h1>
            <p className="manager-inventory-subtitle">
              Theo dõi tồn kho bếp trung tâm và tồn kho từng cửa hàng trong hệ thống
            </p>
          </div>
        </div>

        <div className="inventory-tabs">
          <button
            className={`inventory-tab ${activeTab === "central" ? "active" : ""}`}
            onClick={() => setActiveTab("central")}
          >
            <FiBox />
            Kho trung tâm
          </button>

          <button
            className={`inventory-tab ${activeTab === "store" ? "active" : ""}`}
            onClick={() => setActiveTab("store")}
          >
            <FiHome />
            Kho cửa hàng
          </button>
        </div>

        {loading ? (
          <div className="inventory-state">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="inventory-state error">{error}</div>
        ) : (
          <>
            {activeTab === "central" && (
              <div className="inventory-panel">
                <div className="inventory-panel-head">
                  <div>
                    <h3>Tồn kho bếp trung tâm</h3>
                    <span>Tổng số lượng hiện có: {centralSummary}</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centralInventory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-row">
                            Chưa có dữ liệu tồn kho trung tâm.
                          </td>
                        </tr>
                      ) : (
                        centralInventory.map((item, index) => {
                          const product = productMap[item.product_id];
                          const quantity = Number(item.quantity || 0);
                          const isLow = quantity <= 20;

                          return (
                            <tr key={`${item.product_id}-${index}`}>
                              <td className="highlight-cell">{item.product_id}</td>
                              <td>{product?.name || "Chưa có tên"}</td>
                              <td>{product?.unit || "--"}</td>
                              <td>{quantity}</td>
                              <td>
                                <span className={`stock-badge ${isLow ? "low" : "ok"}`}>
                                  {isLow ? "Sắp thấp" : "Ổn định"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "store" && (
              <div className="inventory-panel">
                <div className="inventory-panel-head store-head">
                  <div>
                    <h3>Tồn kho cửa hàng</h3>
                    <span>
                      {selectedStore
                        ? `${selectedStore.name} • Tổng số lượng: ${storeSummary}`
                        : "Chọn cửa hàng để xem tồn kho"}
                    </span>
                  </div>

                  <select
                    className="store-select"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                {storeLoading ? (
                  <div className="inventory-state">Đang tải tồn kho cửa hàng...</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Tên sản phẩm</th>
                          <th>Đơn vị</th>
                          <th>Số lượng</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeInventory.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty-row">
                              Chưa có dữ liệu tồn kho cửa hàng.
                            </td>
                          </tr>
                        ) : (
                          storeInventory.map((item, index) => {
                            const product = productMap[item.product_id];
                            const quantity = Number(item.quantity || 0);
                            const isLow = quantity <= 10;

                            return (
                              <tr key={`${item.product_id}-${index}`}>
                                <td className="highlight-cell">{item.product_id}</td>
                                <td>{product?.name || "Chưa có tên"}</td>
                                <td>{product?.unit || "--"}</td>
                                <td>{quantity}</td>
                                <td>
                                  <span className={`stock-badge ${isLow ? "low" : "ok"}`}>
                                    {isLow ? "Cần bổ sung" : "Ổn định"}
                                  </span>
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
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default ManagerInventoryPage;