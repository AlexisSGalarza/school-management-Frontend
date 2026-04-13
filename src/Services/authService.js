import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
    async login(username, password) {
        const { data } = await axios.post(`${BASE_URL}api/token/`, {
            email: username,
            password,
        });
        return data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};
