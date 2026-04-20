import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getStoresApi } from "../api/adminApi";
import CreateStoreModal from "../components/CreateStoreModal";
import "./StoresPage.css";

function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await getStoresApi();
      setStores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <Layout>
      <div className="stores-page">
        <div className="stores-top">
          <h1>Cửa hàng</h1>
          <button onClick={() => setIsCreateOpen(true)} className="primary-btn">
            + Thêm cửa hàng
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên cửa hàng</th>
                <th>Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <CreateStoreModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchStores}
        />
      </div>
    </Layout>
  );
}

export default StoresPage;