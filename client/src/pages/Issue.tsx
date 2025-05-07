import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    Avatar,
    Divider,
    TextField,
    Stack,
    IconButton,
    Menu,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Label as LabelIcon,
    Person as PersonIcon,
    MoreVert,
    Lock,
    LockOpen,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { issueAPI } from '../services/api';
import MarkdownEditor from '../components/MarkdownEditor';
import CommentList from '../components/CommentList';

interface Issue {
    id: string;
    number: number;
    title: string;
    description: string;
    state: 'open' | 'closed';
    author: {
        username: string;
        avatar: string;
    };
    assignees: {
        username: string;
        avatar: string;
    }[];
    labels: string[];
    createdAt: string;
    updatedAt: string;
    locked: boolean;
    comments: number;
}

const Issue: React.FC = () => {
    const { owner, repo, number } = useParams<{
        owner: string;
        repo: string;
        number: string;
    }>();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        fetchIssue();
    }, [owner, repo, number]);

    const fetchIssue = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await issueAPI.getOne(owner!, repo!, parseInt(number!));
            setIssue(response.data);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to load issue information.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleStateChange = async () => {
        if (!issue) return;

        try {
            await issueAPI.update(owner!, repo!, issue.number, {
                state: issue.state === 'open' ? 'closed' : 'open',
            });
            setIssue({
                ...issue,
                state: issue.state === 'open' ? 'closed' : 'open',
            });
        } catch (err: any) {
            // Handle error
        }
        handleMenuClose();
    };

    const handleLockToggle = async () => {
        if (!issue) return;

        try {
            if (issue.locked) {
                await issueAPI.unlock(owner!, repo!, issue.number);
            } else {
                await issueAPI.lock(owner!, repo!, issue.number);
            }
            setIssue({
                ...issue,
                locked: !issue.locked,
            });
        } catch (err: any) {
            // Handle error
        }
        handleMenuClose();
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) return;

        try {
            setSubmitting(true);
            await issueAPI.addComment(owner!, repo!, parseInt(number!), {
                content: comment,
            });
            setComment('');
            fetchIssue();
        } catch (err: any) {
            // Handle error
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!issue) {
        return null;
    }

    return (
        <Container>
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" gutterBottom>
                            {issue.title} #{issue.number}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label={issue.state}
                                color={issue.state === 'open' ? 'success' : 'default'}
                                size="small"
                            />
                            <Typography variant="body2" color="textSecondary">
                                {issue.author.username} opened this issue on{' '}
                                {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                            </Typography>
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LabelIcon />}
                            onClick={() => { }}
                        >
                            Labels
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PersonIcon />}
                            onClick={() => { }}
                        >
                            Assignees
                        </Button>
                        <IconButton size="small" onClick={handleMenuClick}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleStateChange}>
                                {issue.state === 'open' ? 'Close issue' : 'Reopen issue'}
                            </MenuItem>
                            <MenuItem onClick={handleLockToggle}>
                                {issue.locked ? (
                                    <>
                                        <LockOpen fontSize="small" sx={{ mr: 1 }} />
                                        Unlock conversation
                                    </>
                                ) : (
                                    <>
                                        <Lock fontSize="small" sx={{ mr: 1 }} />
                                        Lock conversation
                                    </>
                                )}
                            </MenuItem>
                        </Menu>
                    </Stack>
                </Box>

                <Paper variant="outlined" sx={{ mb: 3 }}>
                    <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <Avatar
                            src={issue.author.avatar}
                            alt={issue.author.username}
                            sx={{ width: 40, height: 40 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    {issue.author.username}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body1"
                                sx={{ whiteSpace: 'pre-wrap' }}
                                gutterBottom
                            >
                                {issue.description}
                            </Typography>
                            {issue.labels.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    {issue.labels.map((label) => (
                                        <Chip
                                            key={label}
                                            label={label}
                                            size="small"
                                            sx={{ mr: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>

                <CommentList
                    owner={owner!}
                    repo={repo!}
                    issueNumber={parseInt(number!)}
                />

                {!issue.locked && (
                    <Paper variant="outlined" sx={{ mt: 3 }}>
                        <Box sx={{ p: 2 }}>
                            <MarkdownEditor
                                value={comment}
                                onChange={setComment}
                                placeholder="Leave a comment"
                                minRows={4}
                            />
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleCommentSubmit}
                                    disabled={!comment.trim() || submitting}
                                >
                                    {submitting ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        'Comment'
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default Issue; 