export function getDefaultRouteByRole(role) {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Manager":
      return "/manager";
    case "FranchiseStoreStaff":
      return "/dashboard";
    case "CentralKitchenStaff":
      return "/kitchen";
    case "SupplyCoordinator":
      return "/coordinator";
    default:
      return "/dashboard";
  }
}