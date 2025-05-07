import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Button,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Code as CodeIcon,
    BugReport as BugReportIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { repositoryAPI } from '../services/api';
import { Repository } from '../services/api/repository';
import FileBrowser from './FileBrowser';
import IssueList from './IssueList';

interface RepositoryDetailProps {
    repositoryId: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`repo-tabpanel-${index}`}
            aria-labelledby={`repo-tab-${index}`}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const RepositoryDetail: React.FC<RepositoryDetailProps> = ({ repositoryId }) => {
    const [repository, setRepository] = useState<Repository | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<number>(0);

    useEffect(() => {
        fetchRepository();
    }, [repositoryId]);

    const fetchRepository = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await repositoryAPI.getRepository(repositoryId);
            setRepository(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch repository');
        } finally {
            setLoading(false);
        }
    };

    const handleStar = async () => {
        if (!repository) return;

        try {
            if (repository.starred) {
                await repositoryAPI.unstarRepository(repositoryId);
            } else {
                await repositoryAPI.starRepository(repositoryId);
            }
            fetchRepository();
        } catch (err: any) {
            setError(err.message || 'Failed to update star status');
        }
    };

    const handleDelete = async () => {
        if (!repository) return;

        if (window.confirm('Are you sure you want to delete this repository?')) {
            try {
                await repositoryAPI.deleteRepository(repositoryId);
                // Navigate back to repository list
                window.location.href = '/repositories';
            } catch (err: any) {
                setError(err.message || 'Failed to delete repository');
            }
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!repository) {
        return <Typography>Repository not found</Typography>;
    }

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {repository.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {repository.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {repository.isPrivate && (
                                <Chip
                                    label="Private"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            <Chip
                                label={`${repository.stars} stars`}
                                size="small"
                                icon={<StarIcon />}
                            />
                            <Chip
                                label={`${repository.forks} forks`}
                                size="small"
                            />
                            <Chip
                                label={`Created ${format(new Date(repository.createdAt), 'MMM d, yyyy')}`}
                                size="small"
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleStar}>
                            {repository.starred ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={handleDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab icon={<CodeIcon />} label="Code" />
                    <Tab icon={<BugReportIcon />} label="Issues" />
                    <Tab icon={<PeopleIcon />} label="Collaborators" />
                    <Tab icon={<SettingsIcon />} label="Settings" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <FileBrowser
                    repositoryId={repositoryId}
                    defaultBranch={repository.defaultBranch}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <IssueList repositoryId={repositoryId} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography>Collaborators management coming soon...</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography>Repository settings coming soon...</Typography>
            </TabPanel>
        </Box>
    );
};

export default RepositoryDetail; 