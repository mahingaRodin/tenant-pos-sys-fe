import { apiClient } from './client';

export const categoryApi = {
    create: async (categoryData) => {
        return apiClient.post('/categories', categoryData);
    },
    getByStoreId: async (storeId, page = 0, size = 10) => {
        return apiClient.get(`/categories/store/${storeId}?page=${page}&size=${size}`);
    },
    update: async (id, categoryData) => {
        return apiClient.put(`/categories/${id}`, categoryData);
    },
    delete: async (id) => {
        return apiClient.delete(`/categories/${id}`);
    }
};
