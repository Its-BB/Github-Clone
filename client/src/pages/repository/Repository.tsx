import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Grid,
    Chip,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    ForkRight as ForkIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { repositoryAPI } from '../../services/api';
import FileBrowser from '../../components/FileBrowser';
import ReadmeViewer from '../../components/ReadmeViewer';

interface Repository {
    id: string;
    name: string;
    description: string;
    owner: {
        username: string;
    };
    stars: number;
    forks: number;
    language: string;
    updatedAt: string;
    isPrivate: boolean;
    defaultBranch: string;
}

const Repository: React.FC = () => {
    const { owner, repo } = useParams<{ owner: string; repo: string }>();
    const [repository, setRepository] = useState<Repository | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isStarred, setIsStarred] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchRepository = async () => {
            try {
                setLoading(true);
                const response = await repositoryAPI.getOne(owner!, repo!);
                setRepository(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch repository');
            } finally {
                setLoading(false);
            }
        };

        fetchRepository();
    }, [owner, repo]);

    const handleStarClick = async () => {
        if (!repository) return;

        try {
            if (isStarred) {
                await repositoryAPI.unstar(owner!, repo!);
                setRepository({
                    ...repository,
                    stars: repository.stars - 1,
                });
            } else {
                await repositoryAPI.star(owner!, repo!);
                setRepository({
                    ...repository,
                    stars: repository.stars + 1,
                });
            }
            setIsStarred(!isStarred);
        } catch (err: any) {
            setError(err.message || 'Failed to update star status');
        }
    };

    const handleForkClick = async () => {
        try {
            await repositoryAPI.fork(owner!, repo!);
            // Handle successful fork
        } catch (err: any) {
            setError(err.message || 'Failed to fork repository');
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    if (loading) {
        return (
            <Container>
                <Typography>Loading repository...</Typography>
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

    if (!repository) {
        return (
            <Container>
                <Typography>Repository not found</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <Typography variant="h4" component="h1">
                            {repository.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {repository.description}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            startIcon={isStarred ? <StarIcon /> : <StarBorderIcon />}
                            onClick={handleStarClick}
                            sx={{ mr: 1 }}
                        >
                            Star {repository.stars}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ForkIcon />}
                            onClick={handleForkClick}
                            sx={{ mr: 1 }}
                        >
                            Fork {repository.forks}
                        </Button>
                        {user?.username === repository.owner.username && (
                            <>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleMenuClose}>
                                        Settings
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose}>
                                        Delete Repository
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Chip
                        label={repository.language}
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    <Chip
                        label={repository.isPrivate ? 'Private' : 'Public'}
                        size="small"
                        color={repository.isPrivate ? 'default' : 'primary'}
                    />
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <FileBrowser
                        owner={owner!}
                        repo={repo!}
                        defaultBranch={repository.defaultBranch}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ReadmeViewer
                        owner={owner!}
                        repo={repo!}
                        defaultBranch={repository.defaultBranch}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Repository; 