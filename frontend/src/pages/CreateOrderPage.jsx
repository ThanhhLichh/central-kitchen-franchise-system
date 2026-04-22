import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { createOrderApi } from "../api/orderApi";
import { getProductsApi } from "../api/inventoryApi";
import "./CreateOrderPage.css";

function CreateOrderPage() {
  const navigate = useNavigate();
  const storeId = localStorage.getItem("storeId");
  const storeName = localStorage.getItem("storeName");

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProductsApi();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Không tải được danh sách sản phẩm.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const handleChangeItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "quantity" ? Number(value) : value;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedItems = items
      .filter((item) => item.product_id && item.quantity > 0)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    if (normalizedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        store_id: storeId,
        items: normalizedItems,
      };

      await createOrderApi(payload);
      navigate("/orders");
    } catch (err) {
      console.error(err);
      setError("Tạo đơn hàng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="create-order-page">
        <div className="create-order-top">
          <div>
            <h1 className="create-order-title">Tạo đơn mới</h1>
            <p className="create-order-subtitle">
              {storeName ? `Tạo đơn cho ${storeName}` : "Tạo đơn hàng mới cho cửa hàng"}
            </p>
          </div>
        </div>

        <form className="create-order-panel" onSubmit={handleSubmit}>
          {loadingProducts ? (
            <div className="create-order-state">Đang tải danh sách sản phẩm...</div>
          ) : (
            <>
              {items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleChangeItem(index, "product_id", e.target.value)}
                    required
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleChangeItem(index, "quantity", e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    Xóa
                  </button>
                </div>
              ))}

              <div className="order-actions">
                <button type="button" className="secondary-btn" onClick={handleAddItem}>
                  + Thêm sản phẩm
                </button>
              </div>

              <div className="order-preview">
                <h3>Tóm tắt đơn hàng</h3>
                <ul>
                  {items.map((item, index) => (
                    <li key={index}>
                      {productsMap[item.product_id]?.name || "Chưa chọn sản phẩm"} - SL: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {error && <p className="error-text">{error}</p>}

              <div className="submit-actions">
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Đang tạo..." : "Gửi đơn hàng"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </Layout>
  );
}

export default CreateOrderPage;