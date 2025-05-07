import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../config';

// Add a request interceptor
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear the token and redirect to login
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
); 