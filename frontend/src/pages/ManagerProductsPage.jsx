import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getProductsApi } from "../api/inventoryApi";
import CreateProductModal from "../components/CreateProductModal";
import "./ManagerProductsPage.css";

function ManagerProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProductsApi();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      return (
        String(product.id).includes(keyword) ||
        product.name?.toLowerCase().includes(keyword) ||
        product.unit?.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  return (
    <Layout>
      <div className="manager-products-page">
        <div className="manager-products-top">
          <div>
            <h1 className="manager-products-title">Danh mục sản phẩm</h1>
            <p className="manager-products-subtitle">
              Quản lý danh sách sản phẩm và đơn vị sử dụng trong hệ thống
            </p>
          </div>

          <button className="primary-btn" onClick={() => setIsCreateOpen(true)}>
            + Thêm sản phẩm
          </button>
        </div>

        <div className="manager-products-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo ID, tên sản phẩm, đơn vị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="manager-products-panel">
          {loading ? (
            <div className="state-box">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="state-box error">{error}</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Đơn vị</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-row">
                        Không có sản phẩm phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="highlight-cell">{product.id}</td>
                        <td>{product.name || "--"}</td>
                        <td>{product.unit || "--"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <CreateProductModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchProducts}
        />
      </div>
    </Layout>
  );
}

export default ManagerProductsPage;