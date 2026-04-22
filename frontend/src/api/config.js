const GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY;

export const AUTH_API = {
  LOGIN: `${GATEWAY_BASE_URL}/api/auth/login`,
  LOGOUT: `${GATEWAY_BASE_URL}/api/auth/logout`,
  CREATE_USER: `${GATEWAY_BASE_URL}/api/auth/create-user`,
  SYNC_USERS: `${GATEWAY_BASE_URL}/api/auth/sync-users`,
  GET_USERS: `${GATEWAY_BASE_URL}/api/auth/users`,
  GET_USER_BY_ID: (id) => `${GATEWAY_BASE_URL}/api/auth/users/${id}`,
  UPDATE_USER: (id) => `${GATEWAY_BASE_URL}/api/auth/users/${id}`,
  LOCK_USER: (id) => `${GATEWAY_BASE_URL}/api/auth/users/${id}/lock`,
  UNLOCK_USER: (id) => `${GATEWAY_BASE_URL}/api/auth/users/${id}/unlock`,
};

export const STORE_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/api/stores`,
  CREATE: `${GATEWAY_BASE_URL}/api/stores`,
};

export const ORDER_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/orders`,
  GET_BY_ID: (id) => `${GATEWAY_BASE_URL}/orders/${id}`,
  CREATE: `${GATEWAY_BASE_URL}/orders`,
  UPDATE_STATUS: (id) => `${GATEWAY_BASE_URL}/orders/${id}/status`,
};

export const INVENTORY_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/inventory`,
  GET_PRODUCTS: `${GATEWAY_BASE_URL}/products`,
  CHECK_STOCK: `${GATEWAY_BASE_URL}/check-stock`,
  IMPORT: `${GATEWAY_BASE_URL}/inventory/import`,
  GET_STORE_INVENTORY: (storeId) => `${GATEWAY_BASE_URL}/inventory/store/${storeId}`,
};