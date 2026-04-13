import { api } from './api';

export const entregasService = {
    getAll: () => api.get('api/entregas/'),
    getById: (id) => api.get(`api/entregas/${id}/`),
    create: (data) => api.post('api/entregas/', data),
    update: (id, data) => api.put(`api/entregas/${id}/`, data),
    remove: (id) => api.delete(`api/entregas/${id}/`),
};
