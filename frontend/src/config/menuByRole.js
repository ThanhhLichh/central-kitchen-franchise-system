export const menuByRole = {
  Admin: [
    { label: "Tổng quan", path: "/admin" },
    { label: "Người dùng", path: "/admin/users" },
  ],

  Manager: [
    { label: "Tổng quan", path: "/manager" },
    { label: "Báo cáo", path: "/manager/reports" },
  ],

  FranchiseStoreStaff: [
    { label: "Tổng quan", path: "/dashboard" },
    { label: "Đơn hàng", path: "/orders" },
    { label: "Tạo đơn mới", path: "/orders/create" },
    { label: "Tồn kho bếp trung tâm", path: "/inventory" },
  ],

  CentralKitchenStaff: [
    { label: "Tổng quan", path: "/kitchen" },
    { label: "Sản xuất", path: "/production" },
  ],

  SupplyCoordinator: [
    { label: "Tổng quan", path: "/coordinator" },
    { label: "Giao hàng", path: "/delivery" },
  ],
};