import { apiClient } from './client';

export const authApi = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.firstName
     * @param {string} userData.lastName
     * @param {string} userData.email
     * @param {string} userData.password
     * @returns {Promise<AxiosResponse<AuthResponse>>}
     */
    register: async (userData) => {
        return apiClient.post('auth/signup', userData);
    },

    /**
     * Log in an existing user
     * @param {Object} credentials
     * @param {string} credentials.email
     * @param {string} credentials.password
     * @returns {Promise<AxiosResponse<AuthResponse>>}
     */
    login: async (credentials) => {
        return apiClient.post('auth/login', credentials);
    },
};
