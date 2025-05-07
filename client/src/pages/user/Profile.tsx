import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Grid,
    Paper,
    Avatar,
    Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';
import { repositoryAPI } from '../../services/api';
import RepositoryCard from '../../components/RepositoryCard';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

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
}

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [tabValue, setTabValue] = useState(0);
    const [profile, setProfile] = useState<any>(null);
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await authAPI.getProfile();
                setProfile(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        const fetchRepositories = async () => {
            try {
                const response = await repositoryAPI.getAll({ owner: username });
                setRepositories(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch repositories');
            }
        };

        fetchProfile();
        fetchRepositories();
    }, [username]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Container>
                <Typography>Loading profile...</Typography>
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

    return (
        <Container>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar
                            sx={{ width: 100, height: 100 }}
                            src={profile?.avatarUrl}
                        />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" component="h1">
                            {profile?.username}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {profile?.bio || 'No bio provided'}
                        </Typography>
                        {user?.username === username && (
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => {/* Handle edit profile */ }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Repositories" />
                    <Tab label="Stars" />
                    <Tab label="Followers" />
                    <Tab label="Following" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {repositories.map((repo) => (
                        <Grid item xs={12} sm={6} md={4} key={repo.id}>
                            <RepositoryCard
                                name={repo.name}
                                description={repo.description}
                                owner={repo.owner.username}
                                stars={repo.stars}
                                forks={repo.forks}
                                language={repo.language}
                                updatedAt={repo.updatedAt}
                            />
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography>Starred repositories will appear here</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography>Followers will appear here</Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography>Following users will appear here</Typography>
            </TabPanel>
        </Container>
    );
};

export default Profile; 