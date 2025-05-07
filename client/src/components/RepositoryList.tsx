import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Chip,
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { repositoryAPI } from '../services/api';
import { Repository } from '../services/api/repository';

const RepositoryList: React.FC = () => {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isPrivate, setIsPrivate] = useState<boolean>(false);

    useEffect(() => {
        fetchRepositories();
    }, []);

    const fetchRepositories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await repositoryAPI.getAllRepositories();
            setRepositories(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch repositories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (repo?: Repository) => {
        if (repo) {
            setSelectedRepo(repo);
            setName(repo.name);
            setDescription(repo.description || '');
            setIsPrivate(repo.isPrivate);
        } else {
            setSelectedRepo(null);
            setName('');
            setDescription('');
            setIsPrivate(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRepo(null);
        setName('');
        setDescription('');
        setIsPrivate(false);
    };

    const handleSubmit = async () => {
        try {
            if (selectedRepo) {
                await repositoryAPI.updateRepository(selectedRepo.id, {
                    name,
                    description,
                    isPrivate,
                });
            } else {
                await repositoryAPI.createRepository({
                    name,
                    description,
                    isPrivate,
                });
            }
            handleCloseDialog();
            fetchRepositories();
        } catch (err: any) {
            setError(err.message || 'Failed to save repository');
        }
    };

    const handleDelete = async (repositoryId: string) => {
        if (window.confirm('Are you sure you want to delete this repository?')) {
            try {
                await repositoryAPI.deleteRepository(repositoryId);
                fetchRepositories();
            } catch (err: any) {
                setError(err.message || 'Failed to delete repository');
            }
        }
    };

    const handleStar = async (repositoryId: string, starred: boolean) => {
        try {
            if (starred) {
                await repositoryAPI.unstarRepository(repositoryId);
            } else {
                await repositoryAPI.starRepository(repositoryId);
            }
            fetchRepositories();
        } catch (err: any) {
            setError(err.message || 'Failed to update star status');
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
                <Typography variant="h6">Repositories</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Repository
                </Button>
            </Box>

            <List>
                {repositories.map((repo) => (
                    <ListItem
                        key={repo.id}
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
                                    <Typography variant="subtitle1">{repo.name}</Typography>
                                    {repo.isPrivate && (
                                        <Chip
                                            label="Private"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {repo.description}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Created {format(new Date(repo.createdAt), 'MMM d, yyyy')} ·{' '}
                                        {repo.stars} stars · {repo.forks} forks
                                    </Typography>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleStar(repo.id, repo.starred)}
                                >
                                    {repo.starred ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(repo)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDelete(repo.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedRepo ? 'Edit Repository' : 'New Repository'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                        }
                        label="Private"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedRepo ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RepositoryList; 