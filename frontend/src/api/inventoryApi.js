import axiosClient from "./axios";
import { INVENTORY_API } from "./config";

export const getProductsApi = async () => {
  const response = await axiosClient.get(INVENTORY_API.GET_PRODUCTS);
  return response.data;
};

export const getStoreInventoryApi = async (storeId) => {
  const response = await axiosClient.get(INVENTORY_API.GET_STORE_INVENTORY(storeId));
  return response.data;
};

export const createProductApi = async (payload) => {
  const response = await axiosClient.post(INVENTORY_API.CREATE_PRODUCT, payload);
  return response.data;
};