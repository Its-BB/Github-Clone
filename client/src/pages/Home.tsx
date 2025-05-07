import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import RepositoryCard from '../components/RepositoryCard';
import { repositoryAPI } from '../services/api';

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

const Home: React.FC = () => {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchRepositories = async () => {
            try {
                setLoading(true);
                const response = await repositoryAPI.getAll();
                setRepositories(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch repositories');
            } finally {
                setLoading(false);
            }
        };

        fetchRepositories();
    }, []);

    if (loading) {
        return (
            <Container>
                <Typography>Loading repositories...</Typography>
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to GitHub Clone
                </Typography>
                {user ? (
                    <Typography variant="body1">
                        Welcome back, {user.username}!
                    </Typography>
                ) : (
                    <Typography variant="body1">
                        Sign in to create and manage your repositories.
                    </Typography>
                )}
            </Box>

            <Typography variant="h5" component="h2" gutterBottom>
                Popular Repositories
            </Typography>

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
        </Container>
    );
};

export default Home; 