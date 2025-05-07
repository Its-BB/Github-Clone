import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: {
        username: string;
        email: string;
        password: string;
    }) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.post(`/auth/reset-password/${token}`, { password }),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data: {
        username?: string;
        email?: string;
        bio?: string;
        location?: string;
        website?: string;
        avatar?: string;
    }) => api.patch('/auth/me', data),
    deleteAccount: () => api.delete('/auth/me'),
};

// Repository API
export const repositoryAPI = {
    getAll: (params?: {
        page?: number;
        limit?: number;
        sort?: string;
        language?: string;
        topic?: string;
    }) => api.get('/repositories', { params }),
    getByUser: (username: string, params?: {
        page?: number;
        limit?: number;
        sort?: string;
    }) => api.get(`/repositories/user/${username}`, { params }),
    getOne: (owner: string, name: string) =>
        api.get(`/repositories/${owner}/${name}`),
    create: (data: {
        name: string;
        description?: string;
        isPrivate: boolean;
        language?: string;
        topics?: string[];
    }) => api.post('/repositories', data),
    update: (owner: string, name: string, data: {
        name?: string;
        description?: string;
        isPrivate?: boolean;
        language?: string;
        topics?: string[];
    }) => api.patch(`/repositories/${owner}/${name}`, data),
    delete: (owner: string, name: string) =>
        api.delete(`/repositories/${owner}/${name}`),
    star: (owner: string, name: string) =>
        api.post(`/repositories/${owner}/${name}/star`),
    fork: (owner: string, name: string) =>
        api.post(`/repositories/${owner}/${name}/fork`),
    addCollaborator: (owner: string, name: string, data: {
        username: string;
        role: 'admin' | 'write' | 'read';
    }) => api.post(`/repositories/${owner}/${name}/collaborators`, data),
    removeCollaborator: (owner: string, name: string, username: string) =>
        api.delete(`/repositories/${owner}/${name}/collaborators/${username}`),
    getBranches: (owner: string, name: string) =>
        api.get(`/repositories/${owner}/${name}/branches`),
    getContents: (owner: string, name: string, path: string, branch?: string) =>
        api.get(`/repositories/${owner}/${name}/contents/${path}`, { params: { ref: branch } }),
    createBranch: (owner: string, name: string, data: {
        name: string;
        source: string;
    }) => api.post(`/repositories/${owner}/${name}/branches`, data),
    deleteBranch: (owner: string, name: string, branch: string) =>
        api.delete(`/repositories/${owner}/${name}/branches/${branch}`),
};

