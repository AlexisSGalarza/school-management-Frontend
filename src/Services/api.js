import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el token a cada request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Interceptor: si recibe 401, refresca el token y reintenta
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(error);
            }
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}api/token/refresh/`,
                    { refresh },
                );
                localStorage.setItem('access_token', data.access);
                original.headers.Authorization = `Bearer ${data.access}`;
                return axiosInstance(original);
            } catch {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    },
);

export const api = {
    get: (url) => axiosInstance.get(url).then((r) => r.data),
    post: (url, body) => axiosInstance.post(url, body).then((r) => r.data),
    put: (url, body) => axiosInstance.put(url, body).then((r) => r.data),
    patch: (url, body) => axiosInstance.patch(url, body).then((r) => r.data),
    delete: (url) => axiosInstance.delete(url).then((r) => r.data),
};

export default axiosInstance;