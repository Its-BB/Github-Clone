import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Repository } from './repository';

export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio?: string;
    location?: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserStats {
    repositories: number;
    stars: number;
    followers: number;
    following: number;
}

export const userAPI = {
    getOne: async (username: string) => {
        const response = await axios.get<User>(
            `${API_BASE_URL}/users/${username}`
        );
        return response;
    },

    getStats: async (username: string) => {
        const response = await axios.get<UserStats>(
            `${API_BASE_URL}/users/${username}/stats`
        );
        return response;
    },

    getRepositories: async (username: string, params?: {
        page?: number;
        limit?: number;
        sort?: string;
    }) => {
        const response = await axios.get<Repository[]>(
            `${API_BASE_URL}/users/${username}/repositories`,
            { params }
        );
        return response;
    },

    getStarred: async (username: string, params?: {
        page?: number;
        limit?: number;
        sort?: string;
    }) => {
        const response = await axios.get<Repository[]>(
            `${API_BASE_URL}/users/${username}/starred`,
            { params }
        );
        return response;
    },

    getFollowers: async (username: string, params?: {
        page?: number;
        limit?: number;
    }) => {
        const response = await axios.get<User[]>(
            `${API_BASE_URL}/users/${username}/followers`,
            { params }
        );
        return response;
    },

    getFollowing: async (username: string, params?: {
        page?: number;
        limit?: number;
    }) => {
        const response = await axios.get<User[]>(
            `${API_BASE_URL}/users/${username}/following`,
            { params }
        );
        return response;
    },

    follow: async (username: string) => {
        const response = await axios.put(
            `${API_BASE_URL}/users/${username}/follow`
        );
        return response;
    },

    unfollow: async (username: string) => {
        const response = await axios.delete(
            `${API_BASE_URL}/users/${username}/follow`
        );
        return response;
    },

    search: async (query: string, params?: {
        page?: number;
        limit?: number;
    }) => {
        const response = await axios.get<User[]>(
            `${API_BASE_URL}/users/search`,
            {
                params: {
                    q: query,
                    ...params,
                },
            }
        );
        return response;
    },
}; 