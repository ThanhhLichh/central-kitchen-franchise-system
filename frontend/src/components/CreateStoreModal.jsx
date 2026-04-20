import { useState } from "react";
import { createStoreApi } from "../api/adminApi";
import "./CreateStoreModal.css";

function CreateStoreModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createStoreApi({ name, address });
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Thêm cửa hàng</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Tên cửa hàng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <button type="submit">Tạo</button>
        </form>
      </div>
    </div>
  );
}

export default CreateStoreModal;