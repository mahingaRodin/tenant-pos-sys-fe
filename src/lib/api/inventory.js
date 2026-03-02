import { apiClient } from './client';

export const inventoryApi = {
    create: async (inventoryData) => {
        return apiClient.post('/inventories', inventoryData);
    },
    update: async (id, inventoryData) => {
        return apiClient.put(`/inventories/${id}`, inventoryData);
    },
    getByBranchId: async (branchId, page = 0, size = 10) => {
        return apiClient.get(`/inventories/branch/${branchId}`, {
            params: { page, size }
        });
    },
    getByProductAndBranch: async (branchId, productId) => {
        return apiClient.get(`/inventories/branch/${branchId}/product/${productId}`);
    },
    delete: async (id) => {
        return apiClient.delete(`/inventories/${id}`);
    }
};
