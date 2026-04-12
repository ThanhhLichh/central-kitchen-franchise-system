import axiosClient from "./axios";
import { AUTH_API } from "./config";

export const loginApi = async (data) => {
  const response = await axiosClient.post(AUTH_API.LOGIN, data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosClient.post(AUTH_API.LOGOUT);
  return response.data;
};

export const createUserApi = async (data) => {
  const response = await axiosClient.post(AUTH_API.CREATE_USER, data);
  return response.data;
};

export const syncUsersApi = async (lastSyncTime) => {
  const response = await axiosClient.get(
    `${AUTH_API.SYNC_USERS}?lastSyncTime=${encodeURIComponent(lastSyncTime)}`
  );
  return response.data;
};