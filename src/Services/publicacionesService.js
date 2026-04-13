import { api } from './api';

export const publicacionesService = {
    getAll: () => api.get('api/publicaciones/'),
    getById: (id) => api.get(`api/publicaciones/${id}/`),
    create: (data) => api.post('api/publicaciones/', data),
    update: (id, data) => api.put(`api/publicaciones/${id}/`, data),
    remove: (id) => api.delete(`api/publicaciones/${id}/`),
};
