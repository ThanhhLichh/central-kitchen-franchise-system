import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiMapPin, FiHome, FiPackage, FiSearch, FiX } from "react-icons/fi";
import Layout from "../components/Layout";
import { getStoresApi } from "../api/adminApi";
import CreateStoreModal from "../components/CreateStoreModal";
import Pagination from "../components/Pagination";
import "./StoresPage.css";

function StoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const filteredStores = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return stores;

    return stores.filter((store) => {
      const name = store.name?.toLowerCase() || "";
      const address = store.address?.toLowerCase() || "";
      return name.includes(q) || address.includes(q);
    });
  }, [stores, keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage]);

  return (
    <Layout>
      <div className="stores-page">
        <div className="stores-header">
          <div>
            <h1>Cửa hàng</h1>
            <span>Theo dõi và quản lý danh sách cửa hàng trong hệ thống</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="primary-btn"
          >
            + Tạo cửa hàng
          </button>
        </div>

        <div className="stores-summary-card">
          <div className="summary-icon">
            <FiPackage />
          </div>
          <div>
            <p>Tổng số cửa hàng</p>
            <h2>{stores.length}</h2>
          </div>
        </div>

        <div className="stores-table-card">
          <div className="table-card-header">
            <div>
              <h3>Danh sách cửa hàng</h3>
            </div>
          </div>

          <div className="stores-toolbar">
            <div className="stores-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Tìm theo tên cửa hàng hoặc địa chỉ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setKeyword("")}
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Đang tải danh sách cửa hàng...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="table-state empty-state">
              <FiHome size={34} />
              <h4>Không tìm thấy cửa hàng</h4>
              <p>Thử đổi từ khóa tìm kiếm hoặc thêm cửa hàng mới.</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="stores-table">
                  <thead>
                    <tr>
                      <th>Tên cửa hàng</th>
                      <th>Địa chỉ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStores.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="store-name-cell">
                            <div className="store-icon">
                              <FiHome />
                            </div>
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="store-address-cell">
                            <FiMapPin />
                            <span>{s.address}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
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