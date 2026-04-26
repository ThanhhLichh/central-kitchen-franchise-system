import axiosClient from "./axios";
import { DELIVERY_API } from "./config";

export const getDeliveriesApi = async () => {
  const response = await axiosClient.get(DELIVERY_API.GET_ALL);
  return response.data;
};

export const getDeliveryByIdApi = async (id) => {
  const response = await axiosClient.get(DELIVERY_API.GET_BY_ID(id));
  return response.data;
};

export const createDeliveryApi = async (payload) => {
  const response = await axiosClient.post(DELIVERY_API.CREATE, payload);
  return response.data;
};

export const updateDeliveryApi = async (id, payload) => {
  const response = await axiosClient.put(DELIVERY_API.UPDATE(id), payload);
  return response.data;
};

export const updateDeliveryStatusApi = async (id, payload) => {
  const response = await axiosClient.put(DELIVERY_API.UPDATE_STATUS(id), payload);
  return response.data;
};