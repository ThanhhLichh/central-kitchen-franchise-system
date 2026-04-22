import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getStoreInventoryApi, getProductsApi } from "../api/inventoryApi";
import "./StoreInventoryPage.css";

function StoreInventoryPage() {
  const storeId = localStorage.getItem("storeId");
  const storeName = localStorage.getItem("storeName");

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const [inventoryData, productsData] = await Promise.all([
          getStoreInventoryApi(storeId),
          getProductsApi(),
        ]);

        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        console.error(err);
        setError("Không tải được tồn kho cửa hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchInventory();
    }
  }, [storeId]);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  return (
    <Layout>
      <div className="store-inventory-page">
        <div className="inventory-top">
          <div>
            <h1 className="inventory-title">Tồn kho cửa hàng</h1>
            <p className="inventory-subtitle">
              {storeName ? `Theo dõi tồn kho hiện tại của ${storeName}` : "Theo dõi tồn kho cửa hàng hiện tại"}
            </p>
          </div>
        </div>

        <div className="inventory-panel">
          {loading ? (
            <div className="inventory-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="inventory-state error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Đơn vị</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-row">
                        Chưa có dữ liệu tồn kho.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_id}</td>
                        <td>{productsMap[item.product_id]?.name || "Chưa có tên"}</td>
                        <td>{productsMap[item.product_id]?.unit || "--"}</td>
                        <td>{item.quantity}</td>
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

export default StoreInventoryPage;