import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Grid,
    Box,
    Typography,
    Avatar,
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    LocationOn,
    Link as LinkIcon,
    Email,
    CalendarToday,
    Book,
    Star,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { authAPI } from '../services/api';
import { repoAPI } from '../services/api';
import RepositoryCard from '../components/RepositoryCard';

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
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [profile, setProfile] = useState<any>(null);
    const [repositories, setRepositories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                const [profileRes, reposRes] = await Promise.all([
                    authAPI.getProfile(),
                    repoAPI.getByUser(username!),
                ]);

                setProfile(profileRes.data);
                setRepositories(reposRes.data.repositories);
            } catch (err: any) {
                setError(
                    err.response?.data?.message || 'Failed to load profile information.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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

    if (!profile) {
        return null;
    }

    return (
        <Container>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Avatar
                                src={profile.avatar}
                                alt={profile.username}
                                sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                            />
                            <Typography variant="h5" gutterBottom>
                                {profile.username}
                            </Typography>
                            {profile.bio && (
                                <Typography color="textSecondary" paragraph>
                                    {profile.bio}
                                </Typography>
                            )}
                        </Box>
                        <List>
                            {profile.location && (
                                <ListItem>
                                    <ListItemIcon>
                                        <LocationOn />
                                    </ListItemIcon>
                                    <ListItemText primary={profile.location} />
                                </ListItem>
                            )}
                            {profile.website && (
                                <ListItem>
                                    <ListItemIcon>
                                        <LinkIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <a
                                                href={profile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'none' }}
                                            >
                                                {profile.website}
                                            </a>
                                        }
                                    />
                                </ListItem>
                            )}
                            <ListItem>
                                <ListItemIcon>
                                    <Email />
                                </ListItemIcon>
                                <ListItemText primary={profile.email} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CalendarToday />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`Joined ${format(
                                        new Date(profile.createdAt),
                                        'MMMM yyyy'
                                    )}`}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab
                                icon={<Book sx={{ mr: 1 }} />}
                                iconPosition="start"
                                label={`Repositories (${repositories.length})`}
                            />
                            <Tab
                                icon={<Star sx={{ mr: 1 }} />}
                                iconPosition="start"
                                label="Starred"
                            />
                        </Tabs>
                    </Box>
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={2}>
                            {repositories.map((repo) => (
                                <Grid item xs={12} key={repo.id}>
                                    <RepositoryCard repository={repo} />
                                </Grid>
                            ))}
                            {repositories.length === 0 && (
                                <Grid item xs={12}>
                                    <Typography color="textSecondary" align="center">
                                        No repositories found.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <Typography color="textSecondary" align="center">
                            Starred repositories will be shown here.
                        </Typography>
                    </TabPanel>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile; 