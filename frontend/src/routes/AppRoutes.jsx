import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRoute";
import { getDefaultRouteByRole } from "../utils/getDefaultRouteByRole";
import OrdersPage from "../pages/OrdersPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import StoresPage from "../pages/StoresPage";
import AdminDashboard from "../pages/AdminDashboard";
import CreateOrderPage from "../pages/CreateOrderPage";
import StoreInventoryPage from "../pages/StoreInventoryPage";
import KitchenDashboard from "../pages/KitchenDashboard";
import KitchenOrdersPage from "../pages/KitchenOrdersPage";
import CentralInventoryPage from "../pages/CentralInventoryPage";
import DeliveryListPage from "../pages/DeliveryListPage";
import CoordinatorOrdersPage from "../pages/CoordinatorOrdersPage";
import ProductionPlanPage from "../pages/ProductionPlanPage";
import CoordinatorDashboard from "../pages/CoordinatorDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import ManagerInventoryPage from "../pages/ManagerInventoryPage";
import ManagerReportsPage from "../pages/ManagerReportsPage";
import ManagerProductsPage from "../pages/ManagerProductsPage";

function AppRoutes() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? <Navigate to={getDefaultRouteByRole(role)} replace /> : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <AdminUsersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/stores"
        element={
          <PrivateRoute>
            <StoresPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <PrivateRoute>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/inventory"
        element={
          <PrivateRoute>
            <ManagerInventoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <PrivateRoute>
            <ManagerReportsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager/products"
        element={
          <PrivateRoute>
            <ManagerProductsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders/create"
        element={
          <PrivateRoute>
            <CreateOrderPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <StoreInventoryPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/kitchen"
        element={
          <PrivateRoute>
            <KitchenDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/kitchen/orders"
        element={
          <PrivateRoute>
            <KitchenOrdersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/kitchen/inventory"
        element={
          <PrivateRoute>
            <CentralInventoryPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/production"
        element={
          <PrivateRoute>
            <ProductionPlanPage />
          </PrivateRoute>
        }
      />

      <Route
          path="/coordinator"
          element={
            <PrivateRoute>
              <CoordinatorDashboard />
            </PrivateRoute>
          }
        />

      <Route
        path="/coordinator/orders"
        element={
          <PrivateRoute>
            <CoordinatorOrdersPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/delivery"
        element={
          <PrivateRoute>
            <DeliveryListPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;