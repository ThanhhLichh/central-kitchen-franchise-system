import axiosClient from "./axios";
import { PRODUCTION_API } from "./config";

export const getProductionPlansApi = async (params = {}) => {
  const response = await axiosClient.get(PRODUCTION_API.GET_ALL, { params });
  return response.data;
};

export const createProductionPlanApi = async (payload) => {
  const response = await axiosClient.post(PRODUCTION_API.CREATE, payload);
  return response.data;
};

export const updateProductionStatusApi = async (payload) => {
  const response = await axiosClient.put(PRODUCTION_API.UPDATE_STATUS, payload);
  return response.data;
};