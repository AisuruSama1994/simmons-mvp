import api from './api';
import type { Usuario, TokenResponse } from '../types';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    nombre: string;
    password: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

// Login
export const loginUser = (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then(r => r.data);

// Registro (típicamente admin-only, pero dejamos abierto para setup)
export const registerUser = (data: RegisterRequest) =>
    api.post<Usuario>('/auth/register', data).then(r => r.data);

// Obtener usuario actual
export const getCurrentUser = () =>
    api.get<Usuario>('/auth/me').then(r => r.data);

// Cambiar contraseña
export const changePassword = (data: ChangePasswordRequest) =>
    api.post('/auth/change-password', data);

// Logout (principalmente limpia frontend, backend mantiene blacklist si quiere)
export const logoutUser = () => {
    localStorage.removeItem('access_token');
    // Opcionalmente avisar al backend
    return Promise.resolve();
};