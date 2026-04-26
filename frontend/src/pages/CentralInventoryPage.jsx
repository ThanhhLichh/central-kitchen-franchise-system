import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import { getProductsApi } from "../api/inventoryApi";
import ImportStockModal from "../components/ImportStockModal";
import CheckStockModal from "../components/CheckStockModal";
import Pagination from "../components/Pagination";
import { FiPlus, FiSearch } from "react-icons/fi";
import "./CentralInventoryPage.css";

function CentralInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCheckOpen, setIsCheckOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryData, productsData] = await Promise.all([
        axiosClient.get(INVENTORY_API.GET_ALL),
        getProductsApi(),
      ]);

      setInventory(Array.isArray(inventoryData.data) ? inventoryData.data : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu kho trung tâm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const filteredInventory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const product = productsMap[item.product_id];
      const productName = product?.name?.toLowerCase() || "";

      return (
        String(item.product_id).includes(keyword) ||
        productName.includes(keyword)
      );
    });
  }, [inventory, search, productsMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage]);

  return (
    <Layout>
      <div className="central-inventory-page">
        <div className="inventory-top">
          <div>
            <h1 className="inventory-title">Kho trung tâm</h1>
            <p className="inventory-subtitle">
              Theo dõi tồn kho tại bếp trung tâm, nhập thêm hàng và kiểm tra khả năng đáp ứng
            </p>
          </div>

          <div className="inventory-top-actions">
            <button className="secondary-btn" onClick={() => setIsCheckOpen(true)}>
              <FiSearch />
              Kiểm tra tồn kho
            </button>

            <button className="primary-btn" onClick={() => setIsImportOpen(true)}>
              <FiPlus />
              Nhập kho
            </button>
          </div>
        </div>

        <div className="inventory-toolbar">
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="inventory-panel">
          {loading ? (
            <div className="inventory-state">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="inventory-state error">{error}</div>
          ) : (
            <>
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
                    {paginatedInventory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-row">
                          Không có dữ liệu tồn kho phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedInventory.map((item, index) => {
                        const product = productsMap[item.product_id];
                        const quantity = Number(item.quantity || 0);
                        const isLow = quantity <= 20;

                        return (
                          <tr key={`${item.product_id}-${index}`}>
                            <td>{item.product_id}</td>
                            <td className="highlight-cell">
                              {product?.name || "Chưa có tên"}
                            </td>
                            <td>{product?.unit || "--"}</td>
                            <td>{quantity}</td>
                            <td>
                              <span className={isLow ? "low-stock-badge" : "normal-stock-badge"}>
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages || 1}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </div>

        <ImportStockModal
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          products={products}
          onImported={fetchInventoryData}
        />

        <CheckStockModal
          open={isCheckOpen}
          onClose={() => setIsCheckOpen(false)}
          products={products}
        />
      </div>
    </Layout>
  );
}

export default CentralInventoryPage;