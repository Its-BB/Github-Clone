import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Link,
    IconButton,
    Stack,
} from '@mui/material';
import {
    Star,
    CallSplit as Fork,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Repository {
    id: string;
    name: string;
    owner: {
        username: string;
    };
    description?: string;
    language?: string;
    isPrivate: boolean;
    stars: number;
    forks: number;
    updatedAt: string;
    topics?: string[];
}

interface RepositoryCardProps {
    repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                    }}
                >
                    <Box>
                        <Link
                            component={RouterLink}
                            to={`/${repository.owner.username}/${repository.name}`}
                            color="primary"
                            underline="hover"
                            sx={{ typography: 'h6', mb: 1, display: 'inline-block' }}
                        >
                            {repository.name}
                        </Link>
                        {repository.isPrivate && (
                            <Chip
                                label="Private"
                                size="small"
                                sx={{ ml: 1, backgroundColor: 'grey.300' }}
                            />
                        )}
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small">
                                <Star fontSize="small" />
                            </IconButton>
                            <Typography variant="body2">{repository.stars}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton size="small">
                                <Fork fontSize="small" />
                            </IconButton>
                            <Typography variant="body2">{repository.forks}</Typography>
                        </Box>
                    </Stack>
                </Box>
                {repository.description && (
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                        {repository.description}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    {repository.language && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <CircleIcon
                                sx={{ fontSize: 12, mr: 0.5, color: getLanguageColor(repository.language) }}
                            />
                            <Typography variant="body2">{repository.language}</Typography>
                        </Box>
                    )}
                    {repository.topics?.map((topic) => (
                        <Chip
                            key={topic}
                            label={topic}
                            size="small"
                            sx={{ backgroundColor: 'primary.50', color: 'primary.main' }}
                        />
                    ))}
                    <Typography variant="body2" color="textSecondary">
                        Updated {format(new Date(repository.updatedAt), 'MMM d, yyyy')}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

// Function to get color for programming language
const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
        JavaScript: '#f1e05a',
        TypeScript: '#2b7489',
        Python: '#3572A5',
        Java: '#b07219',
        Ruby: '#701516',
        Go: '#00ADD8',
        Rust: '#dea584',
        // Add more languages and their colors as needed
    };

    return colors[language] || '#6e7681'; // Default color for unknown languages
};

export default RepositoryCard; 