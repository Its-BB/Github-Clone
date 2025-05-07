import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    darkMode: boolean;
    sidebarOpen: boolean;
    notifications: {
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
        id: string;
    }[];
    loading: {
        [key: string]: boolean;
    };
}

const initialState: UIState = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: true,
    notifications: [],
    loading: {},
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
            localStorage.setItem('darkMode', state.darkMode.toString());
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        addNotification: (
            state,
            action: PayloadAction<{
                message: string;
                type: 'success' | 'error' | 'info' | 'warning';
            }>
        ) => {
            const id = Date.now().toString();
            state.notifications.push({
                ...action.payload,
                id,
            });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
        setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
            state.loading[action.payload.key] = action.payload.value;
        },
    },
});

export const {
    toggleDarkMode,
    toggleSidebar,
    addNotification,
    removeNotification,
    setLoading,
} = uiSlice.actions;

export default uiSlice.reducer; 