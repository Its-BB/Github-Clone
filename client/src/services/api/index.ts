import axios from 'axios';
import type { Issue, Comment, ReactionType } from './issue';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const repositoryAPI = {
    getAllRepositories: (params?: { page?: number; limit?: number; sort?: string; search?: string }) =>
        api.get('/repositories', { params }),

    getRepository: (id: string) =>
        api.get(`/repositories/${id}`),

    createRepository: (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => api.post('/repositories', data),

    updateRepository: (id: string, data: {
        name?: string;
        description?: string;
        isPrivate?: boolean;
    }) => api.patch(`/repositories/${id}`, data),

    deleteRepository: (id: string) =>
        api.delete(`/repositories/${id}`),

    starRepository: (id: string) =>
        api.post(`/repositories/${id}/star`),

    unstarRepository: (id: string) =>
        api.delete(`/repositories/${id}/star`),

    forkRepository: (id: string) =>
        api.post(`/repositories/${id}/fork`),

    getContents: (id: string, path: string, ref?: string) =>
        api.get(`/repositories/${id}/contents/${path}`, {
            params: { ref },
        }),

    getBranches: (id: string) =>
        api.get(`/repositories/${id}/branches`),

    getCommits: (id: string, params?: {
        page?: number;
        limit?: number;
        path?: string;
        ref?: string;
    }) => api.get(`/repositories/${id}/commits`, { params }),
};

export const authAPI = {
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    register: (data: {
        username: string;
        email: string;
        password: string;
    }) => api.post('/auth/register', data),

    verifyEmail: (token: string) =>
        api.post('/auth/verify-email', { token }),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (data: { token: string; password: string }) =>
        api.post('/auth/reset-password', data),

    getCurrentUser: () => api.get('/auth/profile'),

    updateProfile: (data: {
        username?: string;
        email?: string;
        bio?: string;
    }) => api.patch('/auth/profile', data),

    logout: () => {
        localStorage.removeItem('token');
    },
};

export const issueAPI = {
    getAll: (owner: string, repo: string, params?: {
        state?: 'open' | 'closed';
        page?: number;
        limit?: number;
        sort?: string;
    }) => api.get<Issue[]>(`/repositories/${owner}/${repo}/issues`, { params }),

    get: (owner: string, repo: string, issueNumber: number) =>
        api.get<Issue>(`/repositories/${owner}/${repo}/issues/${issueNumber}`),

    create: (owner: string, repo: string, data: {
        title: string;
        body: string;
        labels?: string[];
        assignees?: string[];
    }) => api.post<Issue>(`/repositories/${owner}/${repo}/issues`, data),

    update: (owner: string, repo: string, issueNumber: number, data: {
        title?: string;
        body?: string;
        state?: 'open' | 'closed';
        labels?: string[];
        assignees?: string[];
    }) => api.patch<Issue>(`/repositories/${owner}/${repo}/issues/${issueNumber}`, data),

    delete: (owner: string, repo: string, issueNumber: number) =>
        api.delete(`/repositories/${owner}/${repo}/issues/${issueNumber}`),

    lock: (owner: string, repo: string, issueNumber: number) =>
        api.put(`/repositories/${owner}/${repo}/issues/${issueNumber}/lock`),

    unlock: (owner: string, repo: string, issueNumber: number) =>
        api.delete(`/repositories/${owner}/${repo}/issues/${issueNumber}/lock`),

    getComments: (owner: string, repo: string, issueNumber: number) =>
        api.get<Comment[]>(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments`),

    createComment: (owner: string, repo: string, issueNumber: number, data: { body: string }) =>
        api.post<Comment>(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments`, data),

    updateComment: (owner: string, repo: string, issueNumber: number, commentId: number, data: { body: string }) =>
        api.patch<Comment>(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}`, data),

    deleteComment: (owner: string, repo: string, issueNumber: number, commentId: number) =>
        api.delete(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}`),

    addReaction: (owner: string, repo: string, issueNumber: number, commentId: number, reactionType: ReactionType) =>
        api.post<Comment>(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}/reactions`, { type: reactionType }),
};

export type { ReactionType } from './issue';

export default api;

// Export types from individual files
export type { User } from './auth';
export type { Repository } from './repository';
export type { Issue, Comment } from './issue'; 