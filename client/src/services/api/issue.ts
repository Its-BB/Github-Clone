import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';

export interface Issue {
    id: string;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    locked: boolean;
    labels: {
        name: string;
        color: string;
    }[];
    assignees: {
        id: string;
        username: string;
        avatar: string;
    }[];
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
    author: {
        id: string;
        username: string;
        avatar: string;
    };
    repository: {
        id: string;
        name: string;
        owner: {
            id: string;
            username: string;
        };
    };
}

export interface Comment {
    id: number;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        username: string;
        avatar: string;
    };
    reactions: {
        thumbsUp: number;
        thumbsDown: number;
    };
}

export interface CreateIssueParams {
    title: string;
    body: string;
    labels?: string[];
    assignees?: string[];
}

export interface UpdateIssueParams {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
    assignees?: string[];
}

export interface CreateCommentParams {
    body: string;
}

export interface UpdateCommentParams {
    body: string;
}

export type ReactionType = 'thumbsUp' | 'thumbsDown';

export const issueAPI = {
    getAll: async (owner: string, repo: string, params?: {
        state?: 'open' | 'closed';
        page?: number;
        limit?: number;
        sort?: string;
    }) => {
        const response = await axios.get<Issue[]>(`${API_BASE_URL}/repositories/${owner}/${repo}/issues`, {
            params,
        });
        return response;
    },

    get: async (owner: string, repo: string, issueNumber: number) => {
        const response = await axios.get<Issue>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}`
        );
        return response;
    },

    create: async (owner: string, repo: string, data: CreateIssueParams) => {
        const response = await axios.post<Issue>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues`,
            data
        );
        return response;
    },

    update: async (owner: string, repo: string, issueNumber: number, data: UpdateIssueParams) => {
        const response = await axios.patch<Issue>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}`,
            data
        );
        return response;
    },

    delete: async (owner: string, repo: string, issueNumber: number) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}`
        );
        return response;
    },

    lock: async (owner: string, repo: string, issueNumber: number) => {
        const response = await axios.put(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/lock`
        );
        return response;
    },

    unlock: async (owner: string, repo: string, issueNumber: number) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/lock`
        );
        return response;
    },

    getComments: async (owner: string, repo: string, issueNumber: number) => {
        const response = await axios.get<Comment[]>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/comments`
        );
        return response;
    },

    createComment: async (owner: string, repo: string, issueNumber: number, data: CreateCommentParams) => {
        const response = await axios.post<Comment>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/comments`,
            data
        );
        return response;
    },

    updateComment: async (owner: string, repo: string, issueNumber: number, commentId: number, data: UpdateCommentParams) => {
        const response = await axios.patch<Comment>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}`,
            data
        );
        return response;
    },

    deleteComment: async (owner: string, repo: string, issueNumber: number, commentId: number) => {
        const response = await axios.delete(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}`
        );
        return response;
    },

    addReaction: async (owner: string, repo: string, issueNumber: number, commentId: number, reactionType: ReactionType) => {
        const response = await axios.post<Comment>(
            `${API_BASE_URL}/repositories/${owner}/${repo}/issues/${issueNumber}/comments/${commentId}/reactions`,
            { type: reactionType }
        );
        return response;
    },
}; 