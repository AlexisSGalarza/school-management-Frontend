import { api } from './api';

export const ciclosService = {
    getAll: () => api.get('api/ciclos/'),
    getById: (id) => api.get(`api/ciclos/${id}/`),
    create: (data) => api.post('api/ciclos/', data),
    update: (id, data) => api.put(`api/ciclos/${id}/`, data),
    remove: (id) => api.delete(`api/ciclos/${id}/`),
};
