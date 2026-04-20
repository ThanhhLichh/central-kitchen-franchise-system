import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRoute";
import { getDefaultRouteByRole } from "../utils/getDefaultRouteByRole";
import OrdersPage from "../pages/OrdersPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import StoresPage from "../pages/StoresPage";

function AppRoutes() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <Navigate to={getDefaultRouteByRole(role)} replace />
          ) : (
            <Login />
          )
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
            <Dashboard />
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
            <Dashboard />
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
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/kitchen"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/production"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/coordinator"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/delivery"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;