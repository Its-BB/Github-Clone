import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { repositoryAPI } from '../../services/api';

const COMMON_LANGUAGES = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Ruby',
    'Go',
    'Rust',
    'PHP',
];

const CreateRepository: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        language: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
    ) => {
        const { name, value, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'isPrivate' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await repositoryAPI.create({
                name: formData.name,
                description: formData.description,
                isPrivate: formData.isPrivate,
            });

            navigate(`/${user?.username}/${response.data.name}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create repository');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create a new repository
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Repository name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        margin="normal"
                        helperText="This will be the name of your repository"
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={3}
                        helperText="Add a description to help others understand your project"
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Primary language</InputLabel>
                        <Select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            label="Primary language"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {COMMON_LANGUAGES.map((lang) => (
                                <MenuItem key={lang} value={lang}>
                                    {lang}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isPrivate}
                                onChange={handleChange}
                                name="isPrivate"
                            />
                        }
                        label="Make this repository private"
                        sx={{ mt: 2 }}
                    />

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create repository'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateRepository; 