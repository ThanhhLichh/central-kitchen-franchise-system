export const menuByRole = {
  Admin: [
    { label: "Tổng quan", path: "/admin" },
    { label: "Người dùng", path: "/admin/users" },
    { label: "Cửa hàng", path: "/admin/stores" },
  ],

  Manager: [
    { label: "Tổng quan", path: "/manager" },
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
  { label: "Đơn hàng cần xử lý", path: "/kitchen/orders" },
  { label: "Kho trung tâm", path: "/kitchen/inventory" },
  { label: "Sản xuất", path: "/production" },
  { label: "Cập nhật trạng thái", path: "/production-status" },
],

  SupplyCoordinator: [
    { label: "Tổng quan", path: "/coordinator" },
    { label: "Giao hàng", path: "/delivery" },
  ],
};