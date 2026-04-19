import axiosClient from "./axios";
import { ORDER_API } from "./config";

export const getOrdersApi = async () => {
  const response = await axiosClient.get(ORDER_API.GET_ALL);
  return response.data;
};
export const getOrderByIdApi = async (id) => {
  const response = await axiosClient.get(ORDER_API.GET_BY_ID(id));
  return response.data;
};