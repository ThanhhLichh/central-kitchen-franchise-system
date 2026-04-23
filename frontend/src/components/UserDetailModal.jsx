import "./UserDetailModal.css";

function UserDetailModal({ user, open, onClose }) {
  if (!open || !user) return null;

  const isStoreStaff = user.roles?.includes("FranchiseStoreStaff");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal-header">
          <div>
            <h2>Chi tiết người dùng</h2>
            <p>Thông tin tài khoản trong hệ thống</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-modal-grid">
          <div className="info-card">
            <span>Username</span>
            <strong>{user.userName || "--"}</strong>
          </div>

          <div className="info-card">
            <span>Họ tên</span>
            <strong>{user.fullName || "--"}</strong>
          </div>

          <div className="info-card">
            <span>Email</span>
            <strong>{user.email || "--"}</strong>
          </div>

          <div className="info-card">
            <span>Role</span>
            <strong>{user.roles?.join(", ") || "--"}</strong>
          </div>

          <div className="info-card">
            <span>Loại vị trí</span>
            <strong>{user.locationType || "--"}</strong>
          </div>

          {isStoreStaff && (
            <>
              <div className="info-card">
                <span>Cửa hàng</span>
                <strong>{user.storeName || user.storeId || "--"}</strong>
              </div>

              <div className="info-card">
                <span>Địa chỉ cửa hàng</span>
                <strong>{user.storeAddress || "--"}</strong>
              </div>
            </>
          )}

          <div className="info-card">
            <span>Trạng thái</span>
            <strong className={user.isActive ? "active-text" : "locked-text"}>
              {user.isActive ? "Đang hoạt động" : "Đã khóa"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;