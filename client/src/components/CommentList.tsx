import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Avatar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { MoreVert, ThumbUp, ThumbDown, Mood } from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { issueAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import MarkdownEditor from './MarkdownEditor';

interface Comment {
    id: number;
    body: string;
    author: {
        username: string;
        avatarUrl: string;
    };
    createdAt: string;
    updatedAt: string;
    reactions: {
        thumbsUp: number;
        thumbsDown: number;
    };
}

interface CommentListProps {
    owner: string;
    repo: string;
    issueNumber: number;
}

const REACTION_TYPES = [
    { type: 'thumbs_up', icon: <ThumbUp fontSize="small" /> },
    { type: 'thumbs_down', icon: <ThumbDown fontSize="small" /> },
    { type: 'smile', icon: <Mood fontSize="small" /> },
];

const CommentList: React.FC<CommentListProps> = ({
    owner,
    repo,
    issueNumber,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchComments();
    }, [owner, repo, issueNumber]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await issueAPI.getComments(owner, repo, issueNumber);
            setComments(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommentId(null);
    };

    const handleEditClick = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.body);
        handleMenuClose();
    };

    const handleDeleteClick = async () => {
        if (!selectedCommentId) return;

        try {
            await issueAPI.deleteComment(owner, repo, selectedCommentId.toString());
            setComments(comments.filter(comment => comment.id !== selectedCommentId));
        } catch (err: any) {
            setError(err.message || 'Failed to delete comment');
        }
        handleMenuClose();
    };

    const handleEditSubmit = async () => {
        if (!editingCommentId) return;

        try {
            const response = await issueAPI.updateComment(owner, repo, editingCommentId.toString(), {
                body: editContent,
            });
            setComments(comments.map(comment =>
                comment.id === editingCommentId ? response.data : comment
            ));
            setEditingCommentId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update comment');
        }
    };

    const handleNewCommentSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await issueAPI.createComment(owner, repo, issueNumber, {
                body: newComment,
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (err: any) {
            setError(err.message || 'Failed to create comment');
        }
    };

    const handleReaction = async (commentId: number, reactionType: 'thumbsUp' | 'thumbsDown') => {
        try {
            const response = await issueAPI.addReaction(owner, repo, commentId.toString(), {
                type: reactionType
            });
            setComments(comments.map(comment =>
                comment.id === commentId ? response.data : comment
            ));
        } catch (err: any) {
            setError(err.message || 'Failed to add reaction');
        }
    };

    if (loading) {
        return <Typography>Loading comments...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box>
            {comments.map((comment) => (
                <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                            src={comment.author.avatarUrl}
                            alt={comment.author.username}
                            sx={{ mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2">
                                    {comment.author.username}
                                </Typography>
                                {user?.username === comment.author.username && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuClick(e, comment.id)}
                                    >
                                        <MoreVert />
                                    </IconButton>
                                )}
                            </Box>
                            {editingCommentId === comment.id ? (
                                <Box sx={{ mt: 1 }}>
                                    <MarkdownEditor
                                        value={editContent}
                                        onChange={setEditContent}
                                        placeholder="Edit your comment..."
                                    />
                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => setEditingCommentId(null)}
                                            sx={{ mr: 1 }}
                                        >
                                            Cancel
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={handleEditSubmit}
                                        >
                                            Save
                                        </IconButton>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {comment.body}
                                </Typography>
                            )}
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleReaction(comment.id, 'thumbsUp')}
                                >
                                    <ThumbUp />
                                </IconButton>
                                <Typography variant="caption" sx={{ mr: 2 }}>
                                    {comment.reactions.thumbsUp}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleReaction(comment.id, 'thumbsDown')}
                                >
                                    <ThumbDown />
                                </IconButton>
                                <Typography variant="caption">
                                    {comment.reactions.thumbsDown}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            ))}

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Write a comment
                </Typography>
                <MarkdownEditor
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Write your comment here..."
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                        onClick={handleNewCommentSubmit}
                        disabled={!newComment.trim()}
                    >
                        Comment
                    </IconButton>
                </Box>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleEditClick(comments.find(c => c.id === selectedCommentId)!)}>
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default CommentList; 