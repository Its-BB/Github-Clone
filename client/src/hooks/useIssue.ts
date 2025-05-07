import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
    getAllIssues,
    getIssue,
    createIssue,
    updateIssue,
    lockIssue,
    unlockIssue,
    getComments,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
} from '../store/slices/issueSlice';
import { CreateIssueParams, UpdateIssueParams, CreateCommentParams, UpdateCommentParams, ReactionType } from '../services/api/issue';

export const useIssue = () => {
    const dispatch = useAppDispatch();
    const { issues, currentIssue, comments, loading, error } = useAppSelector((state) => state.issue);

    const handleGetAllIssues = (repositoryId: string) => {
        return dispatch(getAllIssues(repositoryId));
    };

    const handleGetIssue = (repositoryId: string, issueNumber: number) => {
        return dispatch(getIssue({ repositoryId, issueNumber }));
    };

    const handleCreateIssue = (repositoryId: string, data: CreateIssueParams) => {
        return dispatch(createIssue({ repositoryId, data }));
    };

    const handleUpdateIssue = (repositoryId: string, issueNumber: number, data: UpdateIssueParams) => {
        return dispatch(updateIssue({ repositoryId, issueNumber, data }));
    };

    const handleLockIssue = (repositoryId: string, issueNumber: number) => {
        return dispatch(lockIssue({ repositoryId, issueNumber }));
    };

    const handleUnlockIssue = (repositoryId: string, issueNumber: number) => {
        return dispatch(unlockIssue({ repositoryId, issueNumber }));
    };

    const handleGetComments = (repositoryId: string, issueNumber: number) => {
        return dispatch(getComments({ repositoryId, issueNumber }));
    };

    const handleCreateComment = (repositoryId: string, issueNumber: number, data: CreateCommentParams) => {
        return dispatch(createComment({ repositoryId, issueNumber, data }));
    };

    const handleUpdateComment = (repositoryId: string, issueNumber: number, commentId: number, data: UpdateCommentParams) => {
        return dispatch(updateComment({ repositoryId, issueNumber, commentId, data }));
    };

    const handleDeleteComment = (repositoryId: string, issueNumber: number, commentId: number) => {
        return dispatch(deleteComment({ repositoryId, issueNumber, commentId }));
    };

    const handleAddReaction = (repositoryId: string, issueNumber: number, commentId: number, reaction: ReactionType) => {
        return dispatch(addReaction({ repositoryId, issueNumber, commentId, reaction }));
    };

    return {
        issues,
        currentIssue,
        comments,
        loading,
        error,
        getAllIssues: handleGetAllIssues,
        getIssue: handleGetIssue,
        createIssue: handleCreateIssue,
        updateIssue: handleUpdateIssue,
        lockIssue: handleLockIssue,
        unlockIssue: handleUnlockIssue,
        getComments: handleGetComments,
        createComment: handleCreateComment,
        updateComment: handleUpdateComment,
        deleteComment: handleDeleteComment,
        addReaction: handleAddReaction,
    };
}; 