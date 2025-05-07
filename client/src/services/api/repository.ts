import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';

export interface Repository {
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    stars: number;
    forks: number;
    createdAt: string;
    updatedAt: string;
    owner: {
        id: string;
        username: string;
        avatar: string;
    };
    defaultBranch: string;
    topics: string[];
}

export interface RepositoryContent {
    name: string;
    path: string;
    type: 'file' | 'dir';
    size?: number;
    sha: string;
    url: string;
    downloadUrl?: string;
}

export interface Branch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}

export interface Commit {
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
    url: string;
}

export interface Collaborator {
    username: string;
    avatarUrl: string;
    role: 'owner' | 'admin' | 'write' | 'read';
}

export const repositoryAPI = {
    getAllRepositories: async (params?: {
        page?: number;
        limit?: number;
        sort?: string;
        search?: string;
    }) => {
        const response = await axios.get<Repository[]>(`${API_BASE_URL}/repositories`, {
            params,
        });
        return response;
    },

    getRepository: async (id: string) => {
        const response = await axios.get<Repository>(
            `${API_BASE_URL}/repositories/${id}`
        );
        return response;
    },

    createRepository: async (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => {
        const response = await axios.post<Repository>(
            `${API_BASE_URL}/repositories`,
            data
        );
        return response;
    },

    updateRepository: async (id: string, data: {
        name?: string;
        description?: string;
        isPrivate?: boolean;
    }) => {
        const response = await axios.patch<Repository>(
            `${API_BASE_URL}/repositories/${id}`,
            data
        );
        return response;
    },

    deleteRepository: async (id: string) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${id}`
        );
        return response;
    },

    starRepository: async (id: string) => {
        const response = await axios.post(
            `${API_BASE_URL}/repositories/${id}/star`
        );
        return response;
    },

    unstarRepository: async (id: string) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${id}/star`
        );
        return response;
    },

    forkRepository: async (id: string) => {
        const response = await axios.post<Repository>(
            `${API_BASE_URL}/repositories/${id}/fork`
        );
        return response;
    },

    getContents: async (id: string, path: string, ref?: string) => {
        const response = await axios.get<RepositoryContent[]>(
            `${API_BASE_URL}/repositories/${id}/contents/${path}`,
            { params: { ref } }
        );
        return response;
    },

    getBranches: async (id: string) => {
        const response = await axios.get<Branch[]>(
            `${API_BASE_URL}/repositories/${id}/branches`
        );
        return response;
    },

    getCommits: async (id: string, params?: {
        page?: number;
        limit?: number;
        path?: string;
        ref?: string;
    }) => {
        const response = await axios.get<Commit[]>(
            `${API_BASE_URL}/repositories/${id}/commits`,
            { params }
        );
        return response;
    },

    getCollaborators: async (id: string) => {
        const response = await axios.get<Collaborator[]>(
            `${API_BASE_URL}/repositories/${id}/collaborators`
        );
        return response;
    },

    addCollaborator: async (id: string, username: string, role: Collaborator['role']) => {
        const response = await axios.put(
            `${API_BASE_URL}/repositories/${id}/collaborators/${username}`,
            { role }
        );
        return response;
    },

    removeCollaborator: async (id: string, username: string) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${id}/collaborators/${username}`
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

    getForks: async (id: string, params?: {
        page?: number;
        limit?: number;
        sort?: string;
    }) => {
        const response = await axios.get<Repository[]>(
            `${API_BASE_URL}/repositories/${id}/forks`,
            { params }
        );
        return response;
    },
}; 