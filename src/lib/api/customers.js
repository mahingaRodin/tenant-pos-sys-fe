import { apiClient } from './client';

export const customerApi = {
    getAll: async (params = {}) => {
        const { page = 0, size = 100, ...filters } = params;
        return apiClient.get('/customers', {
            params: { page, size, ...filters }
        });
    }
};
