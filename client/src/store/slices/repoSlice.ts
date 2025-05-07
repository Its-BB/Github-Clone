import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface RepoState {
    repositories: Repository[];
    currentRepo: Repository | null;
    loading: boolean;
    error: string | null;
}

const initialState: RepoState = {
    repositories: [],
    currentRepo: null,
    loading: false,
    error: null,
};

const repoSlice = createSlice({
    name: 'repo',
    initialState,
    reducers: {
        setRepositories: (state, action: PayloadAction<Repository[]>) => {
            state.repositories = action.payload;
            state.loading = false;
            state.error = null;
        },
        setCurrentRepo: (state, action: PayloadAction<Repository>) => {
            state.currentRepo = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setRepositories,
    setCurrentRepo,
    setLoading,
    setError,
    clearError,
} = repoSlice.actions;

export default repoSlice.reducer; 