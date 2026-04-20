import axiosClient from "./axios";
import { AUTH_API, STORE_API } from "./config";

export const getUsersApi = async () => {
  const response = await axiosClient.get(AUTH_API.GET_USERS);
  return response.data;
};

export const getUserByIdApi = async (id) => {
  const response = await axiosClient.get(AUTH_API.GET_USER_BY_ID(id));
  return response.data;
};

export const createUserApi = async (payload) => {
  const response = await axiosClient.post(AUTH_API.CREATE_USER, payload);
  return response.data;
};

export const updateUserApi = async (id, payload) => {
  const response = await axiosClient.put(AUTH_API.UPDATE_USER(id), payload);
  return response.data;
};

export const lockUserApi = async (id) => {
  const response = await axiosClient.patch(AUTH_API.LOCK_USER(id));
  return response.data;
};

export const unlockUserApi = async (id) => {
  const response = await axiosClient.patch(AUTH_API.UNLOCK_USER(id));
  return response.data;
};

export const getStoresApi = async () => {
  const response = await axiosClient.get(STORE_API.GET_ALL);
  return response.data;
};

export const createStoreApi = async (payload) => {
  const res = await axiosClient.post(STORE_API.CREATE, payload);
  return res.data;
};