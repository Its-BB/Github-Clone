import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config';

export interface User {
    id: string;
    username: string;
    email: string;
    bio: string | null;
    avatar: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    username: string;
    email: string;
    password: string;
}

export interface ForgotPasswordParams {
    email: string;
}

export interface ResetPasswordParams {
    token: string;
    password: string;
}

export interface UpdateProfileParams {
    username?: string;
    email?: string;
    bio?: string;
}

export interface ChangePasswordParams {
    currentPassword: string;
    newPassword: string;
}

export const authAPI = {
    login: async (data: LoginParams) => {
        const response = await axios.post<{ token: string; user: User }>(
            `${API_BASE_URL}/auth/login`,
            data
        );
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        return response;
    },

    register: async (data: RegisterParams) => {
        const response = await axios.post<{ token: string; user: User }>(
            `${API_BASE_URL}/auth/register`,
            data
        );
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        return response;
    },

    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },

    getCurrentUser: async () => {
        const response = await axios.get<User>(`${API_BASE_URL}/auth/me`);
        return response;
    },

    forgotPassword: async (data: ForgotPasswordParams) => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/forgot-password`,
            data
        );
        return response;
    },

    resetPassword: async (data: ResetPasswordParams) => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/reset-password`,
            data
        );
        return response;
    },

    updateProfile: async (data: UpdateProfileParams) => {
        const response = await axios.patch<User>(
            `${API_BASE_URL}/auth/profile`,
            data
        );
        return response;
    },

    changePassword: async (data: ChangePasswordParams) => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/change-password`,
            data
        );
        return response;
    },

    verifyEmail: async (token: string) => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/verify-email`,
            { token }
        );
        return response;
    },

    resendVerificationEmail: async () => {
        const response = await axios.post(
            `${API_BASE_URL}/auth/resend-verification`
        );
        return response;
    },
}; 