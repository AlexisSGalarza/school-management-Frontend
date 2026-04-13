import { api } from './api';

export const tareasService = {
    getAll: () => api.get('api/tareas/'),
    getById: (id) => api.get(`api/tareas/${id}/`),
    create: (data) => api.post('api/tareas/', data),
    update: (id, data) => api.put(`api/tareas/${id}/`, data),
    remove: (id) => api.delete(`api/tareas/${id}/`),
};
