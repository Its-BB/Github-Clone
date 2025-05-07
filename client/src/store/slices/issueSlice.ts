import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { issueAPI } from '../../services/api';
import type { Issue, Comment } from '../../services/api/issue';

interface IssueState {
    issues: Issue[];
    currentIssue: Issue | null;
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

const initialState: IssueState = {
    issues: [],
    currentIssue: null,
    comments: [],
    loading: false,
    error: null,
};

export const getAllIssues = createAsyncThunk(
    'issue/getAll',
    async (repositoryId: string) => {
        const response = await issueAPI.getAllIssues(repositoryId);
        return response.data;
    }
);

export const getIssue = createAsyncThunk(
    'issue/getOne',
    async ({ repositoryId, issueNumber }: { repositoryId: string; issueNumber: number }) => {
        const response = await issueAPI.getIssue(repositoryId, issueNumber);
        return response.data;
    }
);

export const createIssue = createAsyncThunk(
    'issue/create',
    async ({ repositoryId, data }: { repositoryId: string; data: { title: string; body: string; labels?: string[]; assignees?: string[] } }) => {
        const response = await issueAPI.createIssue(repositoryId, data);
        return response.data;
    }
);

export const updateIssue = createAsyncThunk(
    'issue/update',
    async ({ repositoryId, issueNumber, data }: { repositoryId: string; issueNumber: number; data: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[]; assignees?: string[] } }) => {
        const response = await issueAPI.updateIssue(repositoryId, issueNumber, data);
        return response.data;
    }
);

export const lockIssue = createAsyncThunk(
    'issue/lock',
    async ({ repositoryId, issueNumber }: { repositoryId: string; issueNumber: number }) => {
        const response = await issueAPI.lockIssue(repositoryId, issueNumber);
        return response.data;
    }
);

export const unlockIssue = createAsyncThunk(
    'issue/unlock',
    async ({ repositoryId, issueNumber }: { repositoryId: string; issueNumber: number }) => {
        const response = await issueAPI.unlockIssue(repositoryId, issueNumber);
        return response.data;
    }
);

export const getComments = createAsyncThunk(
    'issue/getComments',
    async ({ repositoryId, issueNumber }: { repositoryId: string; issueNumber: number }) => {
        const response = await issueAPI.getComments(repositoryId, issueNumber);
        return response.data;
    }
);

export const createComment = createAsyncThunk(
    'issue/createComment',
    async ({ repositoryId, issueNumber, data }: { repositoryId: string; issueNumber: number; data: { body: string } }) => {
        const response = await issueAPI.createComment(repositoryId, issueNumber, data);
        return response.data;
    }
);

export const updateComment = createAsyncThunk(
    'issue/updateComment',
    async ({ repositoryId, issueNumber, commentId, data }: { repositoryId: string; issueNumber: number; commentId: number; data: { body: string } }) => {
        const response = await issueAPI.updateComment(repositoryId, issueNumber, commentId, data);
        return response.data;
    }
);

export const deleteComment = createAsyncThunk(
    'issue/deleteComment',
    async ({ repositoryId, issueNumber, commentId }: { repositoryId: string; issueNumber: number; commentId: number }) => {
        await issueAPI.deleteComment(repositoryId, issueNumber, commentId);
        return commentId;
    }
);

export const addReaction = createAsyncThunk(
    'issue/addReaction',
    async ({ repositoryId, issueNumber, commentId, reaction }: { repositoryId: string; issueNumber: number; commentId: number; reaction: 'thumbsUp' | 'thumbsDown' }) => {
        const response = await issueAPI.addReaction(repositoryId, issueNumber, commentId, reaction);
        return response.data;
    }
);

const issueSlice = createSlice({
    name: 'issue',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get all issues
            .addCase(getAllIssues.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllIssues.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = action.payload;
            })
            .addCase(getAllIssues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch issues';
            })
            // Get single issue
            .addCase(getIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.currentIssue = action.payload;
            })
            .addCase(getIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch issue';
            })
            // Create issue
            .addCase(createIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues.push(action.payload);
            })
            .addCase(createIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create issue';
            })
            // Update issue
            .addCase(updateIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = state.issues.map(issue =>
                    issue.id === action.payload.id ? action.payload : issue
                );
                if (state.currentIssue?.id === action.payload.id) {
                    state.currentIssue = action.payload;
                }
            })
            .addCase(updateIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update issue';
            })
            // Lock issue
            .addCase(lockIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(lockIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = state.issues.map(issue =>
                    issue.id === action.payload.id ? action.payload : issue
                );
                if (state.currentIssue?.id === action.payload.id) {
                    state.currentIssue = action.payload;
                }
            })
            .addCase(lockIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to lock issue';
            })
            // Unlock issue
            .addCase(unlockIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unlockIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = state.issues.map(issue =>
                    issue.id === action.payload.id ? action.payload : issue
                );
                if (state.currentIssue?.id === action.payload.id) {
                    state.currentIssue = action.payload;
                }
            })
            .addCase(unlockIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to unlock issue';
            })
            // Get comments
            .addCase(getComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(getComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            // Create comment
            .addCase(createComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.push(action.payload);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create comment';
            })
            // Update comment
            .addCase(updateComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = state.comments.map(comment =>
                    comment.id === action.payload.id ? action.payload : comment
                );
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update comment';
            })
            // Delete comment
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = state.comments.filter(comment => comment.id !== action.payload);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete comment';
            })
            // Add reaction
            .addCase(addReaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addReaction.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = state.comments.map(comment =>
                    comment.id === action.payload.id ? action.payload : comment
                );
            })
            .addCase(addReaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to add reaction';
            });
    },
});

export default issueSlice.reducer; 