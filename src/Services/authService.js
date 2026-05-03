import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
    async login(email, password) {
        const { data: tokens } = await axios.post(`${BASE_URL}api/token/`, {
            email,
            password,
        });
        // Despues de obtener el JWT, pedimos el usuario completo.
        const { data: user } = await axios.get(`${BASE_URL}api/users/me/`, {
            headers: { Authorization: `Bearer ${tokens.access}` },
        });
        return { ...tokens, user };
    },

    async fetchMe() {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        const { data } = await axios.get(`${BASE_URL}api/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};
