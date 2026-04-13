import { api } from './api';

export const inscripcionesService = {
    getAll: () => api.get('api/inscripciones/'),
    getById: (id) => api.get(`api/inscripciones/${id}/`),
    create: (data) => api.post('api/inscripciones/', data),
    update: (id, data) => api.put(`api/inscripciones/${id}/`, data),
    remove: (id) => api.delete(`api/inscripciones/${id}/`),
};
