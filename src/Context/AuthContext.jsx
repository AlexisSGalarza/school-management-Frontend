import { createContext, useContext, useState } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return null;
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });

    async function login(username, password) {
        try {
            const data = await authService.login(username, password);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (err) {
            const msg = err.response?.data?.detail ?? 'Credenciales incorrectas';
            throw new Error(msg);
        }
    }

    function logout() {
        authService.logout();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);