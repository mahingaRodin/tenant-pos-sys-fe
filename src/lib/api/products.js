import { apiClient } from './client';

export const productApi = {
    create: async (productData) => {
        return apiClient.post('/products', productData);
    },
    getByStoreId: async (storeId, page = 0, size = 10) => {
        return apiClient.get(`/products/store/${storeId}?page=${page}&size=${size}`);
    },
    search: async (storeId, keyword, page = 0, size = 10) => {
        return apiClient.get(`/products/store/${storeId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    },
    update: async (id, productData) => {
        return apiClient.patch(`/products/${id}`, productData);
    },
    delete: async (id) => {
        return apiClient.delete(`/products/${id}`);
    }
};
