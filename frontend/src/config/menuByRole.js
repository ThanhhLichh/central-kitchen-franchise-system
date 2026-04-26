export const menuByRole = {
  Admin: [
    { label: "Tổng quan", path: "/admin" },
    { label: "Người dùng", path: "/admin/users" },
    { label: "Cửa hàng", path: "/admin/stores" },
  ],

  Manager: [
    { label: "Tổng quan", path: "/manager" },
    { label: "Sản phẩm", path: "/manager/products" },
    { label: "Tồn kho", path: "/manager/inventory" },
    { label: "Báo cáo", path: "/manager/reports" },
  ],

  FranchiseStoreStaff: [
    { label: "Tổng quan", path: "/dashboard" },
    { label: "Đơn hàng", path: "/orders" },
    { label: "Tạo đơn mới", path: "/orders/create" },
    { label: "Tồn kho cửa hàng", path: "/inventory" },
],

  CentralKitchenStaff: [
  { label: "Tổng quan", path: "/kitchen" },
  { label: "Đơn cần xử lý", path: "/kitchen/orders" },
  { label: "Kho trung tâm", path: "/kitchen/inventory" },
  { label: "Lệnh sản xuất", path: "/production" },
],

  SupplyCoordinator: [
    { label: "Tổng quan", path: "/coordinator" },
    { label: "Đơn chờ sản xuất", path: "/coordinator/orders" },
    { label: "Danh sách giao hàng", path: "/delivery" },
  ],
};