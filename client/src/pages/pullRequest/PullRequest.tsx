import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { pullRequestAPI } from '../../services/api';

interface PullRequestData {
    number: number;
    title: string;
    description: string;
    state: 'open' | 'closed' | 'merged';
    author: {
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    head: {
        branch: string;
        commit: string;
    };
    base: {
        branch: string;
        commit: string;
    };
}

const PullRequest: React.FC = () => {
    const { owner, repo, number } = useParams<{ owner: string; repo: string; number: string }>();
    const [pullRequest, setPullRequest] = useState<PullRequestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPullRequest = async () => {
            if (!owner || !repo || !number) return;

            try {
                setLoading(true);
                const response = await pullRequestAPI.getOne(owner, repo, parseInt(number));
                setPullRequest(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch pull request');
            } finally {
                setLoading(false);
            }
        };

        fetchPullRequest();
    }, [owner, repo, number]);

    if (loading) {
        return (
            <Container>
                <Typography>Loading pull request...</Typography>
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

    if (!pullRequest) {
        return (
            <Container>
                <Typography>Pull request not found</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {pullRequest.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    #{pullRequest.number} opened by {pullRequest.author.username}
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {pullRequest.description}
                </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Branch Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle2">Base Branch</Typography>
                        <Typography>{pullRequest.base.branch}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2">Compare Branch</Typography>
                        <Typography>{pullRequest.head.branch}</Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PullRequest; 