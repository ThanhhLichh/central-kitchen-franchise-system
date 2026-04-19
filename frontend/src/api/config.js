const GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY;

export const AUTH_API = {
  LOGIN: `${GATEWAY_BASE_URL}/api/auth/login`,
  LOGOUT: `${GATEWAY_BASE_URL}/api/auth/logout`,
  CREATE_USER: `${GATEWAY_BASE_URL}/api/auth/create-user`,
  SYNC_USERS: `${GATEWAY_BASE_URL}/api/auth/sync-users`,
};

export const ORDER_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/orders`,
  GET_BY_ID: (id) => `${GATEWAY_BASE_URL}/orders/${id}`,
  CREATE: `${GATEWAY_BASE_URL}/orders`,
  UPDATE_STATUS: (id) => `${GATEWAY_BASE_URL}/orders/${id}/status`,
};

export const INVENTORY_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/inventory`,
  CHECK_STOCK: `${GATEWAY_BASE_URL}/check-stock`,
};

export const DELIVERY_API = {
  GET_ALL: `${GATEWAY_BASE_URL}/deliveries`,
};

export const PRODUCTION_API = {
  GET_PLAN: `${GATEWAY_BASE_URL}/production-plan`,
  GET_STATUS: `${GATEWAY_BASE_URL}/production-status`,
};