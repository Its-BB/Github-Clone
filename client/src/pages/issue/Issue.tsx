import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Box,
    Chip,
    Button,
    Grid,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { issueAPI } from '../../services/api';
import CommentList from '../../components/CommentList';
import MarkdownEditor from '../../components/MarkdownEditor';

interface Issue {
    id: string;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    locked: boolean;
    author: {
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    labels: string[];
    assignees: string[];
}

const Issue: React.FC = () => {
    const { owner, repo, number } = useParams<{ owner: string; repo: string; number: string }>();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                setLoading(true);
                const response = await issueAPI.getOne(owner!, repo!, parseInt(number!));
                setIssue(response.data);
                setEditContent(response.data.body);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch issue');
            } finally {
                setLoading(false);
            }
        };

        fetchIssue();
    }, [owner, repo, number]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
            setError(err.message || 'Failed to update lock status');
        }
    };

    const handleStateToggle = async () => {
        if (!issue) return;

        try {
            const newState = issue.state === 'open' ? 'closed' : 'open';
            await issueAPI.update(owner!, repo!, issue.number, {
                state: newState,
            });
            setIssue({
                ...issue,
                state: newState,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to update issue state');
        }
    };

    const handleEditSubmit = async () => {
        if (!issue) return;

        try {
            const response = await issueAPI.update(owner!, repo!, issue.number, {
                body: editContent,
            });
            setIssue(response.data);
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update issue');
        }
    };

    if (loading) {
        return (
            <Container>
                <Typography>Loading issue...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!issue) {
        return (
            <Container>
                <Typography>Issue not found</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Typography variant="h4" component="h1">
                            {issue.title}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Chip
                                label={issue.state}
                                color={issue.state === 'open' ? 'success' : 'default'}
                                size="small"
                                sx={{ mr: 1 }}
                            />
                            {issue.labels.map((label) => (
                                <Chip
                                    key={label}
                                    label={label}
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                            ))}
                        </Box>
                    </Grid>
                    <Grid item>
                        {user?.username === issue.author.username && (
                            <>
                                <IconButton onClick={() => setIsEditing(true)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleStateToggle}>
                                        {issue.state === 'open' ? 'Close' : 'Reopen'} Issue
                                    </MenuItem>
                                    <MenuItem onClick={handleLockToggle}>
                                        {issue.locked ? 'Unlock' : 'Lock'} Issue
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Grid>
                </Grid>

                {isEditing ? (
                    <Box sx={{ mt: 3 }}>
                        <MarkdownEditor
                            value={editContent}
                            onChange={setEditContent}
                            placeholder="Write your issue description here..."
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setIsEditing(false)}
                                sx={{ mr: 1 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleEditSubmit}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body1" component="div">
                            {issue.body}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <CommentList
                owner={owner!}
                repo={repo!}
                issueNumber={parseInt(number!)}
            />
        </Container>
    );
};

export default Issue; 