import { api } from './api';

export const comentariosService = {
    getAll: () => api.get('api/comentarios/'),
    getById: (id) => api.get(`api/comentarios/${id}/`),
    create: (data) => api.post('api/comentarios/', data),
    update: (id, data) => api.put(`api/comentarios/${id}/`, data),
    remove: (id) => api.delete(`api/comentarios/${id}/`),
};
