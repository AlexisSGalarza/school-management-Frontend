import { api } from './api';

export const gruposService = {
    getAll: () => api.get('api/grupos/'),
    getById: (id) => api.get(`api/grupos/${id}/`),
    create: (data) => api.post('api/grupos/', data),
    update: (id, data) => api.put(`api/grupos/${id}/`, data),
    remove: (id) => api.delete(`api/grupos/${id}/`),
};
