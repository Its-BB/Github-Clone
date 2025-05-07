import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container,
    Box,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    Paper,
    Autocomplete,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { RootState } from '../store';
import { repoAPI } from '../services/api';

const COMMON_LANGUAGES = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'Ruby',
    'Go',
    'Rust',
    'PHP',
    'C#',
];

const COMMON_TOPICS = [
    'web',
    'api',
    'cli',
    'database',
    'framework',
    'library',
    'tool',
    'testing',
    'documentation',
    'template',
];

const CreateRepository: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [language, setLanguage] = useState<string | null>(null);
    const [topics, setTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const validateName = (value: string) => {
        if (!value) {
            return 'Repository name is required';
        }
        if (!/^[a-zA-Z0-9_.-]+$/.test(value)) {
            return 'Repository name can only contain letters, numbers, hyphens, underscores, and periods';
        }
        if (value.length > 100) {
            return 'Repository name cannot exceed 100 characters';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const nameValidationError = validateName(name);
        if (nameValidationError) {
            setNameError(nameValidationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await repoAPI.create({
                name,
                description,
                isPrivate,
                language: language || undefined,
                topics,
            });

            navigate(`/${currentUser?.username}/${name}`);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to create repository.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create a new repository
                </Typography>
                <Paper sx={{ p: 3, mt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Repository name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError(null);
                            }}
                            error={Boolean(nameError)}
                            helperText={
                                nameError ||
                                'Great repository names are short and memorable.'
                            }
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            helperText="Describe your repository (optional)"
                            sx={{ mb: 3 }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                            }
                            label="Private repository"
                            sx={{ mb: 3, display: 'block' }}
                        />
                        <Autocomplete
                            options={COMMON_LANGUAGES}
                            value={language}
                            onChange={(event, newValue) => setLanguage(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Primary language"
                                    helperText="Select the main programming language (optional)"
                                    sx={{ mb: 3 }}
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            freeSolo
                            options={COMMON_TOPICS}
                            value={topics}
                            onChange={(event, newValue) => setTopics(newValue)}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={option}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Topics"
                                    helperText="Add topics to help others find your repository (optional)"
                                    sx={{ mb: 3 }}
                                />
                            )}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Create repository'
                            )}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default CreateRepository; 