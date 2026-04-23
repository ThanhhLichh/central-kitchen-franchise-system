import { useState } from "react";
import axiosClient from "../api/axios";
import { INVENTORY_API } from "../api/config";
import "./CheckStockModal.css";

function CheckStockModal({ open, onClose, products }) {
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  if (!open) return null;

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

  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

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
      setChecking(true);

      const response = await axiosClient.post(INVENTORY_API.CHECK_STOCK, {
        items: normalizedItems,
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Kiểm tra tồn kho thất bại.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventory-modal large" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2>Kiểm tra tồn kho</h2>
            <p>Kiểm tra kho trung tâm có đủ đáp ứng số lượng yêu cầu hay không</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="inventory-modal-form" onSubmit={handleCheck}>
          {items.map((item, index) => (
            <div className="check-stock-row" key={index}>
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

          <div className="check-stock-actions">
            <button type="button" className="secondary-btn" onClick={handleAddItem}>
              + Thêm sản phẩm
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          {result && (
            <div className="check-result-box">
              <h3>Kết quả kiểm tra</h3>

              {result.available ? (
                <p className="success-text">Kho trung tâm đủ hàng để đáp ứng yêu cầu.</p>
              ) : (
                <>
                  <p className="error-text">Kho trung tâm đang thiếu một số mặt hàng:</p>
                  <ul>
                    {result.missing_items?.map((item, index) => (
                      <li key={index}>
                        Product #{item.product_id} thiếu {item.missing_quantity || 0}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="primary-btn" disabled={checking}>
              {checking ? "Đang kiểm tra..." : "Kiểm tra tồn kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckStockModal;