import { apiUrl, authAxios } from '@/services/index';

const baseUrl = apiUrl + '/inventory';

export interface Inventory {
  _id?: string;
  productId: string;
  quantity: number;
  date: string;
  remarks?: string;
  status: "active" | "inactive";
}

export const createInventory = async (inventoryData: Inventory) => {
  const response = await authAxios.post(`${baseUrl}`, inventoryData);
  return response.data;
};

export const getInventories = async (): Promise<Inventory[]> => {
  const response = await authAxios.get(`${baseUrl}`);
  console.log(response.data);
  return response.data;
};

export const updateInventory = async (_id: string, inventoryData: Inventory) => {
  const response = await authAxios.put(`${baseUrl}/${_id}`, inventoryData);
  return response.data;
};

export const deleteInventory = async (_id: string) => {
  const response = await authAxios.delete(`${baseUrl}/${_id}`);
  return response.data;
};
