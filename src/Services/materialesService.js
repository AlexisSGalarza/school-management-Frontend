import { api } from './api';

export const materialesService = {
    getAll: () => api.get('api/materiales/'),
    getById: (id) => api.get(`api/materiales/${id}/`),
    create: (data) => api.post('api/materiales/', data),
    update: (id, data) => api.put(`api/materiales/${id}/`, data),
    remove: (id) => api.delete(`api/materiales/${id}/`),
};
