import axiosInstance from './api';

export const uploadService = {
    async upload(file) {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await axiosInstance.post('api/upload/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};
