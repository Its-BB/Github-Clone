import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Paper,
    Breadcrumbs,
    Link,
    IconButton,
    Chip,
    Stack,
    Menu,
    MenuItem,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Code,
    BugReport,
    CallSplit,
    Star,
    StarBorder,
    MoreVert,
    Lock,
    Public,
    History,
    Settings,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { repoAPI } from '../services/api';
import FileBrowser from '../components/FileBrowser';
import ReadmeViewer from '../components/ReadmeViewer';

interface Repository {
    id: string;
    name: string;
    owner: {
        username: string;
        avatar: string;
    };
    description?: string;
    isPrivate: boolean;
    language?: string;
    stars: number;
    forks: number;
    issues: number;
    pullRequests: number;
    defaultBranch: string;
    currentBranch: string;
    branches: string[];
    topics?: string[];
    readme?: string;
    permissions: {
        admin: boolean;
        push: boolean;
        pull: boolean;
    };
}

const Repository: React.FC = () => {
    const { owner, name } = useParams<{ owner: string; name: string }>();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [repository, setRepository] = useState<Repository | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isStarred, setIsStarred] = useState(false);

    useEffect(() => {
        const fetchRepository = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await repoAPI.getOne(owner!, name!);
                setRepository(response.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message || 'Failed to load repository information.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRepository();
    }, [owner, name]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleStar = async () => {
        try {
            await repoAPI.star(owner!, name!);
            setIsStarred(!isStarred);
            if (repository) {
                setRepository({
                    ...repository,
                    stars: isStarred ? repository.stars - 1 : repository.stars + 1,
                });
            }
        } catch (err: any) {
            // Handle error
        }
    };

    const handleFork = async () => {
        try {
            const response = await repoAPI.fork(owner!, name!);
            navigate(`/${currentUser?.username}/${name}`);
        } catch (err: any) {
            // Handle error
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

    if (!repository) {
        return null;
    }

    return (
        <Container>
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Breadcrumbs sx={{ flex: 1 }}>
                        <Link
                            color="inherit"
                            href={`/${repository.owner.username}`}
                            underline="hover"
                        >
                            {repository.owner.username}
                        </Link>
                        <Typography color="text.primary">{repository.name}</Typography>
                    </Breadcrumbs>
                    <Stack direction="row" spacing={1}>
                        {repository.isPrivate ? (
                            <Chip
                                icon={<Lock fontSize="small" />}
                                label="Private"
                                size="small"
                            />
                        ) : (
                            <Chip
                                icon={<Public fontSize="small" />}
                                label="Public"
                                size="small"
                            />
                        )}
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={isStarred ? <Star /> : <StarBorder />}
                            onClick={handleStar}
                        >
                            {isStarred ? 'Unstar' : 'Star'}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CallSplit />}
                            onClick={handleFork}
                        >
                            Fork
                        </Button>
                        {repository.permissions.admin && (
                            <>
                                <IconButton size="small" onClick={handleMenuClick}>
                                    <MoreVert />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={() => navigate('settings')}>
                                        <Settings fontSize="small" sx={{ mr: 1 }} />
                                        Settings
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Stack>
                </Box>

                {repository.description && (
                    <Typography color="textSecondary" paragraph>
                        {repository.description}
                    </Typography>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab
                            icon={<Code sx={{ mr: 1 }} />}
                            iconPosition="start"
                            label="Code"
                        />
                        <Tab
                            icon={<BugReport sx={{ mr: 1 }} />}
                            iconPosition="start"
                            label={`Issues ${repository.issues}`}
                        />
                        <Tab
                            icon={<CallSplit sx={{ mr: 1 }} />}
                            iconPosition="start"
                            label={`Pull Requests ${repository.pullRequests}`}
                        />
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <>
                        <Paper variant="outlined" sx={{ mb: 3 }}>
                            <FileBrowser
                                owner={owner!}
                                name={name!}
                                branch={repository.currentBranch}
                                branches={repository.branches}
                            />
                        </Paper>
                        {repository.readme && (
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <ReadmeViewer content={repository.readme} />
                            </Paper>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Repository; 