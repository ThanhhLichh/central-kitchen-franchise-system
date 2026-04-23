import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getUsersApi, getStoresApi } from "../api/adminApi";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiHome,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import "./AdminDashboard.css";

function AdminDashboard() {
  const fullName = localStorage.getItem("fullName") || "Admin";

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersData, storesData] = await Promise.all([
        getUsersApi(),
        getStoresApi(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được dữ liệu dashboard admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const lockedUsers = users.filter((u) => !u.isActive).length;
    const totalStores = stores.length;
    const managers = users.filter((u) => u.roles?.includes("Manager")).length;

    return {
      totalUsers,
      activeUsers,
      lockedUsers,
      totalStores,
      managers,
    };
  }, [users, stores]);

  const latestUsers = useMemo(() => {
  return users
    .filter((u) => !u.roles?.includes("Admin")) 
    .reverse()
    .slice(0, 5);
}, [users]);

  const latestStores = useMemo(() => {
    return [...stores].slice(0, 5);
  }, [stores]);

  return (
    <Layout>
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-hero">
          <div className="admin-hero-left">
            <span className="hero-badge">
              <FiShield />
              Admin Dashboard
            </span>

            <h1>Xin chào, {fullName}</h1>

            <p>
              Đây là trung tâm quản trị hệ thống CenKit. Theo dõi nhanh tài khoản,
              cửa hàng, trạng thái hoạt động và những thay đổi gần đây trong hệ
              thống.
            </p>
          </div>

          <div className="admin-hero-right">
            <div className="hero-mini-card">
              <FiActivity className="hero-mini-icon" />
              <div>
                <strong>System Health</strong>
                <span>Đang hoạt động ổn định</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-state-box">Đang tải dữ liệu dashboard...</div>
        ) : error ? (
          <div className="admin-state-box error">{error}</div>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-purple">
                  <FiUsers />
                </div>
                <div>
                  <p>Tổng người dùng</p>
                  <h2>{stats.totalUsers}</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-green">
                  <FiUserCheck />
                </div>
                <div>
                  <p>Đang hoạt động</p>
                  <h2>{stats.activeUsers}</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-red">
                  <FiUserX />
                </div>
                <div>
                  <p>Đã khóa</p>
                  <h2>{stats.lockedUsers}</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon icon-blue">
                  <FiHome />
                </div>
                <div>
                  <p>Tổng cửa hàng</p>
                  <h2>{stats.totalStores}</h2>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-grid">
              <div className="admin-panel">
                <div className="panel-head">
                  <div>
                    <h3>Người dùng gần đây</h3>
                    <span>Danh sách tài khoản đang có trong hệ thống</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Họ tên</th>
                        <th>Role</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            Chưa có dữ liệu người dùng.
                          </td>
                        </tr>
                      ) : (
                        latestUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="highlight-cell">{user.userName}</td>
                            <td>{user.fullName || "--"}</td>
                            <td>
                              <span className="role-badge">
                                {user.roles?.[0] || "--"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  user.isActive
                                    ? "active-badge"
                                    : "locked-badge"
                                }
                              >
                                {user.isActive ? "Active" : "Locked"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-side-column">
                <div className="admin-panel compact">
                  <div className="panel-head">
                    <div>
                      <h3>Thống kê vai trò</h3>
                      <span>Phân bố người dùng theo nghiệp vụ</span>
                    </div>
                  </div>

                  <div className="role-summary-list">
                    <div className="role-summary-item">
                      <span>Manager</span>
                      <strong>{stats.managers}</strong>
                    </div>
                    <div className="role-summary-item">
                      <span>SupplyCoordinator</span>
                      <strong>
                        {
                          users.filter((u) =>
                            u.roles?.includes("SupplyCoordinator")
                          ).length
                        }
                      </strong>
                    </div>
                    <div className="role-summary-item">
                      <span>CentralKitchenStaff</span>
                      <strong>
                        {
                          users.filter((u) =>
                            u.roles?.includes("CentralKitchenStaff")
                          ).length
                        }
                      </strong>
                    </div>
                    <div className="role-summary-item">
                      <span>FranchiseStoreStaff</span>
                      <strong>
                        {
                          users.filter((u) =>
                            u.roles?.includes("FranchiseStoreStaff")
                          ).length
                        }
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="admin-panel compact">
                  <div className="panel-head">
                    <div>
                      <h3>Cửa hàng gần đây</h3>
                      <span>Danh sách store đang có trong hệ thống</span>
                    </div>
                  </div>

                  <div className="store-list">
                    {latestStores.length === 0 ? (
                      <p className="empty-store-text">Chưa có dữ liệu cửa hàng.</p>
                    ) : (
                      latestStores.map((store) => (
                        <div className="store-item" key={store.id}>
                          <div className="store-icon">
                            <FiHome />
                          </div>
                          <div>
                            <h4>{store.name}</h4>
                            <p>{store.address}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;