import { apiClient } from './client';

export const branchApi = {
    create: async (branchData) => {
        return apiClient.post('/branches', branchData);
    },
    getByStoreId: async (storeId, page = 0, size = 10) => {
        return apiClient.get(`/branches/store/${storeId}?page=${page}&size=${size}`);
    },
    update: async (id, branchData) => {
        return apiClient.put(`/branches/${id}`, branchData);
    },
    delete: async (id) => {
        return apiClient.delete(`/branches/${id}`);
    }
};