// Issue API
export const issueAPI = {
    getAll: (owner: string, repo: string, params?: {
        state?: 'open' | 'closed';
        page?: number;
        limit?: number;
        sort?: string;
    }) => api.get(`/repositories/${owner}/${repo}/issues`, { params }),
    getOne: (owner: string, repo: string, number: number) =>
        api.get(`/repositories/${owner}/${repo}/issues/${number}`),
    create: (owner: string, repo: string, data: {
        title: string;
        description?: string;
        labels?: string[];
        assignees?: string[];
    }) => api.post(`/repositories/${owner}/${repo}/issues`, data),
    update: (owner: string, repo: string, number: number, data: {
        title?: string;
        description?: string;
        state?: 'open' | 'closed';
        labels?: string[];
        assignees?: string[];
    }) => api.patch(`/repositories/${owner}/${repo}/issues/${number}`, data),
    getComments: (owner: string, repo: string, issueNumber: number) =>
        api.get(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments`),
    createComment: (owner: string, repo: string, issueNumber: number, data: {
        body: string;
    }) => api.post(`/repositories/${owner}/${repo}/issues/${issueNumber}/comments`, data),
    updateComment: (owner: string, repo: string, commentId: string, data: {
        body: string;
    }) => api.patch(`/repositories/${owner}/${repo}/issues/comments/${commentId}`, data),
    deleteComment: (owner: string, repo: string, commentId: string) =>
        api.delete(`/repositories/${owner}/${repo}/issues/comments/${commentId}`),
    addReaction: (owner: string, repo: string, commentId: string, data: {
        type: 'thumbsUp' | 'thumbsDown';
    }) => api.post(`/repositories/${owner}/${repo}/issues/comments/${commentId}/reactions`, data),
    addIssueReaction: (owner: string, repo: string, number: number, data: {
        type: string;
    }) => api.post(`/repositories/${owner}/${repo}/issues/${number}/reactions`, data),
    addCommentReaction: (
        owner: string,
        repo: string,
        number: number,
        commentId: string,
        data: { type: string }
    ) =>
        api.post(
            `/repositories/${owner}/${repo}/issues/${number}/comments/${commentId}/reactions`,
            data
        ),
    lock: (owner: string, repo: string, number: number) =>
        api.post(`/repositories/${owner}/${repo}/issues/${number}/lock`),
    unlock: (owner: string, repo: string, number: number) =>
        api.post(`/repositories/${owner}/${repo}/issues/${number}/unlock`),
};

// Pull Request API
export const pullRequestAPI = {
    getAll: (owner: string, repo: string, params?: {
        state?: 'open' | 'closed' | 'merged';
        page?: number;
        limit?: number;
        sort?: string;
    }) => api.get(`/repositories/${owner}/${repo}/pulls`, { params }),
    getOne: (owner: string, repo: string, number: number) =>
        api.get(`/repositories/${owner}/${repo}/pulls/${number}`),
    create: (owner: string, repo: string, data: {
        title: string;
        description?: string;
        head: string;
        base: string;
        labels?: string[];
        assignees?: string[];
    }) => api.post(`/repositories/${owner}/${repo}/pulls`, data),
    update: (owner: string, repo: string, number: number, data: {
        title?: string;
        description?: string;
        state?: 'open' | 'closed';
        labels?: string[];
        assignees?: string[];
    }) => api.patch(`/repositories/${owner}/${repo}/pulls/${number}`, data),
    addComment: (owner: string, repo: string, number: number, data: {
        content: string;
    }) => api.post(`/repositories/${owner}/${repo}/pulls/${number}/comments`, data),
    addReview: (owner: string, repo: string, number: number, data: {
        content: string;
        state: 'approved' | 'changes_requested' | 'commented';
    }) => api.post(`/repositories/${owner}/${repo}/pulls/${number}/reviews`, data),
    merge: (owner: string, repo: string, number: number) =>
        api.post(`/repositories/${owner}/${repo}/pulls/${number}/merge`),
    addReaction: (owner: string, repo: string, number: number, data: {
        type: string;
    }) => api.post(`/repositories/${owner}/${repo}/pulls/${number}/reactions`, data),
    addCommentReaction: (
        owner: string,
        repo: string,
        number: number,
        commentId: string,
        data: { type: string }
    ) =>
        api.post(
            `/repositories/${owner}/${repo}/pulls/${number}/comments/${commentId}/reactions`,
            data
        ),
};

// Commit API
export const commitAPI = {
    getAll: (owner: string, repo: string, params?: {
        branch?: string;
        page?: number;
        limit?: number;
    }) => api.get(`/repositories/${owner}/${repo}/commits`, { params }),
    getOne: (owner: string, repo: string, hash: string) =>
        api.get(`/repositories/${owner}/${repo}/commits/${hash}`),
    create: (owner: string, repo: string, data: {
        message: string;
        branch: string;
        files: {
            path: string;
            content: string;
            mode: '100644' | '100755' | '040000' | '160000' | '120000';
        }[];
        parents: string[];
    }) => api.post(`/repositories/${owner}/${repo}/commits`, data),
    getDiff: (owner: string, repo: string, hash: string) =>
        api.get(`/repositories/${owner}/${repo}/commits/${hash}/diff`),
    getComments: (owner: string, repo: string, hash: string) =>
        api.get(`/repositories/${owner}/${repo}/commits/${hash}/comments`),
    addComment: (owner: string, repo: string, hash: string, data: {
        content: string;
        line?: number;
        path?: string;
    }) => api.post(`/repositories/${owner}/${repo}/commits/${hash}/comments`, data),
    getStatus: (owner: string, repo: string, hash: string) =>
        api.get(`/repositories/${owner}/${repo}/commits/${hash}/status`),
    updateStatus: (owner: string, repo: string, hash: string, data: {
        state: 'pending' | 'success' | 'failure' | 'error';
        context: string;
        description?: string;
        targetUrl?: string;
    }) => api.patch(`/repositories/${owner}/${repo}/commits/${hash}/status`, data),
};

export default api; 