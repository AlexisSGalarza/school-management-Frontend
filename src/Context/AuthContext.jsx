import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('user');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });

    // Si tenemos token pero perdimos el user en cache (o viene desactualizado),
    // refrescamos el perfil al montar.
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token && !user) {
            authService.fetchMe()
                .then(u => { if (u) { setUser(u); localStorage.setItem('user', JSON.stringify(u)) } })
                .catch(() => { /* token invalido, lo deja deslogueado */ });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function login(email, password) {
        try {
            const { access, refresh, user: u } = await authService.login(email, password);
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user', JSON.stringify(u));
            setUser(u);
            return u;
        } catch (err) {
            const msg = err.response?.data?.detail ?? 'Credenciales incorrectas';
            throw new Error(msg);
        }
    }

    function logout() {
        authService.logout();
        setUser(null);
    }

    async function refreshUser() {
        const u = await authService.fetchMe();
        if (u) {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
        }
        return u;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
