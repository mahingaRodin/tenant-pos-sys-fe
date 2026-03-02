import { apiClient } from './client';

export const orderApi = {
    create: async (orderData) => {
        return apiClient.post('/orders', orderData);
    },
    getById: async (id) => {
        return apiClient.get(`/orders/${id}`);
    },
    getByBranchId: async (branchId, params = {}) => {
        const { page = 0, size = 10, ...filters } = params;
        return apiClient.get(`/orders/branch/${branchId}`, {
            params: { page, size, ...filters }
        });
    },
    getTodayByBranchId: async (branchId, page = 0, size = 10) => {
        return apiClient.get(`/orders/today/branch/${branchId}`, {
            params: { page, size }
        });
    },
    getRecentByBranchId: async (branchId, page = 0, size = 10) => {
        return apiClient.get(`/orders/recent/branch/${branchId}`, {
            params: { page, size }
        });
    }
};
