import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { repositoryAPI } from '../../services/api';
import type { Repository } from '../../services/api/repository';

interface RepositoryState {
    repositories: Repository[];
    currentRepository: Repository | null;
    loading: boolean;
    error: string | null;
}

const initialState: RepositoryState = {
    repositories: [],
    currentRepository: null,
    loading: false,
    error: null,
};

export const getAllRepositories = createAsyncThunk(
    'repository/getAll',
    async () => {
        const response = await repositoryAPI.getAllRepositories();
        return response.data;
    }
);

export const getRepository = createAsyncThunk(
    'repository/getOne',
    async (id: string) => {
        const response = await repositoryAPI.getRepository(id);
        return response.data;
    }
);

export const createRepository = createAsyncThunk(
    'repository/create',
    async (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => {
        const response = await repositoryAPI.createRepository(data);
        return response.data;
    }
);

export const updateRepository = createAsyncThunk(
    'repository/update',
    async ({ id, data }: { id: string; data: { name?: string; description?: string; isPrivate?: boolean } }) => {
        const response = await repositoryAPI.updateRepository(id, data);
        return response.data;
    }
);

export const deleteRepository = createAsyncThunk(
    'repository/delete',
    async (id: string) => {
        await repositoryAPI.deleteRepository(id);
        return id;
    }
);

export const starRepository = createAsyncThunk(
    'repository/star',
    async (id: string) => {
        const response = await repositoryAPI.starRepository(id);
        return response.data;
    }
);

export const unstarRepository = createAsyncThunk(
    'repository/unstar',
    async (id: string) => {
        const response = await repositoryAPI.unstarRepository(id);
        return response.data;
    }
);

export const forkRepository = createAsyncThunk(
    'repository/fork',
    async (id: string) => {
        const response = await repositoryAPI.forkRepository(id);
        return response.data;
    }
);

const repositorySlice = createSlice({
    name: 'repository',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get all repositories
            .addCase(getAllRepositories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllRepositories.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = action.payload;
            })
            .addCase(getAllRepositories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch repositories';
            })
            // Get single repository
            .addCase(getRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRepository = action.payload;
            })
            .addCase(getRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch repository';
            })
            // Create repository
            .addCase(createRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories.push(action.payload);
            })
            .addCase(createRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create repository';
            })
            // Update repository
            .addCase(updateRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = state.repositories.map(repo =>
                    repo.id === action.payload.id ? action.payload : repo
                );
                if (state.currentRepository?.id === action.payload.id) {
                    state.currentRepository = action.payload;
                }
            })
            .addCase(updateRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update repository';
            })
            // Delete repository
            .addCase(deleteRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = state.repositories.filter(repo => repo.id !== action.payload);
                if (state.currentRepository?.id === action.payload) {
                    state.currentRepository = null;
                }
            })
            .addCase(deleteRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete repository';
            })
            // Star repository
            .addCase(starRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(starRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = state.repositories.map(repo =>
                    repo.id === action.payload.id ? action.payload : repo
                );
                if (state.currentRepository?.id === action.payload.id) {
                    state.currentRepository = action.payload;
                }
            })
            .addCase(starRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to star repository';
            })
            // Unstar repository
            .addCase(unstarRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unstarRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories = state.repositories.map(repo =>
                    repo.id === action.payload.id ? action.payload : repo
                );
                if (state.currentRepository?.id === action.payload.id) {
                    state.currentRepository = action.payload;
                }
            })
            .addCase(unstarRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to unstar repository';
            })
            // Fork repository
            .addCase(forkRepository.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forkRepository.fulfilled, (state, action) => {
                state.loading = false;
                state.repositories.push(action.payload);
            })
            .addCase(forkRepository.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fork repository';
            });
    },
});

export default repositorySlice.reducer; 