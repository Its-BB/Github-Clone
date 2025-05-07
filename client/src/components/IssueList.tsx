import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { issueAPI } from '../services/api';
import { Issue, Comment } from '../services/api/issue';

interface IssueListProps {
    repositoryId: string;
}

const IssueList: React.FC<IssueListProps> = ({ repositoryId }) => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [title, setTitle] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [state, setState] = useState<'open' | 'closed'>('open');
    const [labels, setLabels] = useState<string[]>([]);
    const [assignees, setAssignees] = useState<string[]>([]);

    useEffect(() => {
        fetchIssues();
    }, [repositoryId]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            setError(null);
            const [owner, repo] = repositoryId.split('/');
            const response = await issueAPI.getAll(owner, repo);
            setIssues(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (issue?: Issue) => {
        if (issue) {
            setSelectedIssue(issue);
            setTitle(issue.title);
            setBody(issue.body || '');
            setState(issue.state);
            setLabels(issue.labels.map(label => label.name));
            setAssignees(issue.assignees.map(assignee => assignee.username));
        } else {
            setSelectedIssue(null);
            setTitle('');
            setBody('');
            setState('open');
            setLabels([]);
            setAssignees([]);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedIssue(null);
        setTitle('');
        setBody('');
        setState('open');
        setLabels([]);
        setAssignees([]);
    };

    const handleSubmit = async () => {
        try {
            const [owner, repo] = repositoryId.split('/');
            if (selectedIssue) {
                await issueAPI.update(owner, repo, selectedIssue.number, {
                    title,
                    body,
                    state,
                    labels,
                    assignees,
                });
            } else {
                await issueAPI.create(owner, repo, {
                    title,
                    body,
                    labels,
                    assignees,
                });
            }
            handleCloseDialog();
            fetchIssues();
        } catch (err: any) {
            setError(err.message || 'Failed to save issue');
        }
    };

    const handleDelete = async (issueNumber: number) => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            try {
                const [owner, repo] = repositoryId.split('/');
                await issueAPI.delete(owner, repo, issueNumber);
                fetchIssues();
            } catch (err: any) {
                setError(err.message || 'Failed to delete issue');
            }
        }
    };

    const handleLock = async (issueNumber: number, locked: boolean) => {
        try {
            const [owner, repo] = repositoryId.split('/');
            if (locked) {
                await issueAPI.unlock(owner, repo, issueNumber);
            } else {
                await issueAPI.lock(owner, repo, issueNumber);
            }
            fetchIssues();
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Issues</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Issue
                </Button>
            </Box>

            <List>
                {issues.map((issue) => (
                    <ListItem
                        key={issue.id}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                        }}
                    >
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1">{issue.title}</Typography>
                                    {issue.locked && <LockIcon fontSize="small" />}
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
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
                            }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(issue)}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleLock(issue.number, issue.locked)}
                            >
                                {issue.locked ? <UnlockIcon /> : <LockIcon />}
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(issue.number)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedIssue ? 'Edit Issue' : 'New Issue'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    {selectedIssue && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>State</InputLabel>
                            <Select
                                value={state}
                                onChange={(e: SelectChangeEvent) => setState(e.target.value as 'open' | 'closed')}
                                label="State"
                            >
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedIssue ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IssueList; 