import { api } from './api';

export const usersService = {
    getAll: () => api.get('api/users/'),
    getById: (id) => api.get(`api/users/${id}/`),
    create: (data) => api.post('api/users/', data),
    update: (id, data) => api.put(`api/users/${id}/`, data),
    remove: (id) => api.delete(`api/users/${id}/`),
};
