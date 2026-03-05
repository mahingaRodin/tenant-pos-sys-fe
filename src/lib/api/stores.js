import { apiClient } from './client';

export const storeApi = {
    create: async (storeData) => {
        return apiClient.post('/stores', storeData);
    },
    getById: async (id) => {
        return apiClient.get(`/stores/${id}`);
    },
    getAll: async (page = 0, size = 10 , direction = 'DESC') => {
        return apiClient.get(`/stores?page=${page}&size=${size}&direction=${direction}`);
    },
    getByAdmin: async () => {
        return apiClient.get('/stores/admin');
    },
    getByEmployee: async () => {
        return apiClient.get('/stores/employee');
    },
    update: async (id, storeData) => {
        return apiClient.put(`/stores/${id}/update`, storeData);
    },
    moderate: async (id, status) => {
        return apiClient.put(`/stores/${id}/moderate?status=${status}`);
    },
    delete: async (id) => {
        return apiClient.delete(`/stores/${id}`);
    }
};
