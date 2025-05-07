import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        avatar: string;
    };
    line?: number;
    path?: string;
    createdAt: string;
    updatedAt: string;
}

interface Status {
    _id: string;
    state: 'success' | 'failure' | 'pending' | 'error';
    context: string;
    description: string;
    targetUrl?: string;
    createdAt: string;
    updatedAt: string;
}

interface FileChange {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
}

interface Commit {
    _id: string;
    hash: string;
    message: string;
    author: {
        _id: string;
        username: string;
        avatar: string;
    };
    committer: {
        _id: string;
        username: string;
        avatar: string;
    };
    parents: string[];
    branch: string;
    files: FileChange[];
    comments: Comment[];
    statuses: Status[];
    createdAt: string;
}

interface CommitState {
    commits: Commit[];
    currentCommit: Commit | null;
    loading: boolean;
    error: string | null;
    totalCount: number;
    page: number;
    hasMore: boolean;
}

const initialState: CommitState = {
    commits: [],
    currentCommit: null,
    loading: false,
    error: null,
    totalCount: 0,
    page: 1,
    hasMore: true,
};

const commitSlice = createSlice({
    name: 'commit',
    initialState,
    reducers: {
        fetchCommitsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCommitsSuccess: (
            state,
            action: PayloadAction<{ commits: Commit[]; totalCount: number }>
        ) => {
            state.loading = false;
            state.commits = action.payload.commits;
            state.totalCount = action.payload.totalCount;
            state.hasMore = state.commits.length < action.payload.totalCount;
        },
        fetchCommitsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentCommit: (state, action: PayloadAction<Commit>) => {
            state.currentCommit = action.payload;
        },
        clearCurrentCommit: (state) => {
            state.currentCommit = null;
        },
        addCommit: (state, action: PayloadAction<Commit>) => {
            state.commits.unshift(action.payload);
        },
        addComment: (
            state,
            action: PayloadAction<{ commitId: string; comment: Comment }>
        ) => {
            const commit = state.commits.find((c) => c._id === action.payload.commitId);
            if (commit) {
                commit.comments.push(action.payload.comment);
            }
            if (state.currentCommit?._id === action.payload.commitId) {
                state.currentCommit.comments.push(action.payload.comment);
            }
        },
        updateComment: (
            state,
            action: PayloadAction<{
                commitId: string;
                commentId: string;
                content: string;
            }>
        ) => {
            const commit = state.commits.find((c) => c._id === action.payload.commitId);
            if (commit) {
                const comment = commit.comments.find((c) => c._id === action.payload.commentId);
                if (comment) {
                    comment.content = action.payload.content;
                }
            }
            if (state.currentCommit?._id === action.payload.commitId) {
                const comment = state.currentCommit.comments.find(
                    (c) => c._id === action.payload.commentId
                );
                if (comment) {
                    comment.content = action.payload.content;
                }
            }
        },
        deleteComment: (
            state,
            action: PayloadAction<{ commitId: string; commentId: string }>
        ) => {
            const commit = state.commits.find((c) => c._id === action.payload.commitId);
            if (commit) {
                commit.comments = commit.comments.filter((c) => c._id !== action.payload.commentId);
            }
            if (state.currentCommit?._id === action.payload.commitId) {
                state.currentCommit.comments = state.currentCommit.comments.filter(
                    (c) => c._id !== action.payload.commentId
                );
            }
        },
        addStatus: (
            state,
            action: PayloadAction<{ commitId: string; status: Status }>
        ) => {
            const commit = state.commits.find((c) => c._id === action.payload.commitId);
            if (commit) {
                commit.statuses.push(action.payload.status);
            }
            if (state.currentCommit?._id === action.payload.commitId) {
                state.currentCommit.statuses.push(action.payload.status);
            }
        },
        updateStatus: (
            state,
            action: PayloadAction<{
                commitId: string;
                statusId: string;
                status: Partial<Status>;
            }>
        ) => {
            const commit = state.commits.find((c) => c._id === action.payload.commitId);
            if (commit) {
                const status = commit.statuses.find((s) => s._id === action.payload.statusId);
                if (status) {
                    Object.assign(status, action.payload.status);
                }
            }
            if (state.currentCommit?._id === action.payload.commitId) {
                const status = state.currentCommit.statuses.find(
                    (s) => s._id === action.payload.statusId
                );
                if (status) {
                    Object.assign(status, action.payload.status);
                }
            }
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchCommitsStart,
    fetchCommitsSuccess,
    fetchCommitsFailure,
    setCurrentCommit,
    clearCurrentCommit,
    addCommit,
    addComment,
    updateComment,
    deleteComment,
    addStatus,
    updateStatus,
    setPage,
    clearError,
} = commitSlice.actions;

export default commitSlice.reducer; 