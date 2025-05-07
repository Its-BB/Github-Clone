import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Review {
    _id: string;
    author: {
        _id: string;
        username: string;
        avatar: string;
    };
    state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED';
    body: string;
    createdAt: string;
    updatedAt: string;
}

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        avatar: string;
    };
    createdAt: string;
    updatedAt: string;
    reactions: {
        type: string;
        count: number;
        users: string[];
    }[];
}

interface PullRequest {
    _id: string;
    number: number;
    title: string;
    description: string;
    state: 'open' | 'closed' | 'merged';
    author: {
        _id: string;
        username: string;
        avatar: string;
    };
    sourceBranch: string;
    targetBranch: string;
    assignees: {
        _id: string;
        username: string;
        avatar: string;
    }[];
    labels: string[];
    reviews: Review[];
    comments: Comment[];
    reactions: {
        type: string;
        count: number;
        users: string[];
    }[];
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    mergedAt?: string;
    mergeable: boolean;
    conflicts: boolean;
}

interface PullRequestState {
    pullRequests: PullRequest[];
    currentPullRequest: PullRequest | null;
    loading: boolean;
    error: string | null;
    totalCount: number;
    page: number;
    hasMore: boolean;
}

const initialState: PullRequestState = {
    pullRequests: [],
    currentPullRequest: null,
    loading: false,
    error: null,
    totalCount: 0,
    page: 1,
    hasMore: true,
};

const pullRequestSlice = createSlice({
    name: 'pullRequest',
    initialState,
    reducers: {
        fetchPullRequestsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchPullRequestsSuccess: (
            state,
            action: PayloadAction<{ pullRequests: PullRequest[]; totalCount: number }>
        ) => {
            state.loading = false;
            state.pullRequests = action.payload.pullRequests;
            state.totalCount = action.payload.totalCount;
            state.hasMore = state.pullRequests.length < action.payload.totalCount;
        },
        fetchPullRequestsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentPullRequest: (state, action: PayloadAction<PullRequest>) => {
            state.currentPullRequest = action.payload;
        },
        clearCurrentPullRequest: (state) => {
            state.currentPullRequest = null;
        },
        addPullRequest: (state, action: PayloadAction<PullRequest>) => {
            state.pullRequests.unshift(action.payload);
        },
        updatePullRequest: (state, action: PayloadAction<PullRequest>) => {
            const index = state.pullRequests.findIndex(
                (pr) => pr._id === action.payload._id
            );
            if (index !== -1) {
                state.pullRequests[index] = action.payload;
            }
            if (state.currentPullRequest?._id === action.payload._id) {
                state.currentPullRequest = action.payload;
            }
        },
        deletePullRequest: (state, action: PayloadAction<string>) => {
            state.pullRequests = state.pullRequests.filter(
                (pr) => pr._id !== action.payload
            );
            if (state.currentPullRequest?._id === action.payload) {
                state.currentPullRequest = null;
            }
        },
        addReview: (
            state,
            action: PayloadAction<{ pullRequestId: string; review: Review }>
        ) => {
            const pr = state.pullRequests.find((p) => p._id === action.payload.pullRequestId);
            if (pr) {
                pr.reviews.push(action.payload.review);
            }
            if (state.currentPullRequest?._id === action.payload.pullRequestId) {
                state.currentPullRequest.reviews.push(action.payload.review);
            }
        },
        addComment: (
            state,
            action: PayloadAction<{ pullRequestId: string; comment: Comment }>
        ) => {
            const pr = state.pullRequests.find((p) => p._id === action.payload.pullRequestId);
            if (pr) {
                pr.comments.push(action.payload.comment);
            }
            if (state.currentPullRequest?._id === action.payload.pullRequestId) {
                state.currentPullRequest.comments.push(action.payload.comment);
            }
        },
        updateComment: (
            state,
            action: PayloadAction<{
                pullRequestId: string;
                commentId: string;
                content: string;
            }>
        ) => {
            const pr = state.pullRequests.find((p) => p._id === action.payload.pullRequestId);
            if (pr) {
                const comment = pr.comments.find((c) => c._id === action.payload.commentId);
                if (comment) {
                    comment.content = action.payload.content;
                }
            }
            if (state.currentPullRequest?._id === action.payload.pullRequestId) {
                const comment = state.currentPullRequest.comments.find(
                    (c) => c._id === action.payload.commentId
                );
                if (comment) {
                    comment.content = action.payload.content;
                }
            }
        },
        deleteComment: (
            state,
            action: PayloadAction<{ pullRequestId: string; commentId: string }>
        ) => {
            const pr = state.pullRequests.find((p) => p._id === action.payload.pullRequestId);
            if (pr) {
                pr.comments = pr.comments.filter((c) => c._id !== action.payload.commentId);
            }
            if (state.currentPullRequest?._id === action.payload.pullRequestId) {
                state.currentPullRequest.comments = state.currentPullRequest.comments.filter(
                    (c) => c._id !== action.payload.commentId
                );
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
    fetchPullRequestsStart,
    fetchPullRequestsSuccess,
    fetchPullRequestsFailure,
    setCurrentPullRequest,
    clearCurrentPullRequest,
    addPullRequest,
    updatePullRequest,
    deletePullRequest,
    addReview,
    addComment,
    updateComment,
    deleteComment,
    setPage,
    clearError,
} = pullRequestSlice.actions;

export default pullRequestSlice.reducer; 