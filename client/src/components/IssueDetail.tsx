import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { issueAPI } from '../services/api';
import type { Issue, Comment, ReactionType } from '../services/api/issue';

interface IssueDetailProps {
    owner: string;
    repo: string;
    issueNumber: number;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ owner, repo, issueNumber }) => {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>('');
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editText, setEditText] = useState<string>('');

    useEffect(() => {
        fetchIssue();
        fetchComments();
    }, [owner, repo, issueNumber]);

    const fetchIssue = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await issueAPI.get(owner, repo, issueNumber);
            setIssue(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch issue');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await issueAPI.getComments(owner, repo, issueNumber);
            setComments(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch comments');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await issueAPI.createComment(owner, repo, issueNumber, { body: newComment });
            setNewComment('');
            fetchComments();
        } catch (err: any) {
            setError(err.message || 'Failed to add comment');
        }
    };

    const handleEditComment = async (commentId: number) => {
        if (!editText.trim()) return;

        try {
            await issueAPI.updateComment(owner, repo, issueNumber, commentId, { body: editText });
            setEditingComment(null);
            setEditText('');
            fetchComments();
        } catch (err: any) {
            setError(err.message || 'Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await issueAPI.deleteComment(owner, repo, issueNumber, commentId);
                setComments(comments.filter(comment => comment.id !== commentId));
            } catch (err: any) {
                setError(err.message || 'Failed to delete comment');
            }
        }
    };

    const handleAddReaction = async (commentId: number, reactionType: ReactionType) => {
        try {
            await issueAPI.addReaction(owner, repo, issueNumber, commentId, reactionType);
            fetchComments(); // Refresh comments to get updated reactions
        } catch (err: any) {
            setError(err.message || 'Failed to add reaction');
        }
    };

    const handleLock = async () => {
        if (!issue) return;

        try {
            if (issue.locked) {
                await issueAPI.unlock(owner, repo, issueNumber);
            } else {
                await issueAPI.lock(owner, repo, issueNumber);
            }
            fetchIssue();
        } catch (err: any) {
            setError(err.message || 'Failed to update issue lock status');
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!issue) {
        return <Typography>Issue not found</Typography>;
    }

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {issue.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            #{issue.number} opened {format(new Date(issue.createdAt), 'MMM d, yyyy')} by{' '}
                            {issue.author.username}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {issue.labels.map((label) => (
                                <Chip
                                    key={label.name}
                                    label={label.name}
                                    size="small"
                                    sx={{ backgroundColor: label.color }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <IconButton onClick={handleLock}>
                        {issue.locked ? <UnlockIcon /> : <LockIcon />}
                    </IconButton>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {issue.body}
                </Typography>
            </Paper>

            <Typography variant="h6" gutterBottom>
                Comments
            </Typography>

            <List>
                {comments.map((comment) => (
                    <React.Fragment key={comment.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar src={comment.author.avatar} alt={comment.author.username} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2">
                                            {comment.author.username}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        {editingComment === comment.id ? (
                                            <Box sx={{ mt: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                />
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleEditComment(comment.id)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingComment(null);
                                                            setEditText('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                                                >
                                                    {comment.body}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingComment(comment.id);
                                                            setEditText(comment.body);
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAddReaction(comment.id, 'thumbsUp')}
                                                    >
                                                        <ThumbUpIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAddReaction(comment.id, 'thumbsDown')}
                                                    >
                                                        <ThumbDownIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>

            <Box sx={{ mt: 3 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Add a comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        Comment
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default IssueDetail; 