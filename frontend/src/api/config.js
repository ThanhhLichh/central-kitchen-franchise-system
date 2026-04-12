//  LOAD ENV
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API;

//  AUTH API
export const AUTH_API = {
  LOGIN: `${AUTH_BASE_URL}/login`,
  LOGOUT: `${AUTH_BASE_URL}/logout`,
  CREATE_USER: `${AUTH_BASE_URL}/create-user`,
  SYNC_USERS: `${AUTH_BASE_URL}/sync-users`,
};