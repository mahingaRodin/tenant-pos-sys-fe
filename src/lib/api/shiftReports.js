import { apiClient } from './client';

export const shiftReportApi = {
    getAll: async (params = {}) => {
        const { page = 0, size = 10, ...filters } = params;
        return apiClient.get('/shift-reports', {
            params: { page, size, ...filters }
        });
    },
    getById: async (id) => {
        return apiClient.get(`/shift-reports/${id}`);
    },
    getByBranchId: async (branchId) => {
        return apiClient.get(`/shift-reports/branch/${branchId}`);
    },
    getRecent: async () => {
        return apiClient.get('/shift-reports/current');
    }
};
