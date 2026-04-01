import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario, TokenResponse } from '../types';
export interface AuthContextType {
    user: Usuario | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setToken: (token: string) => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
    children: ReactNode;
}

// ⚠️ MOCK TEMPORAL - reemplazar cuando el backend esté listo
const MOCK_USERS = [
    { email: 'admin@simmons.local', password: 'admin123', nombre: 'Administrador', rol_id: 1 },
    { email: 'operador@simmons.local', password: 'oper123', nombre: 'Operador', rol_id: 2 },
];

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setTokenState(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const found = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (!found) {
            throw new Error('Credenciales inválidas');
        }
        const fakeToken = 'mock-token-' + Date.now();
        const userData: Usuario = {
            id: 1,
            email: found.email,
            nombre: found.nombre,
            rol_id: found.rol_id,
            sucursal_id: 1,
            activo: true,
        };
        localStorage.setItem('access_token', fakeToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setTokenState(fakeToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setTokenState(null);
        setUser(null);
    };

    const setToken = (newToken: string) => {
        localStorage.setItem('access_token', newToken);
        setTokenState(newToken);
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        setToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
