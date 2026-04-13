import { api } from './api';

export const materiasService = {
    getAll: () => api.get('api/materias/'),
    getById: (id) => api.get(`api/materias/${id}/`),
    create: (data) => api.post('api/materias/', data),
    update: (id, data) => api.put(`api/materias/${id}/`, data),
    remove: (id) => api.delete(`api/materias/${id}/`),
};
