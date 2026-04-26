import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  getUsersApi,
  getUserByIdApi,
  lockUserApi,
  unlockUserApi,
} from "../api/adminApi";
import UserDetailModal from "../components/UserDetailModal";
import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import Pagination from "../components/Pagination";
import { FiEye, FiLock, FiUnlock, FiEdit2 } from "react-icons/fi";
import "./AdminUsersPage.css";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsersApi();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = search.trim().toLowerCase();

      const matchSearch =
        user.userName?.toLowerCase().includes(text) ||
        user.fullName?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text);

      const firstRole = user.roles?.[0] || "";

      if (firstRole === "Admin") return false;

      const matchRole = roleFilter === "all" ? true : firstRole === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleViewDetail = async (id) => {
    try {
      const data = await getUserByIdApi(id);
      setSelectedUser(data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLock = async (user) => {
    const action = user.isActive ? "khóa" : "mở khóa";
    const confirmed = window.confirm(
      `Bạn có chắc muốn ${action} tài khoản ${user.userName} không?`
    );

    if (!confirmed) return;

    try {
      if (user.isActive) {
        await lockUserApi(user.id);
      } else {
        await unlockUserApi(user.id);
      }

      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi cập nhật trạng thái tài khoản.");
    }
  };

  return (
    <Layout>
      <div className="admin-users-page">
        <div className="admin-users-top">
          <div>
            <h1 className="admin-users-title">Quản lý người dùng</h1>
            <p className="admin-users-subtitle">
              Theo dõi, tạo mới và quản lý tài khoản trong hệ thống
            </p>
          </div>

          <button className="primary-btn" onClick={() => setIsCreateOpen(true)}>
            + Tạo user
          </button>
        </div>

        <div className="admin-toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Tìm theo username, họ tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả role</option>
            <option value="Manager">Manager</option>
            <option value="SupplyCoordinator">SupplyCoordinator</option>
            <option value="CentralKitchenStaff">CentralKitchenStaff</option>
            <option value="FranchiseStoreStaff">FranchiseStoreStaff</option>
          </select>
        </div>

        <div className="admin-panel">
          {loading ? (
            <div className="state-box">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="state-box error">{error}</div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row">
                          Không có người dùng phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="username-cell">{user.userName}</td>
                          <td>{user.fullName || "--"}</td>
                          <td>{user.email || "--"}</td>
                          <td>
                            <span className="role-badge">
                              {user.roles?.[0] || "--"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                user.isActive ? "active-badge" : "locked-badge"
                              }
                            >
                              {user.isActive ? "Active" : "Locked"}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <button
                                className="view-btn"
                                onClick={() => handleViewDetail(user.id)}
                              >
                                <FiEye style={{ marginRight: 6 }} />
                                Xem
                              </button>

                              <button
                                type="button"
                                className="edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingUserId(user.id);
                                  setIsEditOpen(true);
                                }}
                              >
                                <FiEdit2 style={{ marginRight: 6 }} />
                                Sửa
                              </button>

                              <button
                                className={user.isActive ? "lock-btn" : "unlock-btn"}
                                onClick={() => handleToggleLock(user)}
                              >
                                {user.isActive ? (
                                  <>
                                    <FiLock style={{ marginRight: 6 }} />
                                    Khóa
                                  </>
                                ) : (
                                  <>
                                    <FiUnlock style={{ marginRight: 6 }} />
                                    Mở khóa
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

        <UserDetailModal
          user={selectedUser}
          open={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedUser(null);
          }}
        />

        <CreateUserModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={fetchUsers}
        />

        <EditUserModal
          userId={editingUserId}
          open={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingUserId(null);
          }}
          onUpdated={fetchUsers}
        />
      </div>
    </Layout>
  );
}

export default AdminUsersPage;